"use client";

import type { ReactNode } from "react";
import type { AppNode, AppSpec } from "@/schemas/app-spec";
import { rendererRegistry } from "@/registry/renderer";
import { validatorRegistry } from "@/registry/validator";

export function renderAppNode(node: AppNode): ReactNode {
  const renderer = rendererRegistry.get(node.type);
  const children = node.children.map((child) => renderAppNode(child));

  if (!renderer) {
    return (
      <div key={node.id} data-ezyr-runtime-error="missing-renderer">
        Missing renderer for {node.type}
      </div>
    );
  }

  return <div key={node.id}>{renderer.render(node, children)}</div>;
}

type RenderAppSpecProps = {
  readonly spec: AppSpec;
  readonly pageId?: string;
};

export function RenderAppSpec({ spec, pageId }: RenderAppSpecProps) {
  const page = pageId
    ? spec.pages.find((candidate) => candidate.id === pageId)
    : spec.pages[0];

  if (!page) {
    return <div data-ezyr-runtime-error="missing-page">Missing page</div>;
  }

  const issues = validatorRegistry.validate(page.root);
  const hasErrors = issues.some((issue) => issue.severity === "error");

  if (hasErrors) {
    return (
      <div data-ezyr-runtime-error="validation-failed">
        AppSpec validation failed.
      </div>
    );
  }

  return renderAppNode(page.root);
}
