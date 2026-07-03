import type { AppNode } from "@/schemas/app-spec";
import {
  collectSubtreeIds,
  hydrateAppNode,
  isDescendantOf,
} from "@/features/builder/state/normalization";
import type {
  BuilderClipboard,
  NormalizedBuilderNode,
} from "@/features/builder/state/types";

export type IdFactory = (sourceId: string) => string;

export function createClipboard(
  selectedNodeIds: readonly string[],
  nodes: Record<string, NormalizedBuilderNode>,
): BuilderClipboard | null {
  const rootIds = selectedNodeIds.filter((nodeId) => {
    if (!nodes[nodeId]) {
      return false;
    }

    return !selectedNodeIds.some(
      (candidateId) =>
        candidateId !== nodeId &&
        nodes[candidateId] &&
        isDescendantOf(nodeId, candidateId, nodes),
    );
  });

  if (rootIds.length === 0) {
    return null;
  }

  const subtreeIds = new Set(
    rootIds.flatMap((nodeId) => collectSubtreeIds(nodeId, nodes)),
  );
  const copiedNodes: Record<string, NormalizedBuilderNode> = {};

  subtreeIds.forEach((nodeId) => {
    copiedNodes[nodeId] = {
      ...nodes[nodeId],
      childIds: [...nodes[nodeId].childIds],
    };
  });

  return {
    nodeIds: Array.from(subtreeIds),
    nodes: copiedNodes,
    rootIds,
  };
}

export function cloneClipboardRootNodes(
  clipboard: BuilderClipboard,
  createId: IdFactory,
): AppNode[] {
  const idMap = new Map(
    clipboard.nodeIds.map((nodeId) => [nodeId, createId(nodeId)]),
  );

  const remappedNodes: Record<string, NormalizedBuilderNode> = {};
  clipboard.nodeIds.forEach((sourceId) => {
    const source = clipboard.nodes[sourceId];
    const nextId = idMap.get(sourceId);

    if (!source || !nextId) {
      return;
    }

    remappedNodes[nextId] = {
      ...source,
      id: nextId,
      parentId: source.parentId ? (idMap.get(source.parentId) ?? null) : null,
      childIds: source.childIds
        .map((childId) => idMap.get(childId))
        .filter((childId): childId is string => Boolean(childId)),
    };
  });

  return clipboard.rootIds
    .map((rootId) => idMap.get(rootId))
    .filter((rootId): rootId is string => Boolean(rootId))
    .map((rootId) => hydrateAppNode(rootId, remappedNodes))
    .filter((node): node is AppNode => node !== null);
}
