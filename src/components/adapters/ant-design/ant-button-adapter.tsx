"use client";

import { Button } from "antd";
import type { ButtonProps } from "antd";
import type { ComponentAdapterProps } from "@/registry/types";
import { getBooleanProp, getStringProp } from "@/runtime/props";

const buttonTypeByVariant: Record<string, ButtonProps["type"]> = {
  primary: "primary",
  default: "default",
  dashed: "dashed",
  text: "text",
  link: "link",
};

export function AntButtonAdapter({ node }: ComponentAdapterProps) {
  const text = getStringProp(node.props, "text", "Button");
  const variant = getStringProp(node.props, "variant", "primary");
  const size = getStringProp(node.props, "size", "middle");
  const disabled = getBooleanProp(node.props, "disabled", false);
  const loading = getBooleanProp(node.props, "loading", false);

  return (
    <Button
      disabled={disabled}
      loading={loading}
      size={size === "large" || size === "small" ? size : "middle"}
      type={buttonTypeByVariant[variant] ?? "primary"}
    >
      {text}
    </Button>
  );
}
