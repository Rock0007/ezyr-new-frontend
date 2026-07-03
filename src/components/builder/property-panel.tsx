"use client";

import { Button, Collapse, Form, Layout, Tooltip, Typography } from "antd";
import { ChevronLeft, ChevronRight, SlidersHorizontal } from "lucide-react";
import type { JsonValue } from "@/schemas/app-spec";
import {
  groupProperties,
  propertyEditorRegistry,
  readPropertyValue,
} from "@/features/builder/property-panel";
import { hydrateAppNode } from "@/features/builder/state/normalization";
import { useAppDispatch } from "@/hooks/use-app-dispatch";
import { useAppSelector } from "@/hooks/use-app-selector";
import { propertyRegistry } from "@/registry/property";
import {
  updateNodeProps,
  updateNodeStyle,
} from "@/store/slices/builder-document-slice";
import { toggleRightPanel } from "@/store/slices/builder-slice";

export function PropertyPanel() {
  const dispatch = useAppDispatch();
  const isCollapsed = useAppSelector(
    (state) => state.builder.isRightPanelCollapsed,
  );
  const selectedIds = useAppSelector((state) => state.selection.selectedIds);
  const nodes = useAppSelector((state) => state.builderDocument.nodes);
  const selectedNode = selectedIds.length === 1 ? nodes[selectedIds[0]] : null;
  const selectedAppNode = selectedNode
    ? hydrateAppNode(selectedNode.id, nodes)
    : null;
  const propertyGroups = selectedAppNode
    ? groupProperties(
        propertyRegistry
          .listForComponent(selectedAppNode.type)
          .filter(
            (property) =>
              !property.isVisible || property.isVisible(selectedAppNode),
          ),
      )
    : [];

  const updateProperty = (
    propertySource: "props" | "style" | "bindings" | "events",
    propertyKey: string,
    value: JsonValue,
  ) => {
    if (!selectedAppNode) {
      return;
    }

    if (propertySource === "props") {
      dispatch(
        updateNodeProps({
          nodeId: selectedAppNode.id,
          props: { [propertyKey]: value },
        }),
      );
      return;
    }

    if (propertySource === "style") {
      dispatch(
        updateNodeStyle({
          nodeId: selectedAppNode.id,
          style: { [propertyKey]: value },
        }),
      );
    }
  };

  return (
    <Layout.Sider
      collapsed={isCollapsed}
      collapsedWidth={56}
      width={320}
      className="ezyr-panel border-l transition-all duration-200"
      theme="light"
      collapsible={false}
    >
      {isCollapsed ? (
        <aside className="flex h-full min-h-0 flex-col items-center border-l-0 py-2">
          <Tooltip placement="left" title="Expand properties">
            <Button
              aria-label="Expand properties panel"
              className="h-10! w-10!"
              icon={<ChevronLeft size={16} />}
              type="primary"
              onClick={() => dispatch(toggleRightPanel())}
            />
          </Tooltip>
          <div className="mt-2 flex h-10 w-10 items-center justify-center rounded-md text-[#0f8ca8]">
            <SlidersHorizontal size={16} />
          </div>
        </aside>
      ) : (
        <aside className="flex h-full min-h-0 flex-col">
          <div className="flex h-12 shrink-0 items-center justify-between border-b border-[var(--border)] px-4">
            <div className="flex min-w-0 items-center gap-2">
              <SlidersHorizontal
                size={16}
                className="shrink-0 text-[#0f8ca8]"
              />
              <Typography.Text className="truncate font-semibold text-[#172033]">
                Properties
              </Typography.Text>
            </div>
            <Tooltip title="Collapse properties">
              <Button
                aria-label="Collapse properties panel"
                icon={<ChevronRight size={16} />}
                size="small"
                type="text"
                onClick={() => dispatch(toggleRightPanel())}
              />
            </Tooltip>
          </div>
          <div className="min-h-0 flex-1 overflow-auto px-4 py-3">
            {selectedAppNode ? (
              <Form layout="vertical" size="small">
                <div className="mb-3 rounded-md border border-[#d8dee9] bg-[#f8fafc] px-3 py-2">
                  <Typography.Text className="block text-xs font-medium text-[#667085]">
                    Selected
                  </Typography.Text>
                  <Typography.Text className="block truncate text-sm font-semibold text-[#172033]">
                    {selectedAppNode.type} / {selectedAppNode.id}
                  </Typography.Text>
                </div>
                <Collapse
                  className="builder-properties-collapse"
                  defaultActiveKey={propertyGroups.map(
                    (group) => group.category,
                  )}
                  ghost
                  items={propertyGroups.map((group) => ({
                    key: group.category,
                    label: group.category,
                    children: group.properties.map((property) => {
                      const editor = propertyEditorRegistry.get(
                        property.editor,
                      );
                      const Editor = editor?.component;

                      return (
                        <Form.Item label={property.label} key={property.id}>
                          {Editor ? (
                            <Editor
                              value={readPropertyValue(
                                selectedAppNode,
                                property,
                              )}
                              options={property.options}
                              onChange={(value) =>
                                updateProperty(
                                  property.valueSource,
                                  property.valueKey,
                                  value,
                                )
                              }
                            />
                          ) : (
                            <Typography.Text type="danger">
                              Missing editor: {property.editor}
                            </Typography.Text>
                          )}
                        </Form.Item>
                      );
                    }),
                  }))}
                />
              </Form>
            ) : (
              <div className="rounded-md border border-dashed border-[#cfd7e4] bg-[#f8fafc] p-4 text-sm text-[#667085]">
                Select one component on the canvas to edit its metadata-driven
                properties.
              </div>
            )}
          </div>
        </aside>
      )}
    </Layout.Sider>
  );
}
