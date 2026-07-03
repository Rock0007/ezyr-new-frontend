"use client";

import { useDroppable } from "@dnd-kit/core";
import { Button, Typography } from "antd";
import { Grid2X2, Maximize2, Minus, Plus, RotateCcw } from "lucide-react";
import type { MouseEvent, ReactNode } from "react";
import type { AppNode } from "@/schemas/app-spec";
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
  const renderer = rendererRegistry.get(node.type);
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
  const { viewport, zoom, isGridVisible } = useAppSelector(
    (state) => state.builder,
  );
  const activeRootNode = useAppSelector(selectActiveRootNode);
  const selectedIds = useAppSelector((state) => state.selection.selectedIds);
  const dropIndicator = useAppSelector(
    (state) => state.builderDocument.dropIndicator,
  );

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
            onClick={() => dispatch(setZoom(Math.max(25, zoom - 10)))}
          />
          <span className="w-12 text-center text-xs font-medium text-[#475467]">
            {zoom}%
          </span>
          <Button
            aria-label="Zoom in"
            icon={<Plus size={14} />}
            size="small"
            onClick={() => dispatch(setZoom(Math.min(200, zoom + 10)))}
          />
          <Button
            aria-label="Reset zoom"
            icon={<RotateCcw size={14} />}
            size="small"
            onClick={() => dispatch(setZoom(100))}
          />
          <Button
            aria-label="Fit canvas"
            icon={<Maximize2 size={14} />}
            size="small"
            onClick={() => dispatch(setZoom(viewport === "desktop" ? 90 : 100))}
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
        className={cn(
          "relative min-h-0 flex-1 overflow-auto p-10",
          isGridVisible && "ezyr-canvas-grid",
        )}
        onClick={() => dispatch(selectOne("home-root"))}
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
