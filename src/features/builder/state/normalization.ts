import type { AppNode } from "@/schemas/app-spec";
import type { NormalizedBuilderNode } from "./types";

export function normalizeAppNode(
  node: AppNode,
  parentId: string | null = null,
  nodes: Record<string, NormalizedBuilderNode> = {},
): Record<string, NormalizedBuilderNode> {
  nodes[node.id] = {
    id: node.id,
    type: node.type,
    parentId,
    childIds: node.children.map((child) => child.id),
    props: node.props,
    style: node.style,
    bindings: node.bindings,
    events: node.events,
  };

  node.children.forEach((child) => normalizeAppNode(child, node.id, nodes));
  return nodes;
}

export function hydrateAppNode(
  nodeId: string,
  nodes: Record<string, NormalizedBuilderNode>,
): AppNode | null {
  const node = nodes[nodeId];

  if (!node) {
    return null;
  }

  return {
    id: node.id,
    type: node.type,
    props: node.props,
    style: node.style,
    bindings: node.bindings,
    events: node.events,
    children: node.childIds
      .map((childId) => hydrateAppNode(childId, nodes))
      .filter((child): child is AppNode => child !== null),
  };
}

export function collectSubtreeIds(
  nodeId: string,
  nodes: Record<string, NormalizedBuilderNode>,
): string[] {
  const node = nodes[nodeId];

  if (!node) {
    return [];
  }

  return [
    nodeId,
    ...node.childIds.flatMap((childId) => collectSubtreeIds(childId, nodes)),
  ];
}

export function isDescendantOf(
  candidateId: string,
  possibleAncestorId: string,
  nodes: Record<string, NormalizedBuilderNode>,
): boolean {
  let current = nodes[candidateId]?.parentId ?? null;

  while (current) {
    if (current === possibleAncestorId) {
      return true;
    }

    current = nodes[current]?.parentId ?? null;
  }

  return false;
}
