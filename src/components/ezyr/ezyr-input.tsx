"use client";

import type { ReactNode } from "react";
import type { AppNode } from "@/schemas/app-spec";
import { RenderAdapter } from "@/runtime/render-adapter";

type EzyrInputProps = {
  readonly node: AppNode;
  readonly children?: ReactNode;
};

export function EzyrInput({ node, children }: EzyrInputProps) {
  return <RenderAdapter node={node}>{children}</RenderAdapter>;
}
