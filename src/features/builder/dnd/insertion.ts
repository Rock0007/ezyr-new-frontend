import type { DropIntent } from "@/features/builder/state/types";

export function resolveInsertionIndex(intent: DropIntent): number {
  if (intent.placement === "after") {
    return intent.targetIndex + 1;
  }

  return intent.targetIndex;
}
