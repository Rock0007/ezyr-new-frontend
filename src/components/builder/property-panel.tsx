"use client";

import {
  Button,
  Collapse,
  Form,
  Input,
  Layout,
  Select,
  Slider,
  Switch,
  Tooltip,
  Typography,
} from "antd";
import { ChevronLeft, ChevronRight, SlidersHorizontal } from "lucide-react";
import { useAppDispatch } from "@/hooks/use-app-dispatch";
import { useAppSelector } from "@/hooks/use-app-selector";
import { toggleRightPanel } from "@/store/slices/builder-slice";

export function PropertyPanel() {
  const dispatch = useAppDispatch();
  const isCollapsed = useAppSelector(
    (state) => state.builder.isRightPanelCollapsed,
  );

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
            <Form layout="vertical" size="small">
              <Collapse
                className="builder-properties-collapse"
                defaultActiveKey={["identity", "layout", "style"]}
                ghost
                items={[
                  {
                    key: "identity",
                    label: "Identity",
                    children: (
                      <>
                        <Form.Item label="Name">
                          <Input defaultValue="Home section" />
                        </Form.Item>
                        <Form.Item label="Element">
                          <Select
                            defaultValue="section"
                            options={[
                              { value: "section", label: "Section" },
                              { value: "container", label: "Container" },
                              { value: "component", label: "Component" },
                            ]}
                          />
                        </Form.Item>
                      </>
                    ),
                  },
                  {
                    key: "layout",
                    label: "Layout",
                    children: (
                      <>
                        <Form.Item label="Width">
                          <Slider defaultValue={100} min={25} />
                        </Form.Item>
                        <Form.Item label="Padding">
                          <Slider defaultValue={32} max={96} />
                        </Form.Item>
                        <Form.Item label="Responsive">
                          <Switch defaultChecked />
                        </Form.Item>
                      </>
                    ),
                  },
                  {
                    key: "style",
                    label: "Style",
                    children: (
                      <>
                        <Form.Item label="Background">
                          <Input defaultValue="#ffffff" />
                        </Form.Item>
                        <Form.Item label="Radius">
                          <Slider defaultValue={6} max={32} />
                        </Form.Item>
                      </>
                    ),
                  },
                ]}
              />
            </Form>
          </div>
        </aside>
      )}
    </Layout.Sider>
  );
}
