"use client";

import { Component, memo, type ErrorInfo, type ReactNode } from "react";
import type { AppNode, AppSpec } from "@/schemas/app-spec";
import { rendererRegistry } from "@/registry/renderer";
import { validatorRegistry } from "@/registry/validator";
import type { ValidationIssue } from "@/registry/types";
import {
  RuntimeDiagnostic,
  RuntimeDiagnosticsList,
} from "@/runtime/diagnostics";

type NodeErrorBoundaryProps = {
  readonly node: AppNode;
  readonly children: ReactNode;
};

type NodeErrorBoundaryState = {
  readonly error: Error | null;
};

class NodeErrorBoundary extends Component<
  NodeErrorBoundaryProps,
  NodeErrorBoundaryState
> {
  state: NodeErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): NodeErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    if (process.env.NODE_ENV !== "production") {
      console.error("Ezyr node render failed", {
        error,
        errorInfo,
        nodeId: this.props.node.id,
        nodeType: this.props.node.type,
      });
    }
  }

  render() {
    if (this.state.error) {
      return (
        <RuntimeDiagnostic
          code="renderer-crashed"
          message={this.state.error.message}
          nodeId={this.props.node.id}
          title={`Renderer crashed for ${this.props.node.type}`}
        />
      );
    }

    return this.props.children;
  }
}

function issuesForNode(
  nodeId: string,
  issues: readonly ValidationIssue[],
): readonly ValidationIssue[] {
  return issues.filter((issue) => issue.nodeId === nodeId);
}

function hasNodeError(nodeIssues: readonly ValidationIssue[]): boolean {
  return nodeIssues.some((issue) => issue.severity === "error");
}

export function renderAppNode(
  node: AppNode,
  issues: readonly ValidationIssue[] = [],
): ReactNode {
  const renderer = rendererRegistry.resolve(node.type);
  const nodeIssues = issuesForNode(node.id, issues);

  if (hasNodeError(nodeIssues)) {
    return (
      <RuntimeDiagnostic
        key={node.id}
        code={nodeIssues[0]?.code ?? "invalid-node"}
        message={nodeIssues[0]?.message ?? "Node failed validation."}
        nodeId={node.id}
        title={`Invalid ${node.type}`}
      />
    );
  }

  const children = node.children.map((child) => renderAppNode(child, issues));

  if (!renderer) {
    return (
      <RuntimeDiagnostic
        key={node.id}
        code="missing-renderer"
        message={`Missing renderer for ${node.type}.`}
        nodeId={node.id}
        title="Missing renderer"
      />
    );
  }

  try {
    return (
      <NodeErrorBoundary key={node.id} node={node}>
        <div data-ezyr-node-id={node.id}>{renderer.render(node, children)}</div>
      </NodeErrorBoundary>
    );
  } catch (error) {
    return (
      <RuntimeDiagnostic
        key={node.id}
        code="renderer-threw"
        message={error instanceof Error ? error.message : "Unknown render error."}
        nodeId={node.id}
        title={`Renderer failed for ${node.type}`}
      />
    );
  }
}

type RenderAppSpecProps = {
  readonly spec: AppSpec;
  readonly pageId?: string;
};

function RenderAppSpecBase({ spec, pageId }: RenderAppSpecProps) {
  const page = pageId
    ? spec.pages.find((candidate) => candidate.id === pageId)
    : spec.pages[0];

  if (!page) {
    return (
      <RuntimeDiagnostic
        code="missing-page"
        message="The requested page does not exist in this AppSpec."
        title="Missing page"
      />
    );
  }

  const issues = validatorRegistry.validateSpec(spec);
  const blockingIssues = issues.filter(
    (issue) => issue.severity === "error" && !issue.nodeId,
  );

  if (blockingIssues.length > 0) {
    return <RuntimeDiagnosticsList issues={blockingIssues} />;
  }

  return renderAppNode(page.root, issues);
}

export const RenderAppSpec = memo(RenderAppSpecBase);
