import type { AppNode, JsonValue } from "@/schemas/app-spec";
import type { ComponentPropertyDefinition } from "@/registry/property";

export type PropertyGroup = {
  category: string;
  properties: ComponentPropertyDefinition[];
};

export function groupProperties(
  properties: readonly ComponentPropertyDefinition[],
): PropertyGroup[] {
  const groups = new Map<string, ComponentPropertyDefinition[]>();

  properties.forEach((property) => {
    const group = groups.get(property.category) ?? [];
    group.push(property);
    groups.set(property.category, group);
  });

  return Array.from(groups.entries()).map(([category, groupedProperties]) => ({
    category,
    properties: groupedProperties,
  }));
}

export function readPropertyValue(
  node: AppNode,
  property: ComponentPropertyDefinition,
): JsonValue | undefined {
  const source = node[property.valueSource];
  return source[property.valueKey] ?? property.defaultValue;
}
