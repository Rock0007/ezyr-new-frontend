import { TypedRegistry } from "@/registry/create-registry";
import type { ThemeTokenDefinition } from "@/registry/types";

const tokenReferencePattern = /^\{([\w.-]+)\}$/;

export class ThemeRegistry extends TypedRegistry<ThemeTokenDefinition> {
  resolveToken(reference: string): string | undefined {
    const tokenId = tokenReferencePattern.exec(reference)?.[1];

    if (!tokenId) {
      return undefined;
    }

    const token = this.get(tokenId);
    return typeof token?.value === "string" ? token.value : undefined;
  }

  getTokenValue(tokenId: string, fallback?: string): string | undefined {
    const token = this.get(tokenId);
    return typeof token?.value === "string" ? token.value : fallback;
  }

  listByGroup(group: ThemeTokenDefinition["group"]) {
    return this.list().filter((token) => token.group === group);
  }
}

export const themeRegistry = new ThemeRegistry([
  {
    id: "color.primary",
    group: "colors",
    name: "Primary",
    value: "#0f8ca8",
    description: "Primary interaction and selected-state color.",
  },
  {
    id: "color.surface",
    group: "colors",
    name: "Surface",
    value: "#ffffff",
    description: "Default rendered component surface.",
  },
  {
    id: "color.text",
    group: "colors",
    name: "Text",
    value: "#172033",
    description: "Default body text color.",
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
