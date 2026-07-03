"use client";

import { Typography } from "antd";
import type { ComponentAdapterProps } from "@/registry/types";
import { getStringProp } from "@/runtime/props";
import { resolveNodeStyle } from "@/runtime/style";

export function AntTextAdapter({ node }: ComponentAdapterProps) {
  const text = getStringProp(node.props, "text", "Text");
  const level = getStringProp(node.props, "level", "body");
  const style = resolveNodeStyle(node.style);

  if (level === "heading") {
    return (
      <Typography.Title level={2} style={style}>
        {text}
      </Typography.Title>
    );
  }

  return <Typography.Text style={style}>{text}</Typography.Text>;
}
