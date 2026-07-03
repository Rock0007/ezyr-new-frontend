"use client";

import * as Antd from "antd";
import { createElement, isValidElement, type ComponentType } from "react";
import type { ComponentAdapterProps } from "@/registry/types";
import type { JsonObject, JsonValue } from "@/schemas/app-spec";
import { resolveNodeStyle } from "@/runtime/style";

type GenericAntComponent = ComponentType<Record<string, unknown>>;

const componentMap = Antd as unknown as Record<
  string,
  GenericAntComponent | undefined
>;

function toRenderableValue(
  value: JsonValue | undefined,
): string | number | undefined {
  if (typeof value === "string" || typeof value === "number") {
    return value;
  }

  return undefined;
}

function toProps(
  props: JsonObject,
  style: JsonObject,
): Record<string, unknown> {
  return {
    ...props,
    style: resolveNodeStyle(style),
  };
}

function fallbackChildren(nodeType: string, props: JsonObject) {
  const children = toRenderableValue(props.children);

  if (children !== undefined) {
    return children;
  }

  const text = toRenderableValue(props.text);

  if (text !== undefined) {
    return text;
  }

  if (["Button", "Tag", "Typography", "Checkbox", "Radio"].includes(nodeType)) {
    return nodeType;
  }

  return undefined;
}

export function AntGenericAdapter({ node, children }: ComponentAdapterProps) {
  const Component = componentMap[node.type];

  if (!Component) {
    return (
      <div data-ezyr-runtime-error="missing-ant-component">
        Missing Ant Design component: {node.type}
      </div>
    );
  }

  const props = toProps(node.props, node.style);
  const hasRenderedChildren = Array.isArray(children)
    ? children.length > 0
    : children !== undefined && children !== null;
  const resolvedChildren =
    hasRenderedChildren || isValidElement(children)
      ? children
      : fallbackChildren(node.type, node.props);

  return createElement(Component, props, resolvedChildren);
}
