"use client";

import type { ReactNode } from "react";
import type { AppNode } from "@/schemas/app-spec";
import { RenderAdapter } from "@/runtime/render-adapter";

type EzyrButtonProps = {
  readonly node: AppNode;
  readonly children?: ReactNode;
};

export function EzyrButton({ node, children }: EzyrButtonProps) {
  return <RenderAdapter node={node}>{children}</RenderAdapter>;
}
