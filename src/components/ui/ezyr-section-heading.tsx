"use client";

import { Typography } from "antd";
import type { ReactNode } from "react";

type EzyrSectionHeadingProps = {
  title: string;
  description?: string;
  action?: ReactNode;
};

export function EzyrSectionHeading({
  title,
  description,
  action,
}: EzyrSectionHeadingProps) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <Typography.Text className="block truncate text-sm font-semibold text-[#172033]">
          {title}
        </Typography.Text>
        {description && (
          <Typography.Text className="mt-0.5 block text-xs text-[#667085]">
            {description}
          </Typography.Text>
        )}
      </div>
      {action}
    </div>
  );
}
