import type { RootState } from "@/store/store";
import { hydrateAppNode } from "./normalization";

export function selectActiveRootNode(state: RootState) {
  const rootId =
    state.builderDocument.rootNodeIdsByPage[state.builderDocument.activePageId];

  return rootId ? hydrateAppNode(rootId, state.builderDocument.nodes) : null;
}

export function selectNodeById(state: RootState, nodeId: string) {
  return state.builderDocument.nodes[nodeId] ?? null;
}

export function selectSelectedNodes(state: RootState) {
  return state.selection.selectedIds
    .map((nodeId) => state.builderDocument.nodes[nodeId])
    .filter((node) => node !== undefined);
}

export function selectActiveSelectedNode(state: RootState) {
  const activeNodeId = state.selection.activeNodeId;

  return activeNodeId ? (state.builderDocument.nodes[activeNodeId] ?? null) : null;
}
