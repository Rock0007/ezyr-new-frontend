"use client";

import { Typography } from "antd";
import type { ComponentAdapterProps } from "@/registry/types";
import { getStringProp } from "@/runtime/props";

export function AntTextAdapter({ node }: ComponentAdapterProps) {
  const text = getStringProp(node.props, "text", "Text");
  const level = getStringProp(node.props, "level", "body");

  if (level === "heading") {
    return <Typography.Title level={2}>{text}</Typography.Title>;
  }

  return <Typography.Text>{text}</Typography.Text>;
}
