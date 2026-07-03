"use client";

import type { ReactNode } from "react";
import type { AppNode } from "@/schemas/app-spec";
import { RenderAdapter } from "@/runtime/render-adapter";

type EzyrFrameProps = {
  readonly node: AppNode;
  readonly children?: ReactNode;
};

export function EzyrFrame({ node, children }: EzyrFrameProps) {
  return <RenderAdapter node={node}>{children}</RenderAdapter>;
}
