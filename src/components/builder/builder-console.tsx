"use client";

import { Button, Layout, Tag, Tooltip, Typography } from "antd";
import { ChevronDown, CircleCheck, Terminal } from "lucide-react";
import { useAppDispatch } from "@/hooks/use-app-dispatch";
import { useAppSelector } from "@/hooks/use-app-selector";
import { toggleConsole } from "@/store/slices/builder-slice";

export function BuilderConsole() {
  const dispatch = useAppDispatch();
  const isConsoleOpen = useAppSelector((state) => state.builder.isConsoleOpen);

  if (!isConsoleOpen) {
    return null;
  }

  return (
    <Layout.Footer className="ezyr-panel h-32 shrink-0 border-t px-0 py-0">
      <div className="flex h-full min-h-0">
        <div className="flex w-14 shrink-0 items-start justify-center border-r border-[var(--border)] py-3">
          <Terminal size={16} className="text-[#0f8ca8]" />
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex h-11 shrink-0 items-center justify-between border-b border-[var(--border)] px-4">
            <div className="flex min-w-0 items-center gap-2">
              <Typography.Text className="text-sm font-semibold text-[#172033]">
                Console
              </Typography.Text>
              <Tag color="cyan" icon={<CircleCheck size={12} />}>
                Ready
              </Tag>
            </div>
            <Tooltip title="Collapse console">
              <Button
                aria-label="Collapse console"
                icon={<ChevronDown size={16} />}
                size="small"
                type="text"
                onClick={() => dispatch(toggleConsole())}
              />
            </Tooltip>
          </div>
          <div className="min-h-0 flex-1 overflow-auto px-4 py-3">
            <Typography.Paragraph className="mb-0! text-xs! text-[#667085]!">
              Builder runtime initialized. Logs, validation output, workflow
              traces, and publish diagnostics will stream here.
            </Typography.Paragraph>
          </div>
        </div>
      </div>
    </Layout.Footer>
  );
}
