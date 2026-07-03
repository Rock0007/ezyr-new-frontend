import type { BuilderCommand } from "@/features/builder/state/types";
import type {
  DropIntent,
  NormalizedBuilderNode,
} from "@/features/builder/state/types";
import { isDescendantOf } from "@/features/builder/state/normalization";
import { componentRegistry } from "@/registry/component";
import type { AppNode } from "@/schemas/app-spec";

export type DropValidationResult =
  | { isValid: true }
  | { isValid: false; message: string };

export type DragPayload =
  | { kind: "new-component"; componentType: string }
  | { kind: "existing-node"; nodeId: string };

export type DropPlan =
  | {
      isValid: true;
      intent: DropIntent;
      command: BuilderCommand;
      componentType: string;
    }
  | {
      isValid: false;
      intent: DropIntent | null;
      message: string;
      componentType?: string;
    };

type DropRect = Pick<DOMRect, "top" | "bottom" | "height">;

export type DropPlannerInput = {
  payload: DragPayload;
  nodes: Record<string, NormalizedBuilderNode>;
  rootNodeId: string;
  overId: string | null;
  pointer?: { x: number; y: number } | null;
  overRect?: DropRect | null;
  createNode?: (componentType: string) => AppNode;
};

function getPayloadComponentType(
  payload: DragPayload,
  nodes: Record<string, NormalizedBuilderNode>,
): string | null {
  return payload.kind === "new-component"
    ? payload.componentType
    : nodes[payload.nodeId]?.type ?? null;
}

function getSiblingIntent({
  componentType,
  draggedNodeId,
  target,
  nodes,
  placement,
}: {
  componentType: string;
  draggedNodeId?: string;
  target: NormalizedBuilderNode;
  nodes: Record<string, NormalizedBuilderNode>;
  placement: "before" | "after";
}): DropIntent | null {
  if (!target.parentId) {
    return null;
  }

  const parent = nodes[target.parentId];
  const targetIndex = parent?.childIds.indexOf(target.id) ?? -1;

  if (!parent || targetIndex < 0) {
    return null;
  }

  return {
    componentType,
    draggedNodeId,
    targetParentId: parent.id,
    targetIndex,
    placement,
  };
}

function getInsideIntent({
  componentType,
  draggedNodeId,
  target,
  placement = "inside-end",
}: {
  componentType: string;
  draggedNodeId?: string;
  target: NormalizedBuilderNode;
  placement?: "inside-start" | "inside-end";
}): DropIntent {
  return {
    componentType,
    draggedNodeId,
    targetParentId: target.id,
    targetIndex: placement === "inside-start" ? 0 : target.childIds.length,
    placement,
  };
}

function getCandidateIntents({
  componentType,
  draggedNodeId,
  nodes,
  rootNodeId,
  overId,
  pointer,
  overRect,
}: {
  componentType: string;
  draggedNodeId?: string;
  nodes: Record<string, NormalizedBuilderNode>;
  rootNodeId: string;
  overId: string | null;
  pointer?: { x: number; y: number } | null;
  overRect?: DropRect | null;
}): DropIntent[] {
  const root = nodes[rootNodeId];

  if (!root) {
    return [];
  }

  if (!overId || overId === rootNodeId || !nodes[overId]) {
    return [
      getInsideIntent({
        componentType,
        draggedNodeId,
        target: root,
      }),
    ];
  }

  const target = nodes[overId];
  const intents: DropIntent[] = [];
  const edgeThreshold = overRect
    ? Math.min(28, Math.max(10, overRect.height * 0.25))
    : 0;

  if (pointer && overRect && target.parentId) {
    const distanceFromTop = pointer.y - overRect.top;
    const distanceFromBottom = overRect.bottom - pointer.y;

    if (distanceFromTop <= edgeThreshold) {
      const beforeIntent = getSiblingIntent({
        componentType,
        draggedNodeId,
        target,
        nodes,
        placement: "before",
      });

      if (beforeIntent) {
        intents.push(beforeIntent);
      }
    } else if (distanceFromBottom <= edgeThreshold) {
      const afterIntent = getSiblingIntent({
        componentType,
        draggedNodeId,
        target,
        nodes,
        placement: "after",
      });

      if (afterIntent) {
        intents.push(afterIntent);
      }
    }
  }

  intents.push(
    getInsideIntent({
      componentType,
      draggedNodeId,
      target,
    }),
  );

  let currentParentId = target.parentId;
  while (currentParentId) {
    const parent = nodes[currentParentId];
    if (!parent) {
      break;
    }

    intents.push(
      getInsideIntent({
        componentType,
        draggedNodeId,
        target: parent,
      }),
    );
    currentParentId = parent.parentId;
  }

  if (!intents.some((intent) => intent.targetParentId === root.id)) {
    intents.push(
      getInsideIntent({
        componentType,
        draggedNodeId,
        target: root,
      }),
    );
  }

  return intents;
}

