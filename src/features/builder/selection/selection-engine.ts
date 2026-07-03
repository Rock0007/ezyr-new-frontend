import type { NormalizedBuilderNode } from "@/features/builder/state/types";
import type {
  SelectionClickInput,
  SelectionValidationResult,
} from "./types";

function uniqueExistingIds(
  nodeIds: readonly string[],
  nodes: Record<string, NormalizedBuilderNode>,
): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  nodeIds.forEach((nodeId) => {
    if (!nodes[nodeId] || seen.has(nodeId)) {
      return;
    }

    seen.add(nodeId);
    result.push(nodeId);
  });

  return result;
}

function resolveTargetNodeId(
  nodeId: string,
  nodes: Record<string, NormalizedBuilderNode>,
  useParent: boolean,
): string | null {
  const node = nodes[nodeId];

  if (!node) {
    return null;
  }

  return useParent && node.parentId ? node.parentId : node.id;
}

function haveSameParent(
  nodeIds: readonly string[],
  nodes: Record<string, NormalizedBuilderNode>,
): boolean {
  const firstParentId = nodes[nodeIds[0]]?.parentId;

  return nodeIds.every((nodeId) => nodes[nodeId]?.parentId === firstParentId);
}

function getSiblingRange(
  anchorId: string,
  targetId: string,
  nodes: Record<string, NormalizedBuilderNode>,
): string[] | null {
  const anchor = nodes[anchorId];
  const target = nodes[targetId];

  if (!anchor || !target || anchor.parentId !== target.parentId) {
    return null;
  }

  const siblings =
    anchor.parentId === null ? [anchor.id] : nodes[anchor.parentId]?.childIds;

  if (!siblings) {
    return null;
  }

  const anchorIndex = siblings.indexOf(anchorId);
  const targetIndex = siblings.indexOf(targetId);

  if (anchorIndex < 0 || targetIndex < 0) {
    return null;
  }

  const start = Math.min(anchorIndex, targetIndex);
  const end = Math.max(anchorIndex, targetIndex);

  return siblings.slice(start, end + 1);
}

function toSelectionResult(
  selectedIds: string[],
  activeNodeId: string | null,
  parentMode = false,
): SelectionValidationResult {
  const mode =
    selectedIds.length === 0 ? "none" : selectedIds.length === 1 ? "single" : "multi";

  return {
    activeNodeId,
    focusedNodeId: activeNodeId,
    lastSelectedNodeId: activeNodeId,
    selectedIds,
    selectionMode: parentMode && activeNodeId ? "parent" : mode,
  };
}

export function resolveSelectionClick({
  nodeId,
  modifiers,
  nodes,
  state,
}: SelectionClickInput): SelectionValidationResult {
  const targetId = resolveTargetNodeId(nodeId, nodes, Boolean(modifiers?.altKey));

  if (!targetId) {
    return toSelectionResult([], null);
  }

  const isPrimaryToggle = Boolean(modifiers?.ctrlKey || modifiers?.metaKey);

  if (modifiers?.shiftKey && state.lastSelectedNodeId) {
    const range = getSiblingRange(state.lastSelectedNodeId, targetId, nodes);

    if (range) {
      return toSelectionResult(
        uniqueExistingIds(range, nodes),
        targetId,
        Boolean(modifiers.altKey),
      );
    }
  }

  if (isPrimaryToggle) {
    const currentIds = uniqueExistingIds(state.selectedIds, nodes);
    const alreadySelected = currentIds.includes(targetId);
    const nextIds = alreadySelected
      ? currentIds.filter((selectedId) => selectedId !== targetId)
      : [...currentIds, targetId];
    const validIds =
      nextIds.length <= 1 || haveSameParent(nextIds, nodes) ? nextIds : [targetId];
    const nextActiveId = alreadySelected
      ? validIds.at(-1) ?? null
      : targetId;

    return toSelectionResult(
      validIds,
      nextActiveId,
      Boolean(modifiers?.altKey),
    );
  }

  return toSelectionResult([targetId], targetId, Boolean(modifiers?.altKey));
}

export function sanitizeSelection(
  state: SelectionStateShapeCompat,
  nodes: Record<string, NormalizedBuilderNode>,
): SelectionValidationResult {
  const selectedIds = uniqueExistingIds(state.selectedIds, nodes);
  const activeNodeId =
    (state.activeNodeId && selectedIds.includes(state.activeNodeId)
      ? state.activeNodeId
      : selectedIds.at(-1)) ?? null;

  return {
    activeNodeId,
    focusedNodeId:
      state.focusedNodeId && nodes[state.focusedNodeId]
        ? state.focusedNodeId
        : activeNodeId,
    lastSelectedNodeId:
      state.lastSelectedNodeId && nodes[state.lastSelectedNodeId]
        ? state.lastSelectedNodeId
        : activeNodeId,
    selectedIds,
    selectionMode:
      selectedIds.length === 0 ? "none" : selectedIds.length === 1 ? "single" : "multi",
  };
}

export function getSelectableSiblingIds(
  nodes: Record<string, NormalizedBuilderNode>,
  activeNodeId: string | null,
  rootNodeId: string | null,
): string[] {
  const activeNode = activeNodeId ? nodes[activeNodeId] : null;
  const parentId = activeNode?.parentId ?? rootNodeId;

  if (!parentId) {
    return [];
  }

  return (nodes[parentId]?.childIds ?? []).filter((nodeId) => nodes[nodeId]);
}

export function normalizeMarqueeSelection(
  nodeIds: readonly string[],
  nodes: Record<string, NormalizedBuilderNode>,
): string[] {
  const existingIds = uniqueExistingIds(nodeIds, nodes).filter(
    (nodeId, _index, allIds) =>
      !allIds.some((candidateId) => {
        if (candidateId === nodeId) {
          return false;
        }

        let currentId = nodes[candidateId]?.parentId ?? null;

        while (currentId) {
          if (currentId === nodeId) {
            return true;
          }

          currentId = nodes[currentId]?.parentId ?? null;
        }

        return false;
      }),
  );
  const firstParentId = nodes[existingIds[0]]?.parentId;

  if (!firstParentId) {
    return existingIds.slice(0, 1);
  }

  return existingIds.filter((nodeId) => nodes[nodeId]?.parentId === firstParentId);
}

type SelectionStateShapeCompat = {
  activeNodeId: string | null;
  selectedIds: string[];
  focusedNodeId: string | null;
  lastSelectedNodeId: string | null;
};
