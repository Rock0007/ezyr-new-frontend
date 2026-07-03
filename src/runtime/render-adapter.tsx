"use client";

import type { ReactNode } from "react";
import type { AppNode } from "@/schemas/app-spec";
import { adapterRegistry } from "@/registry/adapter";
import { RuntimeDiagnostic } from "@/runtime/diagnostics";

type RenderAdapterProps = {
  readonly node: AppNode;
  readonly children?: ReactNode;
};

export function RenderAdapter({ node, children }: RenderAdapterProps) {
  const adapter = adapterRegistry.getForComponent(node.type);

  if (!adapter) {
    return (
      <RuntimeDiagnostic
        code="missing-adapter"
        message={`Missing adapter for ${node.type}.`}
        nodeId={node.id}
        title="Missing adapter"
      />
    );
  }

  const AdapterComponent = adapter.component;
  return <AdapterComponent node={node}>{children}</AdapterComponent>;
}
