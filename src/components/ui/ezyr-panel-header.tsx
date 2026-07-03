"use client";

import { Typography } from "antd";
import type { ReactNode } from "react";
import { cn } from "@/utils/cn";

type EzyrPanelHeaderProps = {
  title: string;
  eyebrow?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
};

export function EzyrPanelHeader({
  title,
  eyebrow,
  icon,
  action,
  className,
}: EzyrPanelHeaderProps) {
  return (
    <div
      className={cn(
        "flex min-h-12 shrink-0 items-center justify-between border-b border-[var(--border)] px-4 py-3",
        className,
      )}
    >
      <div className="flex min-w-0 items-center gap-2">
        {icon}
        <div className="min-w-0">
          {eyebrow && (
            <Typography.Text className="block text-[10px] font-semibold uppercase tracking-wide text-[#667085]">
              {eyebrow}
            </Typography.Text>
          )}
          <Typography.Text className="block truncate text-sm font-semibold text-[#172033]">
            {title}
          </Typography.Text>
        </div>
      </div>
      {action}
    </div>
  );
}
