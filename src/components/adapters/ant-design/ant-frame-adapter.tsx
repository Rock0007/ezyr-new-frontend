"use client";

import type { CSSProperties } from "react";
import type { ComponentAdapterProps } from "@/registry/types";
import { getStringProp } from "@/runtime/props";

export function AntFrameAdapter({ node, children }: ComponentAdapterProps) {
  const style: CSSProperties = {
    background: getStringProp(node.style, "background", "transparent"),
    minHeight: getStringProp(node.style, "minHeight", "auto"),
    padding: getStringProp(node.style, "padding", "0"),
  };

  return <div style={style}>{children}</div>;
}
