import { componentRegistry } from "@/registry/component";
import type {
  NormalizedBuilderNode,
  DropIntent,
} from "@/features/builder/state/types";
import { isDescendantOf } from "@/features/builder/state/normalization";

export type DropValidationResult =
  { isValid: true } | { isValid: false; message: string };

export function validateDropIntent(
  intent: DropIntent,
  nodes: Record<string, NormalizedBuilderNode>,
): DropValidationResult {
  const parent = nodes[intent.targetParentId];

  if (!parent) {
    return { isValid: false, message: "Drop target no longer exists." };
  }

  const componentType =
    intent.componentType ?? nodes[intent.draggedNodeId ?? ""]?.type;

  if (!componentType) {
    return { isValid: false, message: "Dragged component is unavailable." };
  }

  const definition = componentRegistry.get(componentType);
  const parentDefinition = componentRegistry.get(parent.type);

  if (!definition) {
    return { isValid: false, message: `Unknown component: ${componentType}.` };
  }

  if (!parentDefinition) {
    return { isValid: false, message: `Unknown parent: ${parent.type}.` };
  }

  if (
    intent.draggedNodeId &&
    (intent.draggedNodeId === parent.id ||
      isDescendantOf(parent.id, intent.draggedNodeId, nodes))
  ) {
    return {
      isValid: false,
      message: "A component cannot be dropped into itself or its descendants.",
    };
  }

  if (
    definition.childrenRules.allowedParents &&
    !definition.childrenRules.allowedParents.includes(parent.type)
  ) {
    return {
      isValid: false,
      message: `${definition.displayName} cannot be placed inside ${parentDefinition.displayName}.`,
    };
  }

  if (
    parentDefinition.childrenRules.allowedChildren &&
    !parentDefinition.childrenRules.allowedChildren.includes(componentType)
  ) {
    return {
      isValid: false,
      message: `${parentDefinition.displayName} does not accept ${definition.displayName}.`,
    };
  }

  if (
    parentDefinition.childrenRules.maxChildren !== undefined &&
    parent.childIds.length >= parentDefinition.childrenRules.maxChildren
  ) {
    return {
      isValid: false,
      message: `${parentDefinition.displayName} already has the maximum number of children.`,
    };
  }

  if (intent.targetIndex < 0 || intent.targetIndex > parent.childIds.length) {
    return { isValid: false, message: "Drop index is outside the parent." };
  }

  return { isValid: true };
}
