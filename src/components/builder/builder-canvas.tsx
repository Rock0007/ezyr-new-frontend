"use client";

import { useDraggable, useDroppable } from "@dnd-kit/core";
import { Button, Tooltip, Typography } from "antd";
import { Grid2X2, Maximize2, Minus, Plus, RotateCcw } from "lucide-react";
import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
} from "react";
import type { AppNode } from "@/schemas/app-spec";
import {
  CANVAS_STAGE_SIZE,
  CANVAS_ZOOM_STEP,
  clampZoom,
  getPanForZoomAtPoint,
  getViewportCenter,
} from "@/features/builder/canvas";
import { BUILDER_CANVAS_DROP_ZONE_ID } from "@/features/builder/dnd";
import { selectActiveRootNode } from "@/features/builder/state/selectors";
import { useAppDispatch } from "@/hooks/use-app-dispatch";
import { useAppSelector } from "@/hooks/use-app-selector";
import { rendererRegistry } from "@/registry/renderer";
import {
  resetCanvasViewport,
  setCanvasPan,
  setZoom,
  toggleGrid,
  toggleSnapToGrid,
} from "@/store/slices/builder-slice";
import { selectOne, setHoveredId } from "@/store/slices/selection-slice";
import { cn } from "@/utils/cn";

const viewportWidthPx = {
  desktop: 960,
  tablet: 720,
  mobile: 390,
};

type EditableNodeProps = {
  node: AppNode;
  rootNodeId: string;
  selectedIds: readonly string[];
  hoveredId: string | null;
  dropTargetId: string | null;
  isDropValid: boolean;
  onSelect: (nodeId: string) => void;
  onHover: (nodeId: string | null) => void;
};

const EditableNode = memo(function EditableNode({
  node,
  rootNodeId,
  selectedIds,
  hoveredId,
  dropTargetId,
  isDropValid,
  onSelect,
  onHover,
}: EditableNodeProps) {
  const isRoot = node.id === rootNodeId;
  const { isOver, setNodeRef: setDropNodeRef } = useDroppable({
    id: node.id,
    data: { sourceKind: "node-drop-target", nodeId: node.id },
  });
  const {
    attributes,
    listeners,
    setNodeRef: setDragNodeRef,
    isDragging,
  } = useDraggable({
    id: `node-drag-${node.id}`,
    data: { sourceKind: "node", nodeId: node.id },
    disabled: isRoot,
  });
  const setNodeRef = useCallback(
    (element: HTMLDivElement | null) => {
      setDropNodeRef(element);
      setDragNodeRef(element);
    },
    [setDropNodeRef, setDragNodeRef],
  );
  const renderer = rendererRegistry.resolve(node.type);
  const children = node.children.map((child) => (
    <EditableNode
      key={child.id}
      node={child}
      rootNodeId={rootNodeId}
      selectedIds={selectedIds}
      hoveredId={hoveredId}
      dropTargetId={dropTargetId}
      isDropValid={isDropValid}
      onSelect={onSelect}
      onHover={onHover}
    />
  ));
  const rendered = renderer?.render(node, children) ?? (
    <div data-ezyr-runtime-error="missing-renderer">
      Missing renderer for {node.type}
    </div>
  );

  const handleClick = (event: MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
    onSelect(node.id);
  };
  const dragProps = isRoot ? {} : { ...listeners, ...attributes };

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "builder-editable-node group relative rounded-sm outline-offset-2 transition",
        !isRoot && "cursor-grab active:cursor-grabbing",
        selectedIds.includes(node.id) && "outline outline-2 outline-[#0f8ca8]",
        hoveredId === node.id &&
          !selectedIds.includes(node.id) &&
          "outline outline-1 outline-[#8bd9e7]",
        (isOver || dropTargetId === node.id) &&
          (isDropValid
            ? "ring-2 ring-[#18a8c7] ring-offset-2"
            : "ring-2 ring-[#d92d20] ring-offset-2"),
        isDragging && "opacity-35",
      )}
      data-node-id={node.id}
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onMouseEnter={() => onHover(node.id)}
      onMouseLeave={() => onHover(null)}
      {...dragProps}
    >
      {rendered as ReactNode}
    </div>
  );
});

