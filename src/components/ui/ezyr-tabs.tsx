"use client";

import { Tabs } from "antd";
import type { TabsProps } from "antd";
import { cn } from "@/utils/cn";

export function EzyrTabs({ className, ...props }: TabsProps) {
  return <Tabs {...props} className={cn("ezyr-tabs", className)} />;
}
