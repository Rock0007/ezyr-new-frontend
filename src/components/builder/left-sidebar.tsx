"use client";

import { useDraggable } from "@dnd-kit/core";
import { Button, Layout, Tooltip } from "antd";
import { useMemo, useState } from "react";
import {
  Box,
  Braces,
  Database,
  FolderKanban,
  GripVertical,
  ImageIcon,
  MousePointer2,
  Search,
  Terminal,
  Workflow,
} from "lucide-react";
import { EzyrInput, EzyrPanelHeader, EzyrTabs } from "@/components/ui";
import {
  BUILDER_COMPONENTS,
  BUILDER_TAXONOMY_LABELS,
  BUILDER_TAXONOMY_ORDER,
} from "@/constants/builder";
import { createDropPlan } from "@/features/builder/dnd";
import { useAppDispatch } from "@/hooks/use-app-dispatch";
import { useAppSelector } from "@/hooks/use-app-selector";
import { componentRegistry } from "@/registry/component";
import type { ComponentTaxonomy } from "@/registry/types";
import { applyBuilderCommand } from "@/store/slices/builder-document-slice";
import { toggleConsole } from "@/store/slices/builder-slice";
import { selectOne } from "@/store/slices/selection-slice";
import { cn } from "@/utils/cn";

const navigationItems = [
  { label: "Builder", icon: <MousePointer2 size={16} /> },
  { label: "Projects", icon: <FolderKanban size={16} /> },
  { label: "Data", icon: <Database size={16} /> },
  { label: "Workflows", icon: <Workflow size={16} /> },
  { label: "API", icon: <Braces size={16} /> },
  { label: "Assets", icon: <ImageIcon size={16} /> },
];

let localNodeSequence = 0;

function createLocalNodeId(componentType: string): string {
  localNodeSequence += 1;
  return `${componentType}-${localNodeSequence}`;
}

