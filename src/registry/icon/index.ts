import { TypedRegistry } from "@/registry/create-registry";
import type { IconDefinition } from "@/registry/types";

export const iconRegistry = new TypedRegistry<IconDefinition>([
  { id: "box", label: "Box" },
  { id: "type", label: "Type" },
  { id: "mouse-pointer", label: "Pointer" },
  { id: "image", label: "Image" },
  { id: "form-input", label: "Form" },
]);
