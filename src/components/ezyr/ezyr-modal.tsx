"use client";

import type { ReactNode } from "react";
import type { AppNode } from "@/schemas/app-spec";
import { RenderAdapter } from "@/runtime/render-adapter";

type EzyrModalProps = {
  readonly node: AppNode;
  readonly children?: ReactNode;
};

export function EzyrModal({ node, children }: EzyrModalProps) {
  return <RenderAdapter node={node}>{children}</RenderAdapter>;
}