function ComponentPaletteItem({
  component,
  onInsert,
}: {
  component: (typeof BUILDER_COMPONENTS)[number];
  onInsert: (componentType: string) => void;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-${component.id}`,
    data: { sourceKind: "component", componentType: component.kind },
  });

  return (
    <button
      ref={setNodeRef}
      className={cn(
        "group flex h-11 w-full items-center gap-2 rounded-md border border-transparent bg-white px-2 text-left text-sm transition hover:border-[var(--border)] hover:bg-[var(--brand-wash)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0f8ca8]",
        isDragging && "opacity-40",
      )}
      type="button"
      onDoubleClick={() => onInsert(component.kind)}
      {...listeners}
      {...attributes}
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[var(--brand-soft)] text-[var(--brand-strong)] transition group-hover:bg-[#d9f2f7]">
        <Box size={15} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[13px] font-semibold leading-4 text-[#172033]">
          {component.name}
        </span>
        <span className="block truncate text-[11px] leading-4 capitalize text-[#667085]">
          {component.taxonomyLabel}
        </span>
      </span>
      <GripVertical
        size={14}
        className="shrink-0 text-[#98a2b3] opacity-0 transition group-hover:opacity-100"
      />
    </button>
  );
}

export function LeftSidebar() {
  const [query, setQuery] = useState("");
  const [activeTaxonomy, setActiveTaxonomy] = useState<
    ComponentTaxonomy | "all"
  >("all");
  const dispatch = useAppDispatch();
  const isCollapsed = useAppSelector(
    (state) => state.builder.isLeftPanelCollapsed,
  );
  const isConsoleOpen = useAppSelector((state) => state.builder.isConsoleOpen);
  const nodes = useAppSelector((state) => state.builderDocument.nodes);
  const activePageId = useAppSelector(
    (state) => state.builderDocument.activePageId,
  );
  const rootNodeId = useAppSelector(
    (state) => state.builderDocument.rootNodeIdsByPage[activePageId],
  );
  const selectedIds = useAppSelector((state) => state.selection.selectedIds);
  const filteredComponents = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return BUILDER_COMPONENTS.filter(
      (component) =>
        (activeTaxonomy === "all" || component.taxonomy === activeTaxonomy) &&
        (!normalizedQuery ||
          component.name.toLowerCase().includes(normalizedQuery) ||
          component.taxonomyLabel.toLowerCase().includes(normalizedQuery) ||
          component.description.toLowerCase().includes(normalizedQuery)),
    );
  }, [activeTaxonomy, query]);
  const taxonomies = useMemo(
    () =>
      BUILDER_TAXONOMY_ORDER.filter((taxonomy) =>
        BUILDER_COMPONENTS.some((item) => item.taxonomy === taxonomy),
      ),
    [],
  );

  const insertComponent = (componentType: string) => {
    if (!rootNodeId) {
      return;
    }

    const selectedParentId = selectedIds[0] ?? rootNodeId;
    const selectedParent = nodes[selectedParentId];
    const fallbackParent = nodes[rootNodeId];

    if (!fallbackParent) {
      return;
    }

    const nodeId =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : createLocalNodeId(componentType);
    const plan = createDropPlan({
      payload: { kind: "new-component", componentType },
      nodes,
      rootNodeId,
      overId: selectedParent?.id ?? rootNodeId,
      createNode: () => componentRegistry.createNode(componentType, nodeId),
    });

    if (!plan.isValid || plan.command.type !== "insert-node") {
      return;
    }

    dispatch(applyBuilderCommand(plan.command));
    dispatch(selectOne(plan.command.node.id));
  };

  return (
    <Layout.Sider
      collapsed={isCollapsed}
      collapsedWidth={56}
      width={320}
      className="ezyr-panel border-r transition-all duration-200"
      theme="light"
      collapsible={false}
    >
      <div className="flex h-full min-h-0">
        <nav className="flex w-14 shrink-0 flex-col items-center justify-between border-r border-[var(--border)] py-2">
          <div className="flex flex-col items-center gap-1">
            {navigationItems.map((item) => (
              <Button
                aria-label={item.label}
                className="h-10! w-10!"
                icon={item.icon}
                key={item.label}
                type={item.label === "Builder" ? "primary" : "text"}
              />
            ))}
          </div>
          <Tooltip
            placement="right"
            title={isConsoleOpen ? "Collapse console" : "Expand console"}
          >
            <Button
              aria-label="Toggle console"
              className="h-10! w-10!"
              icon={<Terminal size={16} />}
              type={isConsoleOpen ? "primary" : "text"}
              onClick={() => dispatch(toggleConsole())}
            />
          </Tooltip>
        </nav>
        {!isCollapsed && (
          <aside className="flex min-w-0 flex-1 flex-col overflow-hidden">
            <EzyrPanelHeader title="Component Library" />
            <div className="border-b border-[var(--border)] px-3 py-3">
              <EzyrInput
                placeholder="Search components"
                prefix={<Search size={14} />}
                size="small"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
              <div className="mt-2 flex gap-1 overflow-x-auto pb-1">
                {(["all", ...taxonomies] as const).map((taxonomy) => (
                  <button
                    className={[
                      "shrink-0 rounded-md border px-2 py-1 text-[11px] font-medium capitalize transition",
                      activeTaxonomy === taxonomy
                        ? "border-[#0f8ca8] bg-[#e6f6fa] text-[#08708a]"
                        : "border-[#d8dee9] bg-white text-[#667085] hover:border-[#0f8ca8] hover:text-[#08708a]",
                    ].join(" ")}
                    key={taxonomy}
                    type="button"
                    onClick={() => setActiveTaxonomy(taxonomy)}
                  >
                    {taxonomy === "all"
                      ? "All"
                      : BUILDER_TAXONOMY_LABELS[taxonomy]}
                  </button>
                ))}
              </div>
            </div>
            <EzyrTabs
              centered
              className="builder-sidebar-tabs min-h-0 flex-1"
              defaultActiveKey="components"
              items={[
                {
                  key: "components",
                  label: "Components",
                  children: (
                    <div className="space-y-1 px-2 pb-3">
                      {filteredComponents.map((component) => (
                        <ComponentPaletteItem
                          key={component.id}
                          component={component}
                          onInsert={insertComponent}
                        />
                      ))}
                      {filteredComponents.length === 0 && (
                        <div className="rounded-md border border-dashed border-[#cfd7e4] bg-[#f8fafc] p-3 text-xs text-[#667085]">
                          No components match this search.
                        </div>
                      )}
                    </div>
                  ),
                },
                {
                  key: "tree",
                  label: "Layers",
                  children: (
                    <div className="rounded-md border border-[#d8dee9] bg-[#f8fafc] p-3 text-xs text-[#667085]">
                      Page tree will appear here.
                    </div>
                  ),
                },
              ]}
            />
          </aside>
        )}
      </div>
    </Layout.Sider>
  );
}