export function BuilderCanvas() {
  const dispatch = useAppDispatch();
  const viewportElementRef = useRef<HTMLDivElement>(null);
  const panSessionRef = useRef<{
    pointerId: number;
    start: { x: number; y: number };
    pan: { x: number; y: number };
    moved: boolean;
  } | null>(null);
  const suppressNextClickRef = useRef(false);
  const isSpacePressedRef = useRef(false);
  const [isPanning, setIsPanning] = useState(false);
  const { isOver: isCanvasOver, setNodeRef: setCanvasDropRef } = useDroppable({
    id: BUILDER_CANVAS_DROP_ZONE_ID,
    data: { kind: "canvas" },
  });
  const {
    viewport,
    zoom,
    canvasPan,
    isGridVisible,
    snapToGrid,
    gridSize,
  } = useAppSelector((state) => state.builder);
  const activeRootNode = useAppSelector(selectActiveRootNode);
  const selectedIds = useAppSelector((state) => state.selection.selectedIds);
  const hoveredId = useAppSelector((state) => state.selection.hoveredId);
  const dropIndicator = useAppSelector(
    (state) => state.builderDocument.dropIndicator,
  );
  const activePageId = useAppSelector(
    (state) => state.builderDocument.activePageId,
  );
  const rootNodeId = useAppSelector(
    (state) => state.builderDocument.rootNodeIdsByPage[activePageId],
  );
  const pageWidth = viewportWidthPx[viewport];
  const scale = zoom / 100;
  const gridPixelSize = Math.max(4, gridSize * scale);
  const dropTargetId = dropIndicator?.intent?.targetParentId ?? null;
  const setCanvasViewportNode = useCallback(
    (node: HTMLDivElement | null) => {
      viewportElementRef.current = node;
      setCanvasDropRef(node);
    },
    [setCanvasDropRef],
  );

  const zoomToPoint = useCallback(
    (nextZoom: number, focalPoint?: { x: number; y: number }) => {
      const viewportElement = viewportElementRef.current;

      if (!viewportElement) {
        dispatch(setZoom(clampZoom(nextZoom)));
        return;
      }

      const rect = viewportElement.getBoundingClientRect();
      const boundedZoom = clampZoom(nextZoom);
      const pan = getPanForZoomAtPoint({
        currentZoom: zoom,
        nextZoom: boundedZoom,
        pan: canvasPan,
        viewportRect: rect,
        focalPoint: focalPoint ?? getViewportCenter(rect),
      });

      dispatch(setCanvasPan(pan));
      dispatch(setZoom(boundedZoom));
    },
    [canvasPan, dispatch, zoom],
  );

  const zoomBy = useCallback(
    (delta: number, focalPoint?: { x: number; y: number }) => {
      zoomToPoint(zoom + delta, focalPoint);
    },
    [zoom, zoomToPoint],
  );

  const fitCanvas = useCallback(() => {
    const viewportElement = viewportElementRef.current;

    if (!viewportElement) {
      dispatch(setZoom(100));
      return;
    }

    const rect = viewportElement.getBoundingClientRect();
    const nextZoom = clampZoom(
      Math.min(
        100,
        ((rect.width - 96) / pageWidth) * 100,
        ((rect.height - 96) / 680) * 100,
      ),
    );
    const nextScale = nextZoom / 100;

    dispatch(setZoom(nextZoom));
    dispatch(
      setCanvasPan({
        x: Math.max(48, (rect.width - pageWidth * nextScale) / 2),
        y: 56,
      }),
    );
  }, [dispatch, pageWidth]);

  useEffect(() => {
    const viewportElement = viewportElementRef.current;

    if (!viewportElement) {
      return;
    }

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();

      if (event.ctrlKey || event.metaKey) {
        zoomBy(event.deltaY > 0 ? -CANVAS_ZOOM_STEP : CANVAS_ZOOM_STEP, {
          x: event.clientX,
          y: event.clientY,
        });
        return;
      }

      dispatch(
        setCanvasPan({
          x: canvasPan.x - event.deltaX,
          y: canvasPan.y - event.deltaY,
        }),
      );
    };

    viewportElement.addEventListener("wheel", handleWheel, {
      passive: false,
    });

    return () => {
      viewportElement.removeEventListener("wheel", handleWheel);
    };
  }, [canvasPan, dispatch, zoomBy]);

  useEffect(() => {
    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.code === "Space") {
        isSpacePressedRef.current = true;
      }
    };
    const handleKeyUp = (event: globalThis.KeyboardEvent) => {
      if (event.code === "Space") {
        isSpacePressedRef.current = false;
        setIsPanning(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  const handleCanvasKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const isZoomShortcut = event.ctrlKey || event.metaKey;

    if (event.key === " " || event.code === "Space") {
      isSpacePressedRef.current = true;
      return;
    }

    if (!isZoomShortcut) {
      return;
    }

    if (event.key === "+" || event.key === "=") {
      event.preventDefault();
      zoomBy(CANVAS_ZOOM_STEP);
      return;
    }

    if (event.key === "-" || event.key === "_") {
      event.preventDefault();
      zoomBy(-CANVAS_ZOOM_STEP);
      return;
    }

    if (event.key === "0") {
      event.preventDefault();
      dispatch(resetCanvasViewport());
    }
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 1 && !isSpacePressedRef.current) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    panSessionRef.current = {
      pointerId: event.pointerId,
      start: { x: event.clientX, y: event.clientY },
      pan: canvasPan,
      moved: false,
    };
    setIsPanning(true);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const session = panSessionRef.current;

    if (!session || session.pointerId !== event.pointerId) {
      return;
    }

    const delta = {
      x: event.clientX - session.start.x,
      y: event.clientY - session.start.y,
    };

    if (Math.abs(delta.x) > 1 || Math.abs(delta.y) > 1) {
      session.moved = true;
    }

    dispatch(
      setCanvasPan({
        x: session.pan.x + delta.x,
        y: session.pan.y + delta.y,
      }),
    );
  };

  const endPanSession = (event: PointerEvent<HTMLDivElement>) => {
    const session = panSessionRef.current;

    if (!session || session.pointerId !== event.pointerId) {
      return;
    }

    event.currentTarget.releasePointerCapture(event.pointerId);
    suppressNextClickRef.current = session.moved;
    panSessionRef.current = null;
    setIsPanning(false);
  };

  const handleCanvasClick = () => {
    if (suppressNextClickRef.current) {
      suppressNextClickRef.current = false;
      return;
    }

    if (rootNodeId) {
      dispatch(selectOne(rootNodeId));
    }
  };

  const canvasStyle = useMemo(
    () => ({
      width: CANVAS_STAGE_SIZE.width,
      height: CANVAS_STAGE_SIZE.height,
      backgroundPosition: `${canvasPan.x}px ${canvasPan.y}px`,
      backgroundSize: `${gridPixelSize}px ${gridPixelSize}px`,
    }),
    [canvasPan.x, canvasPan.y, gridPixelSize],
  );

  return (
    <section className="relative flex h-full min-h-0 flex-col">
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-[#d8dee9] bg-[#f8fafc] px-4">
        <Typography.Text className="text-xs font-medium text-[#667085]">
          Canvas / Home page
        </Typography.Text>
        <div className="flex items-center gap-1">
          <Tooltip title="Zoom out">
            <Button
              aria-label="Zoom out"
              icon={<Minus size={14} />}
              size="small"
              onClick={() => zoomBy(-CANVAS_ZOOM_STEP)}
            />
          </Tooltip>
          <span className="w-12 text-center text-xs font-medium text-[#475467]">
            {zoom}%
          </span>
          <Tooltip title="Zoom in">
            <Button
              aria-label="Zoom in"
              icon={<Plus size={14} />}
              size="small"
              onClick={() => zoomBy(CANVAS_ZOOM_STEP)}
            />
          </Tooltip>
          <Tooltip title="Reset viewport">
            <Button
              aria-label="Reset viewport"
              icon={<RotateCcw size={14} />}
              size="small"
              onClick={() => dispatch(resetCanvasViewport())}
            />
          </Tooltip>
          <Tooltip title="Fit canvas">
            <Button
              aria-label="Fit canvas"
              icon={<Maximize2 size={14} />}
              size="small"
              onClick={fitCanvas}
            />
          </Tooltip>
          <Tooltip title={isGridVisible ? "Hide grid" : "Show grid"}>
            <Button
              aria-label="Toggle grid"
              icon={<Grid2X2 size={14} />}
              size="small"
              type={isGridVisible ? "primary" : "default"}
              onClick={() => dispatch(toggleGrid())}
            />
          </Tooltip>
          <Tooltip title={snapToGrid ? "Disable snapping" : "Enable snapping"}>
            <Button
              aria-label="Toggle snap to grid"
              size="small"
              type={snapToGrid ? "primary" : "default"}
              onClick={() => dispatch(toggleSnapToGrid())}
            >
              Snap
            </Button>
          </Tooltip>
        </div>
      </div>

      <div
        ref={setCanvasViewportNode}
        className={cn(
          "relative min-h-0 flex-1 overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-[#18a8c7] focus-visible:ring-inset",
          isCanvasOver && "ring-2 ring-[#18a8c7] ring-inset",
          isPanning ? "cursor-grabbing" : "cursor-default",
        )}
        aria-label="Builder canvas. Use Ctrl plus mouse wheel or Ctrl plus plus and minus to zoom. Hold Space or middle mouse button to pan."
        data-builder-canvas-viewport="true"
        role="region"
        tabIndex={0}
        title="Ctrl + wheel zooms. Trackpad scroll or Space + drag pans."
        onClick={handleCanvasClick}
        onKeyDown={handleCanvasKeyDown}
        onPointerCancel={endPanSession}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endPanSession}
      >
        <div
          className={cn(
            "absolute left-0 top-0",
            isGridVisible && "ezyr-canvas-grid",
          )}
          style={canvasStyle}
        />

        {dropIndicator && (
          <div
            className={cn(
              "pointer-events-none absolute right-4 top-4 z-30 max-w-72 rounded-md border px-3 py-2 text-xs shadow-sm",
              dropIndicator.isValid
                ? "border-[#9ee7f2] bg-[#effcff] text-[#08708a]"
                : "border-[#ffd1d1] bg-[#fff5f5] text-[#b42318]",
            )}
          >
            {dropIndicator.isValid
              ? `Drop ${dropIndicator.intent?.placement.replace("-", " ")}`
              : dropIndicator.message}
          </div>
        )}

        <div
          className="absolute left-0 top-0 z-10"
          style={{
            transform: `translate3d(${canvasPan.x}px, ${canvasPan.y}px, 0) scale(${scale})`,
            transformOrigin: "top left",
          }}
        >
          <div
            className="min-h-[680px] rounded-md border border-[#cfd7e4] bg-white shadow-sm transition-shadow"
            style={{ width: pageWidth }}
          >
            {activeRootNode && rootNodeId ? (
              <EditableNode
                node={activeRootNode}
                rootNodeId={rootNodeId}
                selectedIds={selectedIds}
                hoveredId={hoveredId}
                dropTargetId={dropTargetId}
                isDropValid={dropIndicator?.isValid ?? true}
                onSelect={(nodeId) => dispatch(selectOne(nodeId))}
                onHover={(nodeId) => dispatch(setHoveredId(nodeId))}
              />
            ) : (
              <div className="p-8 text-sm text-[#667085]">
                No active page root found.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
