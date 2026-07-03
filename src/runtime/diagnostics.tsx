"use client";

import type { ReactNode } from "react";
import type { ValidationIssue } from "@/registry/types";

type RuntimeDiagnosticProps = {
  readonly code: string;
  readonly title: string;
  readonly message: string;
  readonly nodeId?: string;
  readonly children?: ReactNode;
};

export function RuntimeDiagnostic({
  code,
  title,
  message,
  nodeId,
  children,
}: RuntimeDiagnosticProps) {
  return (
    <div
      className="rounded-md border border-[#f5c2c7] bg-[#fff5f5] p-3 text-xs text-[#842029]"
      data-ezyr-runtime-error={code}
      data-node-id={nodeId}
      role="alert"
    >
      <div className="font-semibold">{title}</div>
      <div className="mt-1">{message}</div>
      {children ? <div className="mt-2">{children}</div> : null}
    </div>
  );
}

export function RuntimeDiagnosticsList({
  issues,
}: {
  readonly issues: readonly ValidationIssue[];
}) {
  return (
    <div
      className="space-y-2 rounded-md border border-[#f5c2c7] bg-[#fff5f5] p-3 text-xs text-[#842029]"
      data-ezyr-runtime-error="validation-failed"
      role="alert"
    >
      <div className="font-semibold">AppSpec validation failed.</div>
      {issues.slice(0, 6).map((issue) => (
        <div key={`${issue.code}-${issue.nodeId ?? issue.path ?? issue.message}`}>
          <span className="font-medium">{issue.code}</span>
          {issue.nodeId ? <span> · {issue.nodeId}</span> : null}
          <div>{issue.message}</div>
          {issue.suggestedFix ? (
            <div className="text-[#9a3412]">{issue.suggestedFix}</div>
          ) : null}
        </div>
      ))}
    </div>
  );
}
