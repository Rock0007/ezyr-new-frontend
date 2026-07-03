import type { CSSProperties } from "react";
import type { JsonObject, JsonValue } from "@/schemas/app-spec";
import { themeRegistry } from "@/registry/theme";

const stylePropertyMap: Record<string, keyof CSSProperties> = {
  background: "background",
  backgroundColor: "backgroundColor",
  borderColor: "borderColor",
  borderRadius: "borderRadius",
  color: "color",
  display: "display",
  gap: "gap",
  height: "height",
  margin: "margin",
  maxWidth: "maxWidth",
  minHeight: "minHeight",
  padding: "padding",
  radius: "borderRadius",
  width: "width",
};

function resolveStyleValue(value: JsonValue): string | number | undefined {
  if (typeof value === "string") {
    return themeRegistry.resolveToken(value) ?? value;
  }

  if (typeof value === "number") {
    return value;
  }

  return undefined;
}

export function resolveNodeStyle(style: JsonObject): CSSProperties {
  return Object.entries(style).reduce<CSSProperties>((resolved, [key, value]) => {
    const property = stylePropertyMap[key];
    const resolvedValue = resolveStyleValue(value);

    if (!property || resolvedValue === undefined) {
      return resolved;
    }

    return {
      ...resolved,
      [property]: resolvedValue,
    };
  }, {});
}
