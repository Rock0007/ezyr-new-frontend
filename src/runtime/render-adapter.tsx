"use client";

import type { ReactNode } from "react";
import type { AppNode } from "@/schemas/app-spec";
import { adapterRegistry } from "@/registry/adapter";

type RenderAdapterProps = {
  readonly node: AppNode;
  readonly children?: ReactNode;
};

export function RenderAdapter({ node, children }: RenderAdapterProps) {
  const adapter = adapterRegistry.getForComponent(node.type);

  if (!adapter) {
    return (
      <div data-ezyr-runtime-error="missing-adapter">
        Missing adapter for {node.type}
      </div>
    );
  }

  const AdapterComponent = adapter.component;
  return <AdapterComponent node={node}>{children}</AdapterComponent>;
}
