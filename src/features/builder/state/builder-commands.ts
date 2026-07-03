import type { AppNode, JsonObject } from "@/schemas/app-spec";
import { componentRegistry } from "@/registry/component";
import type { BuilderCommand } from "./types";

export function createInsertNodeCommand(
  componentType: string,
  nodeId: string,
  parentId: string,
  index?: number,
): BuilderCommand {
  return {
    type: "insert-node",
    node: componentRegistry.createNode(componentType, nodeId),
    parentId,
    index,
  };
}

export function createInsertExistingNodeCommand(
  node: AppNode,
  parentId: string,
  index?: number,
): BuilderCommand {
  return { type: "insert-node", node, parentId, index };
}

export function createDeleteNodeCommand(nodeId: string): BuilderCommand {
  return { type: "delete-node", nodeId };
}

export function createMoveNodeCommand(
  nodeId: string,
  parentId: string,
  index: number,
): BuilderCommand {
  return { type: "move-node", nodeId, parentId, index };
}

export function createUpdatePropsCommand(
  nodeId: string,
  props: JsonObject,
): BuilderCommand {
  return { type: "update-node-props", nodeId, props };
}

export function createUpdateStyleCommand(
  nodeId: string,
  style: JsonObject,
): BuilderCommand {
  return { type: "update-node-style", nodeId, style };
}
