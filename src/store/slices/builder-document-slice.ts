import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { AppNode, JsonObject } from "@/schemas/app-spec";
import {
  collectSubtreeIds,
  isDescendantOf,
  normalizeAppNode,
} from "@/features/builder/state/normalization";
import { initialBuilderDocumentState } from "@/features/builder/state/initial-document";
import type {
  BuilderCommand,
  BuilderClipboard,
  BuilderDragSession,
  DropIndicator,
} from "@/features/builder/state/types";

type InsertNodePayload = {
  node: AppNode;
  parentId: string;
  index?: number;
};

type MoveNodePayload = {
  nodeId: string;
  parentId: string;
  index: number;
};

type UpdateNodePropsPayload = {
  nodeId: string;
  props: JsonObject;
};

type UpdateNodeStylePayload = {
  nodeId: string;
  style: JsonObject;
};

function insertChildId(
  childIds: string[],
  childId: string,
  index = childIds.length,
): void {
  const boundedIndex = Math.min(Math.max(index, 0), childIds.length);
  childIds.splice(boundedIndex, 0, childId);
}

function removeChildId(childIds: string[], childId: string): void {
  const index = childIds.indexOf(childId);

  if (index >= 0) {
    childIds.splice(index, 1);
  }
}

const builderDocumentSlice = createSlice({
  name: "builderDocument",
  initialState: initialBuilderDocumentState,
  reducers: {
    insertNode: (state, action: PayloadAction<InsertNodePayload>) => {
      const parent = state.nodes[action.payload.parentId];

      if (!parent || state.nodes[action.payload.node.id]) {
        return;
      }

      const normalized = normalizeAppNode(
        action.payload.node,
        action.payload.parentId,
      );
      Object.assign(state.nodes, normalized);
      insertChildId(
        parent.childIds,
        action.payload.node.id,
        action.payload.index,
      );
    },
    deleteNode: (state, action: PayloadAction<string>) => {
      const node = state.nodes[action.payload];

      if (!node || node.parentId === null) {
        return;
      }

      const parent = state.nodes[node.parentId];
      if (parent) {
        parent.childIds = parent.childIds.filter((id) => id !== node.id);
      }

      collectSubtreeIds(node.id, state.nodes).forEach((nodeId) => {
        delete state.nodes[nodeId];
      });
    },
    moveNode: (state, action: PayloadAction<MoveNodePayload>) => {
      const node = state.nodes[action.payload.nodeId];
      const nextParent = state.nodes[action.payload.parentId];

      if (
        !node ||
        !nextParent ||
        node.parentId === null ||
        node.id === nextParent.id ||
        isDescendantOf(nextParent.id, node.id, state.nodes)
      ) {
        return;
      }

      const previousParent = state.nodes[node.parentId];
      const previousIndex = previousParent?.childIds.indexOf(node.id) ?? -1;
      let targetIndex = action.payload.index;

      if (previousParent) {
        removeChildId(previousParent.childIds, node.id);
      }

      if (
        previousParent?.id === nextParent.id &&
        previousIndex >= 0 &&
        previousIndex < targetIndex
      ) {
        targetIndex -= 1;
      }

      node.parentId = nextParent.id;
      insertChildId(nextParent.childIds, node.id, targetIndex);
    },
    applyBuilderCommand: (state, action: PayloadAction<BuilderCommand>) => {
      const command = action.payload;

      if (command.type === "insert-node") {
        const parent = state.nodes[command.parentId];

        if (!parent || state.nodes[command.node.id]) {
          return;
        }

        const normalized = normalizeAppNode(command.node, command.parentId);
        Object.assign(state.nodes, normalized);
        insertChildId(parent.childIds, command.node.id, command.index);
        return;
      }

      if (command.type === "move-node" || command.type === "reorder-node") {
        const node = state.nodes[command.nodeId];
        const nextParent = state.nodes[command.parentId];

        if (
          !node ||
          !nextParent ||
          node.parentId === null ||
          node.id === nextParent.id ||
          isDescendantOf(nextParent.id, node.id, state.nodes)
        ) {
          return;
        }

        const previousParent = state.nodes[node.parentId];
        const previousIndex = previousParent?.childIds.indexOf(node.id) ?? -1;
        let targetIndex = command.index;

        if (previousParent) {
          removeChildId(previousParent.childIds, node.id);
        }

        if (
          previousParent?.id === nextParent.id &&
          previousIndex >= 0 &&
          previousIndex < targetIndex
        ) {
          targetIndex -= 1;
        }

        node.parentId = nextParent.id;
        insertChildId(nextParent.childIds, node.id, targetIndex);
        return;
      }

      if (command.type === "delete-node") {
        const node = state.nodes[command.nodeId];

        if (!node || node.parentId === null) {
          return;
        }

        const parent = state.nodes[node.parentId];
        if (parent) {
          removeChildId(parent.childIds, node.id);
        }

        collectSubtreeIds(node.id, state.nodes).forEach((nodeId) => {
          delete state.nodes[nodeId];
        });
        return;
      }

      if (command.type === "update-node-props") {
        const node = state.nodes[command.nodeId];

        if (node) {
          node.props = { ...node.props, ...command.props };
        }
        return;
      }

      if (command.type === "update-node-style") {
        const node = state.nodes[command.nodeId];

        if (node) {
          node.style = { ...node.style, ...command.style };
        }
      }
    },
    updateNodeProps: (state, action: PayloadAction<UpdateNodePropsPayload>) => {
      const node = state.nodes[action.payload.nodeId];

      if (!node) {
        return;
      }

      node.props = { ...node.props, ...action.payload.props };
    },
    updateNodeStyle: (state, action: PayloadAction<UpdateNodeStylePayload>) => {
      const node = state.nodes[action.payload.nodeId];

      if (!node) {
        return;
      }

      node.style = { ...node.style, ...action.payload.style };
    },
    setClipboard: (state, action: PayloadAction<BuilderClipboard | null>) => {
      state.clipboard = action.payload;
    },
    setDragSession: (
      state,
      action: PayloadAction<BuilderDragSession | null>,
    ) => {
      state.dragSession = action.payload;
    },
    setDropIndicator: (state, action: PayloadAction<DropIndicator | null>) => {
      state.dropIndicator = action.payload;
    },
    resetDocument: () => initialBuilderDocumentState,
  },
});

export const {
  applyBuilderCommand,
  deleteNode,
  insertNode,
  moveNode,
  resetDocument,
  setClipboard,
  setDragSession,
  setDropIndicator,
  updateNodeProps,
  updateNodeStyle,
} = builderDocumentSlice.actions;

export const builderDocumentReducer = builderDocumentSlice.reducer;
