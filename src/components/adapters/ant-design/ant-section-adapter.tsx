"use client";

import type { CSSProperties } from "react";
import type { ComponentAdapterProps } from "@/registry/types";
import { getStringProp } from "@/runtime/props";

export function AntSectionAdapter({ node, children }: ComponentAdapterProps) {
  const style: CSSProperties = {
    background: getStringProp(node.style, "background", "#ffffff"),
    borderRadius: getStringProp(node.style, "radius", "6px"),
    padding: getStringProp(node.style, "padding", "24px"),
  };

  return <section style={style}>{children}</section>;
}
