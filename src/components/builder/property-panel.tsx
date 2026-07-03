"use client";

import { Button, Collapse, Form, Layout, Tooltip, Typography } from "antd";
import { ChevronLeft, ChevronRight, SlidersHorizontal } from "lucide-react";
import { EzyrPanelHeader } from "@/components/ui";
import {
  groupProperties,
  propertyEditorRegistry,
  readPropertyValue,
} from "@/features/builder/property-panel";
import { hydrateAppNode } from "@/features/builder/state/normalization";
import { selectActiveSelectedNode } from "@/features/builder/state/selectors";
import { useAppDispatch } from "@/hooks/use-app-dispatch";
import { useAppSelector } from "@/hooks/use-app-selector";
import { propertyRegistry } from "@/registry/property";
import type { JsonValue } from "@/schemas/app-spec";
import {
  updateNodeProps,
  updateNodeStyle,
} from "@/store/slices/builder-document-slice";
import { toggleRightPanel } from "@/store/slices/builder-slice";

type PropertySource = "props" | "style" | "bindings" | "events";

export function PropertyPanel() {
  const dispatch = useAppDispatch();
  const isCollapsed = useAppSelector(
    (state) => state.builder.isRightPanelCollapsed,
  );
  const nodes = useAppSelector((state) => state.builderDocument.nodes);
  const selectedNode = useAppSelector(selectActiveSelectedNode);
  const selectedCount = useAppSelector((state) => state.selection.selectedIds.length);
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
  const defaultActivePropertyGroups = propertyGroups
    .filter(
      (group, index) =>
        index < 4 || group.category === "Scroll" || group.category === "Layout",
    )
    .map((group) => group.category);

  const updateProperty = (
    propertySource: PropertySource,
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
      width={340}
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
          <EzyrPanelHeader
            title="Properties"
            icon={<SlidersHorizontal size={16} className="text-[#0f8ca8]" />}
            action={
              <Tooltip title="Collapse properties">
                <Button
                  aria-label="Collapse properties panel"
                  icon={<ChevronRight size={16} />}
                  size="small"
                  type="text"
                  onClick={() => dispatch(toggleRightPanel())}
                />
              </Tooltip>
            }
          />
          <div className="min-h-0 flex-1 overflow-auto px-3 py-3">
            {selectedAppNode ? (
              <Form
                className="builder-property-form"
                layout="vertical"
                size="small"
              >
                <div className="mb-2 rounded-md border border-[#d8dee9] bg-[#f8fafc] px-3 py-2">
                  <Typography.Text className="block text-[11px] font-medium text-[#667085]">
                    {selectedCount > 1 ? `${selectedCount} selected` : "Selected"}
                  </Typography.Text>
                  <Typography.Text className="block truncate text-sm font-semibold leading-5 text-[#172033]">
                    {selectedAppNode.type} / {selectedAppNode.id}
                  </Typography.Text>
                </div>
                <Collapse
                  className="builder-properties-collapse"
                  defaultActiveKey={defaultActivePropertyGroups}
                  ghost
                  items={propertyGroups.map((group) => ({
                    key: group.category,
                    label: (
                      <span className="text-[13px] font-semibold text-[#172033]">
                        {group.category}
                      </span>
                    ),
                    children: (
                      <div className="grid gap-2">
                        {group.properties.map((property) => {
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
                        })}
                      </div>
                    ),
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
