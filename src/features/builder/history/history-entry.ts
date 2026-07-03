import type { BuilderCommand } from "@/features/builder/state/types";
import type { BuilderHistoryEntry } from "./types";

export function createHistoryEntry(
  id: string,
  label: string,
  redo: BuilderCommand[],
  undo: BuilderCommand[],
): BuilderHistoryEntry {
  return {
    id,
    label,
    createdAt: new Date().toISOString(),
    redo,
    undo,
  };
}
