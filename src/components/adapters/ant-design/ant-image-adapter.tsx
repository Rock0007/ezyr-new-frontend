"use client";

import { Image } from "antd";
import type { ComponentAdapterProps } from "@/registry/types";
import { getStringProp } from "@/runtime/props";
import { resolveNodeStyle } from "@/runtime/style";

export function AntImageAdapter({ node }: ComponentAdapterProps) {
  const src = getStringProp(node.props, "src");
  const alt = getStringProp(node.props, "alt");

  if (!src) {
    return <div data-ezyr-placeholder="image">Image source required</div>;
  }

  return <Image alt={alt} src={src} style={resolveNodeStyle(node.style)} />;
}
