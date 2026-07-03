"use client";

import type { ReactNode } from "react";
import type { AppNode } from "@/schemas/app-spec";
import { RenderAdapter } from "@/runtime/render-adapter";

type EzyrGenericProps = {
  readonly node: AppNode;
  readonly children?: ReactNode;
};

export function EzyrGeneric({ node, children }: EzyrGenericProps) {
  return <RenderAdapter node={node}>{children}</RenderAdapter>;
}
