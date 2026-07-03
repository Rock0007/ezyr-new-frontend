"use client";

import { useDraggable } from "@dnd-kit/core";
import {
  Button,
  Divider,
  Input,
  Layout,
  Tabs,
  Tooltip,
  Typography,
} from "antd";
import { useMemo, useState } from "react";
import {
  Box,
  Braces,
  Database,
  FolderKanban,
  ImageIcon,
  MousePointer2,
  Search,
  Terminal,
  Workflow,
} from "lucide-react";
import { BUILDER_COMPONENTS } from "@/constants/builder";
import { validateDropIntent } from "@/features/builder/dnd";
import { useAppDispatch } from "@/hooks/use-app-dispatch";
import { useAppSelector } from "@/hooks/use-app-selector";
import { componentRegistry } from "@/registry/component";
import { insertNode } from "@/store/slices/builder-document-slice";
import { toggleConsole } from "@/store/slices/builder-slice";
import { selectOne } from "@/store/slices/selection-slice";

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
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: `palette-${component.id}`,
      data: { componentType: component.kind },
    });
  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;

  return (
    <button
      ref={setNodeRef}
      className="group flex h-[52px] w-full items-center gap-3 rounded-md border border-[#d8dee9] bg-white px-3 text-left text-sm transition hover:border-[#0f8ca8] hover:bg-[#f1fbfe] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0f8ca8] disabled:opacity-60"
      style={style}
      type="button"
      disabled={isDragging}
      onDoubleClick={() => onInsert(component.kind)}
      {...listeners}
      {...attributes}
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[#e6f6fa] text-[#08708a] transition group-hover:bg-[#d9f2f7]">
        <Box size={15} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-medium text-[#172033]">
          {component.name}
        </span>
        <span className="block truncate text-[11px] capitalize text-[#667085]">
          {component.category}
        </span>
      </span>
    </button>
  );
}

export function LeftSidebar() {
  const [query, setQuery] = useState("");
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

    if (!normalizedQuery) {
      return BUILDER_COMPONENTS;
    }

    return BUILDER_COMPONENTS.filter(
      (component) =>
        component.name.toLowerCase().includes(normalizedQuery) ||
        component.category.toLowerCase().includes(normalizedQuery) ||
        component.description.toLowerCase().includes(normalizedQuery),
    );
  }, [query]);

  const insertComponent = (componentType: string) => {
    const selectedParentId = selectedIds[0] ?? rootNodeId;
    const selectedParent = nodes[selectedParentId];
    const fallbackParent = nodes[rootNodeId];
    const preferredParentId = selectedParent
      ? selectedParent.id
      : fallbackParent.id;
    const preferredParent = nodes[preferredParentId];
    const intent = {
      componentType,
      targetParentId: preferredParentId,
      targetIndex: preferredParent.childIds.length,
      placement: "inside" as const,
    };
    const validation = validateDropIntent(intent, nodes);
    const parentId = validation.isValid ? preferredParentId : rootNodeId;
    const parent = nodes[parentId];
    const nodeId =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : createLocalNodeId(componentType);
    const node = componentRegistry.createNode(componentType, nodeId);

    dispatch(insertNode({ node, parentId, index: parent.childIds.length }));
    dispatch(selectOne(node.id));
  };

  return (
    <Layout.Sider
      collapsed={isCollapsed}
      collapsedWidth={56}
      width={300}
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
            <div className="border-b border-[var(--border)] px-5 py-4">
              <Typography.Text className="block text-xs font-semibold uppercase tracking-wide text-[#344054]">
                Insert
              </Typography.Text>
              <Input
                className="mt-3"
                placeholder="Search components"
                prefix={<Search size={14} />}
                size="small"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
            <Tabs
              className="builder-sidebar-tabs min-h-0 flex-1 px-4"
              defaultActiveKey="components"
              items={[
                {
                  key: "components",
                  label: "Components",
                  children: (
                    <div className="space-y-2 pb-4">
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
                    <div className="rounded-md border border-[#d8dee9] bg-[#f8fafc] p-3 text-sm text-[#667085]">
                      Page tree will appear here.
                    </div>
                  ),
                },
              ]}
            />
            <Divider className="my-0" />
            <div className="px-5 py-4 text-xs leading-5 text-[#667085]">
              Manual builder foundation. Drag and drop wiring will attach here
              in the next milestone.
            </div>
          </aside>
        )}
      </div>
    </Layout.Sider>
  );
}
