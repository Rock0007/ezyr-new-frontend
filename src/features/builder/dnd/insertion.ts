import type { DropIntent } from "@/features/builder/state/types";

export function resolveInsertionIndex(intent: DropIntent): number {
  if (intent.placement === "after") {
    return intent.targetIndex + 1;
  }

  return intent.targetIndex;
}

export function resolveInsideInsertionIndex(intent: DropIntent): number {
  return intent.placement === "inside-start" ? 0 : intent.targetIndex;
}
