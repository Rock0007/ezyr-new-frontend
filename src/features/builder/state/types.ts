import type { AppNode, JsonObject, JsonValue } from "@/schemas/app-spec";

export type NormalizedBuilderNode = {
  id: string;
  type: string;
  parentId: string | null;
  childIds: string[];
  props: JsonObject;
  style: JsonObject;
  bindings: Record<string, JsonValue>;
  events: Record<string, JsonValue>;
};

export type BuilderPage = {
  id: string;
  name: string;
  path: string;
};

export type BuilderDocumentState = {
  appId: string;
  activePageId: string;
  pagesById: Record<string, BuilderPage>;
  pageOrder: string[];
  rootNodeIdsByPage: Record<string, string | null>;
  nodes: Record<string, NormalizedBuilderNode>;
  clipboard: BuilderClipboard | null;
  dragSession: BuilderDragSession | null;
  dropIndicator: DropIndicator | null;
};

export type BuilderClipboard = {
  nodeIds: string[];
  nodes: Record<string, NormalizedBuilderNode>;
  rootIds: string[];
};

export type BuilderDragSource =
  | { kind: "component"; componentType: string }
  | { kind: "node"; nodeId: string };

export type BuilderDragSession = {
  id: string;
  source: BuilderDragSource;
  pointerOffset?: { x: number; y: number };
};

export type DropPlacement = "before" | "after" | "inside-start" | "inside-end";

export type DropIntent = {
  draggedNodeId?: string;
  componentType?: string;
  targetParentId: string;
  targetIndex: number;
  placement: DropPlacement;
};

export type DropIndicator = {
  intent: DropIntent | null;
  isValid: boolean;
  message?: string;
};

export type BuilderCommand =
  | { type: "insert-node"; node: AppNode; parentId: string; index?: number }
  | { type: "set-page-root"; pageId: string; node: AppNode }
  | { type: "delete-node"; nodeId: string }
  | { type: "move-node"; nodeId: string; parentId: string; index: number }
  | { type: "reorder-node"; nodeId: string; parentId: string; index: number }
  | { type: "update-node-props"; nodeId: string; props: JsonObject }
  | { type: "update-node-style"; nodeId: string; style: JsonObject };
