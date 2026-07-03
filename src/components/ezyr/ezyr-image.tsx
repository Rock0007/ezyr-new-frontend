"use client";

import type { ReactNode } from "react";
import type { AppNode } from "@/schemas/app-spec";
import { RenderAdapter } from "@/runtime/render-adapter";

type EzyrImageProps = {
  readonly node: AppNode;
  readonly children?: ReactNode;
};

export function EzyrImage({ node, children }: EzyrImageProps) {
  return <RenderAdapter node={node}>{children}</RenderAdapter>;
}
