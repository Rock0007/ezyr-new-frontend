"use client";

import type { ComponentAdapterProps } from "@/registry/types";
import { resolveNodeStyle } from "@/runtime/style";

export function AntFrameAdapter({ node, children }: ComponentAdapterProps) {
  const style = {
    background: "transparent",
    minHeight: "auto",
    padding: "0",
    ...resolveNodeStyle(node.style),
  };

  return <div style={style}>{children}</div>;
}
