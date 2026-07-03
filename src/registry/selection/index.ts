import { TypedRegistry } from "@/registry/create-registry";
import type { SelectionModeDefinition } from "@/registry/types";

export const selectionRegistry = new TypedRegistry<SelectionModeDefinition>([
  { id: "single", label: "Single selection", allowsMultiple: false },
  { id: "multi", label: "Multi-selection", allowsMultiple: true },
  { id: "marquee", label: "Marquee selection", allowsMultiple: true },
]);
