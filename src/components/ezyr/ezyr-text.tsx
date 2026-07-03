"use client";

import type { ReactNode } from "react";
import type { AppNode } from "@/schemas/app-spec";
import { RenderAdapter } from "@/runtime/render-adapter";

type EzyrTextProps = {
  readonly node: AppNode;
  readonly children?: ReactNode;
};

export function EzyrText({ node, children }: EzyrTextProps) {
  return <RenderAdapter node={node}>{children}</RenderAdapter>;
}