function getCommandForIntent({
  payload,
  intent,
  createNode,
}: {
  payload: DragPayload;
  intent: DropIntent;
  createNode?: (componentType: string) => AppNode;
}): BuilderCommand | null {
  if (payload.kind === "existing-node") {
    return {
      type: intent.placement === "before" || intent.placement === "after"
        ? "reorder-node"
        : "move-node",
      nodeId: payload.nodeId,
      parentId: intent.targetParentId,
      index: intent.placement === "after" ? intent.targetIndex + 1 : intent.targetIndex,
    };
  }

  if (!createNode) {
    return null;
  }

  return {
    type: "insert-node",
    node: createNode(payload.componentType),
    parentId: intent.targetParentId,
    index: intent.placement === "after" ? intent.targetIndex + 1 : intent.targetIndex,
  };
}

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
    definition.runtime.mode === "runtime-only" ||
    definition.runtime.mode === "workflow-triggered"
  ) {
    return {
      isValid: false,
      message: `${definition.displayName} is configured from runtime workflows, not the canvas.`,
    };
  }

  if (intent.componentType && !definition.canvas.draggable) {
    return {
      isValid: false,
      message: `${definition.displayName} cannot be dragged onto the canvas.`,
    };
  }

  if (!parentDefinition.canvas.droppable) {
    return {
      isValid: false,
      message: `${parentDefinition.displayName} cannot contain child components.`,
    };
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
    definition.composition.allowedParents &&
    !definition.composition.allowedParents.includes(parent.type)
  ) {
    return {
      isValid: false,
      message: `${definition.displayName} cannot be placed inside ${parentDefinition.displayName}.`,
    };
  }

  if (
    parentDefinition.composition.allowedChildren &&
    !parentDefinition.composition.allowedChildren.includes(componentType)
  ) {
    return {
      isValid: false,
      message: `${parentDefinition.displayName} does not accept ${definition.displayName}.`,
    };
  }

  const existingChildren =
    intent.draggedNodeId && nodes[intent.draggedNodeId]?.parentId === parent.id
      ? parent.childIds.filter((childId) => childId !== intent.draggedNodeId)
      : parent.childIds;

  if (
    parentDefinition.composition.maxChildren !== undefined &&
    existingChildren.length >= parentDefinition.composition.maxChildren
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

export function createDropPlan(input: DropPlannerInput): DropPlan {
  const componentType = getPayloadComponentType(input.payload, input.nodes);

  if (!componentType) {
    return {
      isValid: false,
      intent: null,
      message: "Dragged component is unavailable.",
    };
  }

  const draggedNodeId =
    input.payload.kind === "existing-node" ? input.payload.nodeId : undefined;
  const intents = getCandidateIntents({
    componentType,
    draggedNodeId,
    nodes: input.nodes,
    rootNodeId: input.rootNodeId,
    overId: input.overId,
    pointer: input.pointer,
    overRect: input.overRect,
  });
  let firstInvalid: DropPlan | null = null;

  for (const intent of intents) {
    const validation = validateDropIntent(intent, input.nodes);

    if (!validation.isValid) {
      firstInvalid ??= {
        isValid: false,
        intent,
        message: validation.message,
        componentType,
      };
      continue;
    }

    const command = getCommandForIntent({
      payload: input.payload,
      intent,
      createNode: input.createNode,
    });

    if (!command) {
      return {
        isValid: false,
        intent,
        message: "Drop command could not be created.",
        componentType,
      };
    }

    return {
      isValid: true,
      intent,
      command,
      componentType,
    };
  }

  return (
    firstInvalid ?? {
      isValid: false,
      intent: null,
      message: "No valid drop target was found.",
      componentType,
    }
  );
}
