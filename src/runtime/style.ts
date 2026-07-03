import type { CSSProperties } from "react";
import type { JsonObject, JsonValue } from "@/schemas/app-spec";
import { themeRegistry } from "@/registry/theme";

const stylePropertyMap: Record<string, keyof CSSProperties> = {
  background: "background",
  backgroundColor: "backgroundColor",
  borderColor: "borderColor",
  borderRadius: "borderRadius",
  borderStyle: "borderStyle",
  borderWidth: "borderWidth",
  color: "color",
  display: "display",
  flexDirection: "flexDirection",
  flexWrap: "flexWrap",
  gap: "gap",
  height: "height",
  justifyContent: "justifyContent",
  alignItems: "alignItems",
  alignSelf: "alignSelf",
  fontSize: "fontSize",
  fontWeight: "fontWeight",
  lineHeight: "lineHeight",
  margin: "margin",
  marginBottom: "marginBottom",
  marginLeft: "marginLeft",
  marginRight: "marginRight",
  marginTop: "marginTop",
  maxHeight: "maxHeight",
  maxWidth: "maxWidth",
  minHeight: "minHeight",
  minWidth: "minWidth",
  objectFit: "objectFit",
  overflow: "overflow",
  overflowX: "overflowX",
  overflowY: "overflowY",
  padding: "padding",
  paddingBottom: "paddingBottom",
  paddingLeft: "paddingLeft",
  paddingRight: "paddingRight",
  paddingTop: "paddingTop",
  radius: "borderRadius",
  scrollBehavior: "scrollBehavior",
  textAlign: "textAlign",
  opacity: "opacity",
  width: "width",
};

function resolveStyleValue(value: JsonValue): string | number | undefined {
  if (typeof value === "string") {
    const trimmed = value.trim();

    if (!trimmed) {
      return undefined;
    }

    return themeRegistry.resolveToken(trimmed) ?? trimmed;
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
