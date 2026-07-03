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
  BuilderPage,
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

type CreatePagePayload = {
  page: BuilderPage;
  rootNode: AppNode;
};

type RenamePagePayload = {
  pageId: string;
  name: string;
  path: string;
};

type UpdatePageCanvasPositionPayload = {
  pageId: string;
  position: {
    x: number;
    y: number;
  };
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

      if (!node) {
        return;
      }

      if (node.parentId === null) {
        const ownerPageId = Object.keys(state.rootNodeIdsByPage).find(
          (pageId) => state.rootNodeIdsByPage[pageId] === node.id,
        );

        if (!ownerPageId) {
          return;
        }

        collectSubtreeIds(node.id, state.nodes).forEach((nodeId) => {
          delete state.nodes[nodeId];
        });
        state.rootNodeIdsByPage[ownerPageId] = null;
        return;
      }

      const parent = state.nodes[node.parentId];
      if (parent) {
        removeChildId(parent.childIds, node.id);
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
    createPage: (state, action: PayloadAction<CreatePagePayload>) => {
      if (state.pagesById[action.payload.page.id]) {
        return;
      }

      state.pagesById[action.payload.page.id] = {
        ...action.payload.page,
        canvas: action.payload.page.canvas ?? {
          x: state.pageOrder.length * 1040,
          y: 0,
        },
      };
      state.pageOrder.push(action.payload.page.id);
      state.rootNodeIdsByPage[action.payload.page.id] =
        action.payload.rootNode.id;
      Object.assign(
        state.nodes,
        normalizeAppNode(action.payload.rootNode, null),
      );
      state.activePageId = action.payload.page.id;
    },
    setActivePage: (state, action: PayloadAction<string>) => {
      if (!state.pagesById[action.payload]) {
        return;
      }

      state.activePageId = action.payload;
      state.dropIndicator = null;
      state.dragSession = null;
    },
    renamePage: (state, action: PayloadAction<RenamePagePayload>) => {
      const page = state.pagesById[action.payload.pageId];

      if (!page) {
        return;
      }

      page.name = action.payload.name.trim() || page.name;
      page.path = action.payload.path.trim() || page.path;
    },
    updatePageCanvasPosition: (
      state,
      action: PayloadAction<UpdatePageCanvasPositionPayload>,
    ) => {
      const page = state.pagesById[action.payload.pageId];

      if (!page) {
        return;
      }

      page.canvas = action.payload.position;
    },
    deletePage: (state, action: PayloadAction<string>) => {
      if (!state.pagesById[action.payload] || state.pageOrder.length <= 1) {
        return;
      }

      const pageIndex = state.pageOrder.indexOf(action.payload);
      const rootNodeId = state.rootNodeIdsByPage[action.payload];

      if (rootNodeId) {
        collectSubtreeIds(rootNodeId, state.nodes).forEach((nodeId) => {
          delete state.nodes[nodeId];
        });
      }

      delete state.pagesById[action.payload];
      delete state.rootNodeIdsByPage[action.payload];
      state.pageOrder = state.pageOrder.filter(
        (pageId) => pageId !== action.payload,
      );

      if (state.activePageId === action.payload) {
        state.activePageId =
          state.pageOrder[Math.max(0, pageIndex - 1)] ?? state.pageOrder[0];
      }
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

      if (command.type === "set-page-root") {
        const previousRootId = state.rootNodeIdsByPage[command.pageId];

        if (previousRootId) {
          collectSubtreeIds(previousRootId, state.nodes).forEach((nodeId) => {
            delete state.nodes[nodeId];
          });
        }

        const normalized = normalizeAppNode(command.node, null);
        Object.assign(state.nodes, normalized);
        state.rootNodeIdsByPage[command.pageId] = command.node.id;
        state.activePageId = command.pageId;
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

        if (!node) {
          return;
        }

        if (node.parentId === null) {
          const ownerPageId = Object.keys(state.rootNodeIdsByPage).find(
            (pageId) => state.rootNodeIdsByPage[pageId] === node.id,
          );

          if (!ownerPageId) {
            return;
          }

          collectSubtreeIds(node.id, state.nodes).forEach((nodeId) => {
            delete state.nodes[nodeId];
          });
          state.rootNodeIdsByPage[ownerPageId] = null;
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
  createPage,
  deleteNode,
  deletePage,
  insertNode,
  moveNode,
  renamePage,
  resetDocument,
  setClipboard,
  setActivePage,
  setDragSession,
  setDropIndicator,
  updatePageCanvasPosition,
  updateNodeProps,
  updateNodeStyle,
} = builderDocumentSlice.actions;

export const builderDocumentReducer = builderDocumentSlice.reducer;
