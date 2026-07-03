"use client";

import type { ComponentAdapterProps } from "@/registry/types";
import { resolveNodeStyle } from "@/runtime/style";

export function AntSectionAdapter({ node, children }: ComponentAdapterProps) {
  const style = {
    background: "#ffffff",
    borderRadius: "6px",
    padding: "24px",
    ...resolveNodeStyle(node.style),
  };

  return <section style={style}>{children}</section>;
}
