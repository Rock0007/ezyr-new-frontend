import type { BuilderCommand } from "@/features/builder/state/types";

export type BuilderHistoryEntry = {
  id: string;
  label: string;
  createdAt: string;
  undo: BuilderCommand[];
  redo: BuilderCommand[];
};
