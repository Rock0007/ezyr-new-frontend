"use client";

import type { ReactNode } from "react";
import type { AppNode } from "@/schemas/app-spec";
import { RenderAdapter } from "@/runtime/render-adapter";

type EzyrSectionProps = {
  readonly node: AppNode;
  readonly children?: ReactNode;
};

export function EzyrSection({ node, children }: EzyrSectionProps) {
  return <RenderAdapter node={node}>{children}</RenderAdapter>;
}
