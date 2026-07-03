"use client";

import { useDroppable } from "@dnd-kit/core";
import { Button, Typography } from "antd";
import { Grid2X2, Maximize2, Minus, Plus, RotateCcw } from "lucide-react";
import {
  useCallback,
  useEffect,
  useRef,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from "react";
import type { AppNode } from "@/schemas/app-spec";
import { BUILDER_CANVAS_DROP_ZONE_ID } from "@/features/builder/dnd";
import { selectActiveRootNode } from "@/features/builder/state/selectors";
import { useAppDispatch } from "@/hooks/use-app-dispatch";
import { useAppSelector } from "@/hooks/use-app-selector";
import { rendererRegistry } from "@/registry/renderer";
import { setZoom, toggleGrid } from "@/store/slices/builder-slice";
import { selectOne } from "@/store/slices/selection-slice";
import { cn } from "@/utils/cn";

const viewportWidthClass = {
  desktop: "w-[960px]",
  tablet: "w-[720px]",
  mobile: "w-[390px]",
};

const ZOOM_MIN = 25;
const ZOOM_MAX = 200;
const ZOOM_STEP = 10;

function clampZoom(value: number): number {
  return Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, value));
}

function EditableNode({
  node,
  selectedIds,
  onSelect,
}: {
  node: AppNode;
  selectedIds: readonly string[];
  onSelect: (nodeId: string) => void;
}) {
  const { isOver, setNodeRef } = useDroppable({ id: node.id });
  const renderer = rendererRegistry.resolve(node.type);
  const children = node.children.map((child) => (
    <EditableNode
      key={child.id}
      node={child}
      selectedIds={selectedIds}
      onSelect={onSelect}
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

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "builder-editable-node relative rounded-sm outline-offset-2 transition",
        selectedIds.includes(node.id) && "outline outline-2 outline-[#0f8ca8]",
        isOver && "ring-2 ring-[#18a8c7] ring-offset-2",
      )}
      data-node-id={node.id}
      role="button"
      tabIndex={0}
      onClick={handleClick}
    >
      {rendered as ReactNode}
    </div>
  );
}

