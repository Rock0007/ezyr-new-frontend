import { TypedRegistry } from "@/registry/create-registry";
import type { HistoryCommandDefinition } from "@/registry/types";

export const historyRegistry = new TypedRegistry<HistoryCommandDefinition>([
  { id: "insert-node", label: "Insert node" },
  { id: "delete-node", label: "Delete node" },
  { id: "move-node", label: "Move node" },
  { id: "update-node-props", label: "Update properties", mergeWindowMs: 500 },
  { id: "update-node-style", label: "Update style", mergeWindowMs: 500 },
]);
