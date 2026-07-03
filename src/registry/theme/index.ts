import { TypedRegistry } from "@/registry/create-registry";
import type { ThemeTokenDefinition } from "@/registry/types";

export const themeRegistry = new TypedRegistry<ThemeTokenDefinition>([
  {
    id: "color.primary",
    group: "colors",
    name: "Primary",
    value: "#0f8ca8",
    description: "Primary interaction and selected-state color.",
  },
  {
    id: "radius.control",
    group: "radius",
    name: "Control radius",
    value: "6px",
  },
  {
    id: "spacing.panel",
    group: "spacing",
    name: "Panel padding",
    value: "16px",
  },
]);
