"use client";

import { useDraggable, useDroppable } from "@dnd-kit/core";
import { Button, Dropdown, Segmented, Tooltip, Typography } from "antd";
import type { MenuProps } from "antd";
import {
  ClipboardCopy,
  ClipboardPaste,
  CopyPlus,
  FilePlus2,
  Grid2X2,
  Maximize2,
  Minus,
  MoveRight,
  Plus,
  RotateCcw,
  Sparkles,
  Trash2,
} from "lucide-react";
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
  cloneClipboardRootNodes,
  createClipboard,
} from "@/features/builder/clipboard";
import {
  CANVAS_STAGE_SIZE,
  CANVAS_ZOOM_STEP,
  clampZoom,
  getPanForZoomAtPoint,
  getViewportCenter,
} from "@/features/builder/canvas";
import { BUILDER_CANVAS_DROP_ZONE_ID } from "@/features/builder/dnd";
import {
  getSelectableSiblingIds,
  normalizeMarqueeSelection,
  resolveSelectionClick,
} from "@/features/builder/selection";
import {
  collectSubtreeIds,
  hydrateAppNode,
  isDescendantOf,
} from "@/features/builder/state/normalization";
import type { NormalizedBuilderNode } from "@/features/builder/state/types";
import { resolveShortcut } from "@/features/builder/shortcuts";
import { useAppDispatch } from "@/hooks/use-app-dispatch";
import { useAppSelector } from "@/hooks/use-app-selector";
import { componentRegistry } from "@/registry/component";
import { rendererRegistry } from "@/registry/renderer";
import {
  applyBuilderCommand,
  createPage,
  deletePage,
  setActivePage,
  setClipboard,
  updatePageCanvasPosition,
} from "@/store/slices/builder-document-slice";
import {
  type CanvasPageViewMode,
  resetCanvasViewport,
  setPageViewMode,
  setCanvasPan,
  setZoom,
  toggleGrid,
  toggleSnapToGrid,
} from "@/store/slices/builder-slice";
import {
  applySelection,
  clearSelection,
  removeSelectedIds,
  selectOne,
  setFocusedNodeId,
  setHoveredId,
  setSelection,
  setSelectionBounds,
  setSelectionMode,
} from "@/store/slices/selection-slice";
import { cn } from "@/utils/cn";

const viewportWidthPx = {
  desktop: 960,
  tablet: 720,
  mobile: 390,
};

const PAGE_SEQUENCE_GAP = 96;
const PAGE_SEQUENCE_TOP = 0;

let localPageSequence = 1;

function createLocalId(prefix: string): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  localPageSequence += 1;
  return `${prefix}-${localPageSequence}`;
}

function getTopLevelNodeIds(
  nodeIds: readonly string[],
  nodes: Record<string, NormalizedBuilderNode>,
): string[] {
  return nodeIds.filter((nodeId) => {
    if (!nodes[nodeId]) {
      return false;
    }

    return !nodeIds.some(
      (candidateId) =>
        candidateId !== nodeId &&
        nodes[candidateId] &&
        isDescendantOf(nodeId, candidateId, nodes),
    );
  });
}

function canScrollInDirection(
  element: HTMLElement,
  axis: "x" | "y",
  delta: number,
): boolean {
  const style = window.getComputedStyle(element);
  const overflow =
    axis === "y" ? style.overflowY : style.overflowX;
  const allowsScroll = overflow === "auto" || overflow === "scroll";

  if (!allowsScroll || delta === 0) {
    return false;
  }

  if (axis === "y") {
    const maxScrollTop = element.scrollHeight - element.clientHeight;

    return maxScrollTop > 0 && (delta > 0
      ? element.scrollTop < maxScrollTop
      : element.scrollTop > 0);
  }

  const maxScrollLeft = element.scrollWidth - element.clientWidth;

  return maxScrollLeft > 0 && (delta > 0
    ? element.scrollLeft < maxScrollLeft
    : element.scrollLeft > 0);
}

function hasScrollableWheelTarget(
  target: EventTarget | null,
  viewportElement: HTMLElement,
  event: WheelEvent,
): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  let element: HTMLElement | null = target;

  while (element && element !== viewportElement) {
    if (
      canScrollInDirection(element, "y", event.deltaY) ||
      canScrollInDirection(element, "x", event.deltaX)
    ) {
      return true;
    }

    element = element.parentElement;
  }

  return false;
}

