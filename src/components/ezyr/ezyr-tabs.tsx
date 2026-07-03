"use client";

import type { ReactNode } from "react";
import type { AppNode } from "@/schemas/app-spec";
import { RenderAdapter } from "@/runtime/render-adapter";

type EzyrTabsProps = {
  readonly node: AppNode;
  readonly children?: ReactNode;
};

export function EzyrTabs({ node, children }: EzyrTabsProps) {
  return <RenderAdapter node={node}>{children}</RenderAdapter>;
}
