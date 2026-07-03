"use client";

import type { ReactNode } from "react";
import type { AppNode } from "@/schemas/app-spec";
import { RenderAdapter } from "@/runtime/render-adapter";

type EzyrCardProps = {
  readonly node: AppNode;
  readonly children?: ReactNode;
};

export function EzyrCard({ node, children }: EzyrCardProps) {
  return <RenderAdapter node={node}>{children}</RenderAdapter>;
}