type EditableNodeProps = {
  node: AppNode;
  pageId: string;
  rootNodeId: string;
  selectedIds: readonly string[];
  hoveredId: string | null;
  focusedNodeId: string | null;
  dropTargetId: string | null;
  isDropValid: boolean;
  onSelect: (nodeId: string, event: MouseEvent<HTMLDivElement>) => void;
  onActivatePage: (pageId: string) => void;
  onFocusNode: (nodeId: string) => void;
  onHover: (nodeId: string | null) => void;
};

const EditableNode = memo(function EditableNode({
  node,
  pageId,
  rootNodeId,
  selectedIds,
  hoveredId,
  focusedNodeId,
  dropTargetId,
  isDropValid,
  onSelect,
  onActivatePage,
  onFocusNode,
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
      pageId={pageId}
      rootNodeId={rootNodeId}
      selectedIds={selectedIds}
      hoveredId={hoveredId}
      focusedNodeId={focusedNodeId}
      dropTargetId={dropTargetId}
      isDropValid={isDropValid}
      onSelect={onSelect}
      onActivatePage={onActivatePage}
      onFocusNode={onFocusNode}
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
    onActivatePage(pageId);
    onSelect(node.id, event);
  };
  const handleFocus = () => {
    onFocusNode(node.id);
  };
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    onFocusNode(node.id);
  };
  const dragProps = isRoot ? {} : { ...listeners, ...attributes };

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "builder-editable-node group relative rounded-sm outline-offset-2 transition",
        !isRoot && "cursor-grab active:cursor-grabbing",
        selectedIds.includes(node.id) && "outline outline-2 outline-[#0f8ca8]",
        focusedNodeId === node.id &&
          !selectedIds.includes(node.id) &&
          "outline outline-1 outline-[#5fd1e5]",
        hoveredId === node.id &&
          !selectedIds.includes(node.id) &&
          focusedNodeId !== node.id &&
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
      onFocus={handleFocus}
      onKeyDown={handleKeyDown}
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
  const marqueeSessionRef = useRef<{
    pointerId: number;
    start: { x: number; y: number };
  } | null>(null);
  const pageDragSessionRef = useRef<{
    pageId: string;
    pointerId: number;
    start: { x: number; y: number };
    position: { x: number; y: number };
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
    pageViewMode,
    zoom,
    canvasPan,
    isGridVisible,
    snapToGrid,
    gridSize,
  } = useAppSelector((state) => state.builder);
  const selectedIds = useAppSelector((state) => state.selection.selectedIds);
  const selectionState = useAppSelector((state) => state.selection);
  const hoveredId = useAppSelector((state) => state.selection.hoveredId);
  const focusedNodeId = useAppSelector((state) => state.selection.focusedNodeId);
  const selectionBounds = useAppSelector(
    (state) => state.selection.selectionBounds,
  );
  const nodes = useAppSelector((state) => state.builderDocument.nodes);
  const dropIndicator = useAppSelector(
    (state) => state.builderDocument.dropIndicator,
  );
  const activePageId = useAppSelector(
    (state) => state.builderDocument.activePageId,
  );
  const pagesById = useAppSelector((state) => state.builderDocument.pagesById);
  const pageOrder = useAppSelector((state) => state.builderDocument.pageOrder);
  const rootNodeId = useAppSelector(
    (state) => state.builderDocument.rootNodeIdsByPage[activePageId],
  );
  const rootNodeIdsByPage = useAppSelector(
    (state) => state.builderDocument.rootNodeIdsByPage,
  );
  const clipboard = useAppSelector((state) => state.builderDocument.clipboard);
  const activePage = pagesById[activePageId];
  const activeNodeId = selectionState.activeNodeId;
  const activeNode = activeNodeId ? nodes[activeNodeId] : null;
  const topLevelSelectedIds = useMemo(
    () => getTopLevelNodeIds(selectedIds, nodes),
    [nodes, selectedIds],
  );
  const canCopy = topLevelSelectedIds.length > 0;
  const canPaste = Boolean(clipboard);
  const canMoveToPage =
    topLevelSelectedIds.length > 0 &&
    pageOrder.length > 1 &&
    topLevelSelectedIds.every((nodeId) => nodes[nodeId]?.parentId !== null);
  const canDeleteSelected = selectedIds.length > 0;
  const pageWidth = viewportWidthPx[viewport];
  const pageCanvases = useMemo(
    () =>
      pageOrder
        .map((pageId, index) => {
          const rootId = rootNodeIdsByPage[pageId];
          const rootNode = rootId ? hydrateAppNode(rootId, nodes) : null;

          return {
            canvas: pagesById[pageId]?.canvas ?? {
              x: index * (pageWidth + PAGE_SEQUENCE_GAP),
              y: PAGE_SEQUENCE_TOP,
            },
            pageId,
            page: pagesById[pageId],
            rootId,
            rootNode,
          };
        })
        .filter((entry) => entry.page),
    [nodes, pageOrder, pageWidth, pagesById, rootNodeIdsByPage],
  );
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

  const getViewportLocalPoint = useCallback(
    (point: { x: number; y: number }) => {
      const viewportElement = viewportElementRef.current;
      const rect = viewportElement?.getBoundingClientRect();

      if (!rect) {
        return { x: point.x, y: point.y };
      }

      return { x: point.x - rect.left, y: point.y - rect.top };
    },
    [],
  );

  const getSelectionBounds = useCallback(
    (start: { x: number; y: number }, end: { x: number; y: number }) => ({
      left: Math.min(start.x, end.x),
      top: Math.min(start.y, end.y),
      width: Math.abs(start.x - end.x),
      height: Math.abs(start.y - end.y),
    }),
    [],
  );

  const getNodesInsideBounds = useCallback(
    (bounds: { left: number; top: number; width: number; height: number }) => {
      const viewportElement = viewportElementRef.current;
      const viewportRect = viewportElement?.getBoundingClientRect();

      if (!viewportElement || !viewportRect) {
        return [];
      }

      const selectionRect = {
        left: viewportRect.left + bounds.left,
        right: viewportRect.left + bounds.left + bounds.width,
        top: viewportRect.top + bounds.top,
        bottom: viewportRect.top + bounds.top + bounds.height,
      };

      return Array.from(
        viewportElement.querySelectorAll<HTMLElement>("[data-node-id]"),
      )
        .map((element) => ({
          id: element.dataset.nodeId,
          rect: element.getBoundingClientRect(),
        }))
        .filter(
          (entry): entry is { id: string; rect: DOMRect } =>
            Boolean(entry.id) && entry.id !== rootNodeId,
        )
        .filter(
          ({ rect }) =>
            rect.left < selectionRect.right &&
            rect.right > selectionRect.left &&
            rect.top < selectionRect.bottom &&
            rect.bottom > selectionRect.top,
        )
        .map(({ id }) => id);
    },
    [rootNodeId],
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
      if (event.ctrlKey || event.metaKey) {
        event.preventDefault();
        zoomBy(event.deltaY > 0 ? -CANVAS_ZOOM_STEP : CANVAS_ZOOM_STEP, {
          x: event.clientX,
          y: event.clientY,
        });
        return;
      }

      if (hasScrollableWheelTarget(event.target, viewportElement, event)) {
        return;
      }

      event.preventDefault();
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

  const deleteSelectedNodes = useCallback(() => {
    if (selectedIds.length === 0) {
      return;
    }

    const selectedSet = new Set(selectedIds);
    const pageRootIds = new Set(
      Object.values(rootNodeIdsByPage).filter(
        (nodeId): nodeId is string => Boolean(nodeId),
      ),
    );
    const deletableIds = selectedIds.filter((nodeId) => {
      const node = nodes[nodeId];

      if (!node) {
        return false;
      }

      if (node.parentId === null) {
        return pageRootIds.has(node.id);
      }

      return !selectedIds.some(
        (candidateId) =>
          candidateId !== nodeId &&
          selectedSet.has(candidateId) &&
          isDescendantOf(nodeId, candidateId, nodes),
      );
    });
    if (deletableIds.length === 0) {
      return;
    }

    const removedIds = deletableIds.flatMap((nodeId) =>
      collectSubtreeIds(nodeId, nodes),
    );
    const deletesRoot = rootNodeId ? deletableIds.includes(rootNodeId) : false;
    const fallbackParentId = deletesRoot
      ? null
      : (nodes[deletableIds[0] ?? ""]?.parentId ?? rootNodeId);

    deletableIds.forEach((nodeId) => {
      dispatch(applyBuilderCommand({ type: "delete-node", nodeId }));
    });

    dispatch(removeSelectedIds(removedIds));

    if (fallbackParentId && nodes[fallbackParentId]) {
      dispatch(selectOne(fallbackParentId));
      return;
    }

    dispatch(clearSelection());
  }, [dispatch, nodes, rootNodeId, rootNodeIdsByPage, selectedIds]);

  const createClonedPage = useCallback(
    (sourceRootId: string) => {
      const sourceClipboard = createClipboard([sourceRootId], nodes);

      if (!sourceClipboard) {
        return;
      }

      const [rootNode] = cloneClipboardRootNodes(sourceClipboard, (sourceId) =>
        createLocalId(`${sourceId}-copy`),
      );

      if (!rootNode) {
        return;
      }

      const nextPageNumber = pageOrder.length + 1;
      const sourcePage = Object.values(pagesById).find(
        (page) => rootNodeIdsByPage[page.id] === sourceRootId,
      );

      dispatch(
        createPage({
          page: {
            canvas: {
              x: (pageOrder.length) * (pageWidth + PAGE_SEQUENCE_GAP),
              y: PAGE_SEQUENCE_TOP,
            },
            id: createLocalId("page"),
            name: `${sourcePage?.name ?? "Page"} copy`,
            path: `/page-${nextPageNumber}`,
          },
          rootNode,
        }),
      );
      dispatch(selectOne(rootNode.id));
    },
    [dispatch, nodes, pageOrder.length, pageWidth, pagesById, rootNodeIdsByPage],
  );

  const resolvePasteParentId = useCallback(() => {
    if (!rootNodeId) {
      return null;
    }

    if (activeNode) {
      const definition = componentRegistry.get(activeNode.type);

      if (definition?.canvas.acceptsChildren) {
        return activeNode.id;
      }

      if (activeNode.parentId) {
        return activeNode.parentId;
      }
    }

    return rootNodeId;
  }, [activeNode, rootNodeId]);

  const handleCopy = useCallback(() => {
    if (!canCopy) {
      return;
    }

    dispatch(setClipboard(createClipboard(topLevelSelectedIds, nodes)));
  }, [canCopy, dispatch, nodes, topLevelSelectedIds]);

  const handleDuplicate = useCallback(() => {
    if (!canCopy) {
      return;
    }

    if (
      rootNodeId &&
      topLevelSelectedIds.length === 1 &&
      topLevelSelectedIds[0] === rootNodeId
    ) {
      createClonedPage(rootNodeId);
      return;
    }

    const copied = createClipboard(topLevelSelectedIds, nodes);
    if (!copied) {
      return;
    }

    const clonedNodes = cloneClipboardRootNodes(copied, (sourceId) =>
      createLocalId(`${sourceId}-copy`),
    );
    const firstSource = nodes[topLevelSelectedIds[0]];
    const targetParentId = firstSource?.parentId ?? rootNodeId;
    const targetParent = targetParentId ? nodes[targetParentId] : null;

    if (!targetParent || clonedNodes.length === 0) {
      return;
    }

    const sourceIndexes = topLevelSelectedIds
      .map((nodeId) => targetParent.childIds.indexOf(nodeId))
      .filter((index) => index >= 0);
    const insertIndex =
      sourceIndexes.length > 0
        ? Math.max(...sourceIndexes) + 1
        : targetParent.childIds.length;

    clonedNodes.forEach((node, index) => {
      dispatch(
        applyBuilderCommand({
          type: "insert-node",
          node,
          parentId: targetParent.id,
          index: insertIndex + index,
        }),
      );
    });
    dispatch(
      setSelection({
        activeNodeId: clonedNodes.at(-1)?.id ?? null,
        focusedNodeId: clonedNodes.at(-1)?.id ?? null,
        selectedIds: clonedNodes.map((node) => node.id),
        selectionMode: clonedNodes.length > 1 ? "multi" : "single",
      }),
    );
  }, [
    canCopy,
    createClonedPage,
    dispatch,
    nodes,
    rootNodeId,
    topLevelSelectedIds,
  ]);

  const handlePaste = useCallback(() => {
    if (!clipboard) {
      return;
    }

    const sourceRootIds = clipboard.rootIds;
    const isWholePageClipboard =
      sourceRootIds.length === 1 &&
      clipboard.nodes[sourceRootIds[0]]?.parentId === null;
    const clonedNodes = cloneClipboardRootNodes(clipboard, (sourceId) =>
      createLocalId(`${sourceId}-paste`),
    );

    if (clonedNodes.length === 0) {
      return;
    }

    if (isWholePageClipboard) {
      const nextPageNumber = pageOrder.length + 1;
      const rootNode = clonedNodes[0];

      dispatch(
        createPage({
          page: {
            canvas: {
              x: pageOrder.length * (pageWidth + PAGE_SEQUENCE_GAP),
              y: PAGE_SEQUENCE_TOP,
            },
            id: createLocalId("page"),
            name: `Page ${nextPageNumber}`,
            path: `/page-${nextPageNumber}`,
          },
          rootNode,
        }),
      );
      dispatch(selectOne(rootNode.id));
      return;
    }

    const parentId = resolvePasteParentId();
    const parent = parentId ? nodes[parentId] : null;

    if (!parent) {
      return;
    }

    clonedNodes.forEach((node, index) => {
      dispatch(
        applyBuilderCommand({
          type: "insert-node",
          node,
          parentId: parent.id,
          index: parent.childIds.length + index,
        }),
      );
    });
    dispatch(
      setSelection({
        activeNodeId: clonedNodes.at(-1)?.id ?? null,
        focusedNodeId: clonedNodes.at(-1)?.id ?? null,
        selectedIds: clonedNodes.map((node) => node.id),
        selectionMode: clonedNodes.length > 1 ? "multi" : "single",
      }),
    );
  }, [
    clipboard,
    dispatch,
    nodes,
    pageOrder.length,
    pageWidth,
    resolvePasteParentId,
  ]);

  const handleMoveToPage = useCallback(
    (info: Parameters<NonNullable<MenuProps["onClick"]>>[0]) => {
      const { key } = info;
      const targetRootId = rootNodeIdsByPage[String(key)];
      const targetRoot = targetRootId ? nodes[targetRootId] : null;

      if (!targetRoot || !canMoveToPage) {
        return;
      }

      topLevelSelectedIds.forEach((nodeId, index) => {
        dispatch(
          applyBuilderCommand({
            type: "move-node",
            nodeId,
            parentId: targetRoot.id,
            index: targetRoot.childIds.length + index,
          }),
        );
      });
      dispatch(setActivePage(String(key)));
      dispatch(
        setSelection({
          activeNodeId: topLevelSelectedIds.at(-1) ?? null,
          focusedNodeId: topLevelSelectedIds.at(-1) ?? null,
          selectedIds: topLevelSelectedIds,
          selectionMode: topLevelSelectedIds.length > 1 ? "multi" : "single",
        }),
      );
    },
    [
      canMoveToPage,
      dispatch,
      nodes,
      rootNodeIdsByPage,
      topLevelSelectedIds,
    ],
  );

  const moveMenuItems: MenuProps["items"] = pageOrder
    .filter((pageId) => pageId !== activePageId)
    .map((pageId) => ({
      key: pageId,
      label: pagesById[pageId]?.name ?? pageId,
      disabled: !rootNodeIdsByPage[pageId],
    }));

  const handleBeautifyPages = useCallback(() => {
    pageOrder.forEach((pageId, index) => {
      dispatch(
        updatePageCanvasPosition({
          pageId,
          position: {
            x: index * (pageWidth + PAGE_SEQUENCE_GAP),
            y: PAGE_SEQUENCE_TOP,
          },
        }),
      );
    });
    dispatch(setPageViewMode("all-pages"));
  }, [dispatch, pageOrder, pageWidth]);

  const handlePageDragStart = useCallback(
    (
      pageId: string,
      position: { x: number; y: number },
      event: PointerEvent<HTMLDivElement>,
    ) => {
      if (pageViewMode !== "all-pages" || event.button !== 0) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      event.currentTarget.setPointerCapture(event.pointerId);
      pageDragSessionRef.current = {
        moved: false,
        pageId,
        pointerId: event.pointerId,
        position,
        start: { x: event.clientX, y: event.clientY },
      };
      dispatch(setActivePage(pageId));

      const pageRootNodeId = rootNodeIdsByPage[pageId];
      if (pageRootNodeId) {
        dispatch(selectOne(pageRootNodeId));
      }
    },
    [dispatch, pageViewMode, rootNodeIdsByPage],
  );

  const handlePageDragMove = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      const session = pageDragSessionRef.current;

      if (!session || session.pointerId !== event.pointerId) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      const nextPosition = {
        x: session.position.x + (event.clientX - session.start.x) / scale,
        y: session.position.y + (event.clientY - session.start.y) / scale,
      };

      if (
        Math.abs(event.clientX - session.start.x) > 1 ||
        Math.abs(event.clientY - session.start.y) > 1
      ) {
        session.moved = true;
      }

      dispatch(
        updatePageCanvasPosition({
          pageId: session.pageId,
          position: nextPosition,
        }),
      );
    },
    [dispatch, scale],
  );

  const handlePageDragEnd = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      const session = pageDragSessionRef.current;

      if (!session || session.pointerId !== event.pointerId) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      event.currentTarget.releasePointerCapture(event.pointerId);
      suppressNextClickRef.current = session.moved;
      pageDragSessionRef.current = null;
    },
    [],
  );

  const handleCanvasKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const shortcut = resolveShortcut(event.nativeEvent);

    if (shortcut === "copy") {
      event.preventDefault();
      handleCopy();
      return;
    }

    if (shortcut === "paste") {
      event.preventDefault();
      handlePaste();
      return;
    }

    if (shortcut === "duplicate") {
      event.preventDefault();
      handleDuplicate();
      return;
    }

    if (shortcut === "clear-selection") {
      event.preventDefault();
      dispatch(clearSelection());
      return;
    }

    if (shortcut === "delete") {
      event.preventDefault();
      deleteSelectedNodes();
      return;
    }

    if (shortcut === "select-all") {
      event.preventDefault();
      const selectableIds = getSelectableSiblingIds(
        nodes,
        selectionState.activeNodeId,
        rootNodeId,
      );

      dispatch(
        setSelection({
          activeNodeId: selectableIds.at(-1) ?? null,
          focusedNodeId: selectableIds.at(-1) ?? null,
          lastSelectedNodeId: selectableIds.at(-1) ?? null,
          selectedIds: selectableIds,
          selectionMode: selectableIds.length > 1 ? "multi" : "single",
        }),
      );
      return;
    }

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
      if (event.button === 0) {
        const target = event.target as HTMLElement;
        const isEmptyCanvas =
          event.currentTarget === target || !target.closest("[data-node-id]");

        if (isEmptyCanvas) {
          event.currentTarget.setPointerCapture(event.pointerId);
          const start = getViewportLocalPoint({
            x: event.clientX,
            y: event.clientY,
          });

          marqueeSessionRef.current = { pointerId: event.pointerId, start };
          dispatch(clearSelection());
          dispatch(setSelectionMode("marquee"));
          dispatch(
            setSelectionBounds({ left: start.x, top: start.y, width: 0, height: 0 }),
          );
        }
      }

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
    const marqueeSession = marqueeSessionRef.current;

    if (marqueeSession?.pointerId === event.pointerId) {
      const current = getViewportLocalPoint({
        x: event.clientX,
        y: event.clientY,
      });
      const bounds = getSelectionBounds(marqueeSession.start, current);
      const nodeIds = normalizeMarqueeSelection(
        getNodesInsideBounds(bounds),
        nodes,
      );
      const activeNodeId = nodeIds.at(-1) ?? null;

      dispatch(
        setSelection({
          activeNodeId,
          focusedNodeId: activeNodeId,
          lastSelectedNodeId: activeNodeId,
          selectedIds: nodeIds,
          selectionMode: "marquee",
        }),
      );
      dispatch(setSelectionBounds(bounds));
      return;
    }

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
    const marqueeSession = marqueeSessionRef.current;

    if (marqueeSession?.pointerId === event.pointerId) {
      event.currentTarget.releasePointerCapture(event.pointerId);
      marqueeSessionRef.current = null;
      suppressNextClickRef.current = true;
      dispatch(setSelectionBounds(null));
      dispatch(
        setSelectionMode(
          selectedIds.length === 0
            ? "none"
            : selectedIds.length === 1
              ? "single"
              : "multi",
        ),
      );
      return;
    }

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

    dispatch(clearSelection());
  };

  const handleNodeSelect = useCallback(
    (nodeId: string, event: MouseEvent<HTMLDivElement>) => {
      const result = resolveSelectionClick({
        nodeId,
        modifiers: {
          altKey: event.altKey,
          ctrlKey: event.ctrlKey,
          metaKey: event.metaKey,
          shiftKey: event.shiftKey,
        },
        nodes,
        state: selectionState,
      });

      dispatch(applySelection(result));
    },
    [dispatch, nodes, selectionState],
  );

  const canvasStyle = useMemo(
    () => ({
      width: CANVAS_STAGE_SIZE.width,
      height: CANVAS_STAGE_SIZE.height,
      backgroundPosition: `${canvasPan.x}px ${canvasPan.y}px`,
      backgroundSize: `${gridPixelSize}px ${gridPixelSize}px`,
    }),
    [canvasPan.x, canvasPan.y, gridPixelSize],
  );

  const handleCreatePage = useCallback(() => {
    const pageNumber = pageOrder.length + 1;
    const pageId = createLocalId("page");
    const rootId = createLocalId("frame");
    const rootNode = componentRegistry.createNode("Frame", rootId);

    dispatch(
      createPage({
        page: {
          canvas: {
            x: (pageOrder.length) * (pageWidth + PAGE_SEQUENCE_GAP),
            y: PAGE_SEQUENCE_TOP,
          },
          id: pageId,
          name: `Page ${pageNumber}`,
          path: `/page-${pageNumber}`,
        },
        rootNode,
      }),
    );
    dispatch(selectOne(rootNode.id));
  }, [dispatch, pageOrder.length, pageWidth]);

  const handleSwitchPage = useCallback(
    (pageId: string) => {
      dispatch(setActivePage(pageId));

      const nextRootNodeId = rootNodeIdsByPage[pageId];
      if (nextRootNodeId) {
        dispatch(selectOne(nextRootNodeId));
        return;
      }

      dispatch(clearSelection());
    },
    [dispatch, rootNodeIdsByPage],
  );

  const handleDeleteActivePage = useCallback(() => {
    if (pageOrder.length <= 1) {
      return;
    }

    const activeIndex = pageOrder.indexOf(activePageId);
    const nextPageId =
      pageOrder[Math.max(0, activeIndex - 1)] ??
      pageOrder.find((pageId) => pageId !== activePageId);

    dispatch(deletePage(activePageId));

    if (nextPageId) {
      const nextRootNodeId = rootNodeIdsByPage[nextPageId];
      if (nextRootNodeId) {
        dispatch(selectOne(nextRootNodeId));
        return;
      }
    }

    dispatch(clearSelection());
  }, [activePageId, dispatch, pageOrder, rootNodeIdsByPage]);

  return (
    <section className="relative flex h-full min-h-0 flex-col">
      <div className="flex h-12 shrink-0 items-center justify-between gap-3 border-b border-[#d8dee9] bg-[#f8fafc] px-4">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <Typography.Text className="shrink-0 text-xs font-medium text-[#667085]">
            Pages
          </Typography.Text>
          <div className="flex min-w-0 max-w-[520px] items-center gap-1 overflow-x-auto">
            {pageOrder.map((pageId) => {
              const page = pagesById[pageId];

              if (!page) {
                return null;
              }

              const isActive = page.id === activePageId;

              return (
                <button
                  className={cn(
                    "shrink-0 rounded-md border px-2.5 py-1 text-xs font-medium transition",
                    isActive
                      ? "border-[#0f8ca8] bg-[#e6f6fa] text-[#08708a]"
                      : "border-[#d8dee9] bg-white text-[#667085] hover:border-[#0f8ca8] hover:text-[#08708a]",
                  )}
                  key={page.id}
                  type="button"
                  onClick={() => handleSwitchPage(page.id)}
                >
                  {page.name}
                </button>
              );
            })}
          </div>
          <Tooltip title="Add page">
            <Button
              aria-label="Add page"
              icon={<FilePlus2 size={14} />}
              size="small"
              onClick={handleCreatePage}
            />
          </Tooltip>
          <Tooltip
            title={
              pageOrder.length <= 1
                ? "At least one page is required"
                : `Delete ${activePage?.name ?? "page"}`
            }
          >
            <Button
              aria-label="Delete active page"
              disabled={pageOrder.length <= 1}
              icon={<Trash2 size={14} />}
              size="small"
              onClick={handleDeleteActivePage}
            />
          </Tooltip>
          <Segmented<CanvasPageViewMode>
            size="small"
            value={pageViewMode}
            onChange={(value) => dispatch(setPageViewMode(value))}
            options={[
              { label: "Active", value: "active-page" },
              { label: "All pages", value: "all-pages" },
            ]}
          />
          <Tooltip title="Beautify page layout">
            <Button
              aria-label="Beautify page layout"
              icon={<Sparkles size={14} />}
              size="small"
              onClick={handleBeautifyPages}
            />
          </Tooltip>
          <div className="mx-1 h-5 w-px shrink-0 bg-[#d8dee9]" />
          <Tooltip title="Copy selected">
            <Button
              aria-label="Copy selected"
              disabled={!canCopy}
              icon={<ClipboardCopy size={14} />}
              size="small"
              onClick={handleCopy}
            />
          </Tooltip>
          <Tooltip
            title={
              rootNodeId && topLevelSelectedIds.includes(rootNodeId)
                ? "Clone frame as page"
                : "Clone selected"
            }
          >
            <Button
              aria-label="Clone selected"
              disabled={!canCopy}
              icon={<CopyPlus size={14} />}
              size="small"
              onClick={handleDuplicate}
            />
          </Tooltip>
          <Tooltip title="Delete selected">
            <Button
              aria-label="Delete selected"
              disabled={!canDeleteSelected}
              icon={<Trash2 size={14} />}
              size="small"
              danger
              onClick={deleteSelectedNodes}
            />
          </Tooltip>
          <Tooltip title="Paste">
            <Button
              aria-label="Paste"
              disabled={!canPaste}
              icon={<ClipboardPaste size={14} />}
              size="small"
              onClick={handlePaste}
            />
          </Tooltip>
          <Dropdown
            disabled={!canMoveToPage}
            menu={{ items: moveMenuItems, onClick: handleMoveToPage }}
            trigger={["click"]}
          >
            <Button
              aria-label="Move selected to page"
              disabled={!canMoveToPage}
              icon={<MoveRight size={14} />}
              size="small"
            />
          </Dropdown>
        </div>
        <div className="flex shrink-0 items-center gap-1">
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

        {selectionBounds && (
          <div
            className="pointer-events-none absolute z-40 rounded-sm border border-[#0f8ca8] bg-[#18a8c7]/10"
            style={{
              height: selectionBounds.height,
              left: selectionBounds.left,
              top: selectionBounds.top,
              width: selectionBounds.width,
            }}
          />
        )}

        <div
          className="absolute left-0 top-0 z-10"
          style={{
            transform: `translate3d(${canvasPan.x}px, ${canvasPan.y}px, 0) scale(${scale})`,
            transformOrigin: "top left",
          }}
        >
          <div
            className={cn(
              pageViewMode === "all-pages"
                ? "relative"
                : "block",
            )}
            style={
              pageViewMode === "all-pages"
                ? {
                    height: CANVAS_STAGE_SIZE.height,
                    width: CANVAS_STAGE_SIZE.width,
                  }
                : undefined
            }
          >
            {(pageViewMode === "all-pages"
              ? pageCanvases
              : pageCanvases.filter((entry) => entry.pageId === activePageId)
            ).map((entry) => {
              const isActivePage = entry.pageId === activePageId;

              return (
                <div
                  className={cn(
                    "min-w-0",
                    pageViewMode === "all-pages" && "absolute",
                  )}
                  key={entry.pageId}
                  style={
                    pageViewMode === "all-pages"
                      ? {
                          left: entry.canvas.x,
                          top: entry.canvas.y,
                          width: pageWidth,
                        }
                      : undefined
                  }
                >
                  {pageViewMode === "all-pages" && (
                    <div
                      className={cn(
                        "mb-2 flex h-7 cursor-move select-none items-center justify-between rounded-md border bg-white px-2 text-xs font-semibold shadow-sm",
                        isActivePage
                          ? "border-[#0f8ca8] text-[#08708a]"
                          : "border-[#d8dee9] text-[#667085]",
                      )}
                      onPointerCancel={handlePageDragEnd}
                      onPointerDown={(event) =>
                        handlePageDragStart(entry.pageId, entry.canvas, event)
                      }
                      onPointerMove={handlePageDragMove}
                      onPointerUp={handlePageDragEnd}
                    >
                      <span className="truncate">
                        {entry.page?.name ?? entry.pageId}
                      </span>
                    </div>
                  )}
                  <div
                    className={cn(
                      "min-h-[680px] rounded-md border bg-white shadow-sm transition-shadow",
                      isActivePage
                        ? "border-[#0f8ca8]"
                        : "border-[#cfd7e4]",
                    )}
                    style={{ width: pageWidth }}
                  >
                    {entry.rootNode && entry.rootId ? (
                      <EditableNode
                        node={entry.rootNode}
                        pageId={entry.pageId}
                        rootNodeId={entry.rootId}
                        selectedIds={selectedIds}
                        hoveredId={hoveredId}
                        focusedNodeId={focusedNodeId}
                        dropTargetId={dropTargetId}
                        isDropValid={dropIndicator?.isValid ?? true}
                        onActivatePage={handleSwitchPage}
                        onSelect={handleNodeSelect}
                        onFocusNode={(nodeId) =>
                          dispatch(setFocusedNodeId(nodeId))
                        }
                        onHover={(nodeId) => dispatch(setHoveredId(nodeId))}
                      />
                    ) : (
                      <div className="flex min-h-[420px] items-center justify-center p-8">
                        <div className="max-w-[280px] rounded-md border border-dashed border-[#cfd7e4] bg-[#f8fafc] px-4 py-3 text-center">
                          <Typography.Text className="block text-sm font-semibold text-[#172033]">
                            Add a Frame
                          </Typography.Text>
                          <Typography.Text className="mt-1 block text-xs leading-5 text-[#667085]">
                            Drag a Frame here or double-click Frame in the
                            component library to start this page.
                          </Typography.Text>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