export function BuilderCanvas() {
  const dispatch = useAppDispatch();
  const canvasViewportRef = useRef<HTMLDivElement>(null);
  const { isOver: isCanvasOver, setNodeRef: setCanvasDropRef } = useDroppable({
    id: BUILDER_CANVAS_DROP_ZONE_ID,
    data: { kind: "canvas" },
  });
  const { viewport, zoom, isGridVisible } = useAppSelector(
    (state) => state.builder,
  );
  const activeRootNode = useAppSelector(selectActiveRootNode);
  const selectedIds = useAppSelector((state) => state.selection.selectedIds);
  const dropIndicator = useAppSelector(
    (state) => state.builderDocument.dropIndicator,
  );
  const zoomTo = useCallback(
    (nextZoom: number) => dispatch(setZoom(clampZoom(nextZoom))),
    [dispatch],
  );
  const zoomBy = useCallback(
    (delta: number) => zoomTo(zoom + delta),
    [zoom, zoomTo],
  );
  const fitZoom = viewport === "desktop" ? 90 : 100;
  const setCanvasViewportNode = useCallback(
    (node: HTMLDivElement | null) => {
      canvasViewportRef.current = node;
      setCanvasDropRef(node);
    },
    [setCanvasDropRef],
  );

  useEffect(() => {
    const viewportElement = canvasViewportRef.current;

    if (!viewportElement) {
      return;
    }

    const handleWheel = (event: WheelEvent) => {
      if (!event.ctrlKey && !event.metaKey) {
        return;
      }

      event.preventDefault();
      const direction = event.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
      zoomTo(zoom + direction);
    };

    viewportElement.addEventListener("wheel", handleWheel, {
      passive: false,
    });

    return () => {
      viewportElement.removeEventListener("wheel", handleWheel);
    };
  }, [zoom, zoomTo]);

  const handleCanvasKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!event.ctrlKey && !event.metaKey) {
      return;
    }

    if (event.key === "+" || event.key === "=") {
      event.preventDefault();
      zoomBy(ZOOM_STEP);
      return;
    }

    if (event.key === "-" || event.key === "_") {
      event.preventDefault();
      zoomBy(-ZOOM_STEP);
      return;
    }

    if (event.key === "0") {
      event.preventDefault();
      zoomTo(100);
    }
  };

  return (
    <section className="relative flex h-full min-h-0 flex-col">
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-[#d8dee9] bg-[#f8fafc] px-4">
        <Typography.Text className="text-xs font-medium text-[#667085]">
          Canvas / Home page
        </Typography.Text>
        <div className="flex items-center gap-1">
          <Button
            aria-label="Zoom out"
            icon={<Minus size={14} />}
            size="small"
            title="Zoom out"
            onClick={() => zoomBy(-ZOOM_STEP)}
          />
          <span className="w-12 text-center text-xs font-medium text-[#475467]">
            {zoom}%
          </span>
          <Button
            aria-label="Zoom in"
            icon={<Plus size={14} />}
            size="small"
            title="Zoom in"
            onClick={() => zoomBy(ZOOM_STEP)}
          />
          <Button
            aria-label="Reset zoom"
            icon={<RotateCcw size={14} />}
            size="small"
            title="Reset zoom"
            onClick={() => zoomTo(100)}
          />
          <Button
            aria-label="Fit canvas"
            icon={<Maximize2 size={14} />}
            size="small"
            title="Fit canvas"
            onClick={() => zoomTo(fitZoom)}
          />
          <Button
            aria-label="Toggle grid"
            icon={<Grid2X2 size={14} />}
            size="small"
            type={isGridVisible ? "primary" : "default"}
            onClick={() => dispatch(toggleGrid())}
          />
        </div>
      </div>

      <div
        ref={setCanvasViewportNode}
        className={cn(
          "relative min-h-0 flex-1 overflow-auto p-10 outline-none focus-visible:ring-2 focus-visible:ring-[#18a8c7] focus-visible:ring-inset",
          isGridVisible && "ezyr-canvas-grid",
          isCanvasOver && "ring-2 ring-[#18a8c7] ring-inset",
        )}
        aria-label="Builder canvas. Use Ctrl plus mouse wheel or Ctrl plus plus and minus to zoom."
        data-builder-canvas-viewport="true"
        role="region"
        tabIndex={0}
        title="Ctrl + wheel to zoom. Ctrl + +/- to zoom with keyboard."
        onClick={() => dispatch(selectOne("home-root"))}
        onKeyDown={handleCanvasKeyDown}
      >
        {dropIndicator && (
          <div
            className={cn(
              "pointer-events-none absolute right-4 top-4 z-10 rounded-md border px-3 py-2 text-xs shadow-sm",
              dropIndicator.isValid
                ? "border-[#9ee7f2] bg-[#effcff] text-[#08708a]"
                : "border-[#ffd1d1] bg-[#fff5f5] text-[#b42318]",
            )}
          >
            {dropIndicator.isValid
              ? `Drop into ${dropIndicator.intent.targetParentId}`
              : dropIndicator.message}
          </div>
        )}
        <div
          className={cn(
            "mx-auto min-h-[640px] rounded-md border border-[#cfd7e4] bg-white shadow-sm transition-all",
            viewportWidthClass[viewport],
          )}
          style={{
            transform: `scale(${zoom / 100})`,
            transformOrigin: "top center",
          }}
        >
          {activeRootNode ? (
            <EditableNode
              node={activeRootNode}
              selectedIds={selectedIds}
              onSelect={(nodeId) => dispatch(selectOne(nodeId))}
            />
          ) : (
            <div className="p-8 text-sm text-[#667085]">
              No active page root found.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
