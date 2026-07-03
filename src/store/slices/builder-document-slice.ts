import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { AppNode, JsonObject } from "@/schemas/app-spec";
import {
  collectSubtreeIds,
  normalizeAppNode,
} from "@/features/builder/state/normalization";
import { initialBuilderDocumentState } from "@/features/builder/state/initial-document";
import type {
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

const builderDocumentSlice = createSlice({
  name: "builderDocument",
  initialState: initialBuilderDocumentState,
  reducers: {
    insertNode: (state, action: PayloadAction<InsertNodePayload>) => {
      const parent = state.nodes[action.payload.parentId];

      if (!parent) {
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

      if (!node || !nextParent || node.parentId === null) {
        return;
      }

      const previousParent = state.nodes[node.parentId];
      if (previousParent) {
        previousParent.childIds = previousParent.childIds.filter(
          (id) => id !== node.id,
        );
      }

      node.parentId = nextParent.id;
      insertChildId(nextParent.childIds, node.id, action.payload.index);
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
