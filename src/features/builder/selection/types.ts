import type { NormalizedBuilderNode } from "@/features/builder/state/types";

export type SelectionMode =
  | "none"
  | "single"
  | "multi"
  | "marquee"
  | "parent"
  | "locked";

export type SelectionBounds = {
  left: number;
  top: number;
  width: number;
  height: number;
};

export type SelectionStateShape = {
  activeNodeId: string | null;
  selectedIds: string[];
  hoveredId: string | null;
  focusedNodeId: string | null;
  selectionBounds: SelectionBounds | null;
  selectionMode: SelectionMode;
  lastSelectedNodeId: string | null;
};

export type SelectionClickModifiers = {
  altKey?: boolean;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
};

export type SelectionClickInput = {
  nodeId: string;
  modifiers?: SelectionClickModifiers;
  nodes: Record<string, NormalizedBuilderNode>;
  state: SelectionStateShape;
};

export type SelectionValidationResult = {
  selectedIds: string[];
  activeNodeId: string | null;
  focusedNodeId: string | null;
  lastSelectedNodeId: string | null;
  selectionMode: SelectionMode;
};
