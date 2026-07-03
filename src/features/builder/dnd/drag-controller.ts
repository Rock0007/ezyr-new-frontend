import type {
  BuilderDragSession,
  BuilderDragSource,
} from "@/features/builder/state/types";

export function createDragSession(
  id: string,
  source: BuilderDragSource,
): BuilderDragSession {
  return { id, source };
}
