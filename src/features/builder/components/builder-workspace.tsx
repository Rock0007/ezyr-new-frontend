"use client";

import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
  type CollisionDetection,
  pointerWithin,
  rectIntersection,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { Layout } from "antd";
import { Box } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { BuilderCanvas } from "@/components/builder/builder-canvas";
import { BuilderConsole } from "@/components/builder/builder-console";
import { LeftSidebar } from "@/components/builder/left-sidebar";
import { PropertyPanel } from "@/components/builder/property-panel";
import { TopToolbar } from "@/components/builder/top-toolbar";
import { BUILDER_COMPONENTS } from "@/constants/builder";
import {
  BUILDER_CANVAS_DROP_ZONE_ID,
  resolveInsertionIndex,
  validateDropIntent,
} from "@/features/builder/dnd";
import type {
  DropIntent,
  NormalizedBuilderNode,
} from "@/features/builder/state/types";
import { useAppDispatch } from "@/hooks/use-app-dispatch";
import { useAppSelector } from "@/hooks/use-app-selector";
import { componentRegistry } from "@/registry/component";
import {
  insertNode,
  setDragSession,
  setDropIndicator,
} from "@/store/slices/builder-document-slice";
import { selectOne } from "@/store/slices/selection-slice";

let droppedNodeSequence = 0;

function createDroppedNodeId(componentType: string): string {
  droppedNodeSequence += 1;
  return `${componentType}-${droppedNodeSequence}`;
}

function getComponentType(
  event: DragEndEvent | DragOverEvent | DragStartEvent,
): string | null {
  const componentType = event.active.data.current?.componentType;
  return typeof componentType === "string" ? componentType : null;
}

const builderCollisionDetection: CollisionDetection = (args) => {
  const pointerCollisions = pointerWithin(args);
  const collisions = pointerCollisions.length
    ? pointerCollisions
    : rectIntersection(args);
  const nodeCollision = collisions.find(
    (collision) => collision.id !== BUILDER_CANVAS_DROP_ZONE_ID,
  );

  return nodeCollision ? [nodeCollision] : collisions;
};

function createAppendIntent(
  componentType: string,
  parent: NormalizedBuilderNode,
): DropIntent {
  return {
    componentType,
    targetParentId: parent.id,
    targetIndex: parent.childIds.length,
    placement: "inside",
  };
}

function resolveDropIntent({
  componentType,
  nodes,
  overId,
  rootNodeId,
}: {
  componentType: string;
  nodes: Record<string, NormalizedBuilderNode>;
  overId: string;
  rootNodeId: string;
}):
  | { intent: DropIntent; isValid: true }
  | { intent: DropIntent; isValid: false; message: string }
  | null {
  const candidateIds: string[] = [];

  if (overId === BUILDER_CANVAS_DROP_ZONE_ID) {
    candidateIds.push(rootNodeId);
  } else if (nodes[overId]) {
    let currentId: string | null = overId;

    while (currentId) {
      candidateIds.push(currentId);
      currentId = nodes[currentId]?.parentId ?? null;
    }
  }

  if (!candidateIds.includes(rootNodeId)) {
    candidateIds.push(rootNodeId);
  }

  let firstInvalid:
    | { intent: DropIntent; isValid: false; message: string }
    | null = null;

  for (const candidateId of candidateIds) {
    const parent = nodes[candidateId];

    if (!parent) {
      continue;
    }

    const intent = createAppendIntent(componentType, parent);
    const validation = validateDropIntent(intent, nodes);

    if (validation.isValid) {
      return { intent, isValid: true };
    }

    firstInvalid ??= {
      intent,
      isValid: false,
      message: validation.message,
    };
  }

  return firstInvalid;
}

function resolveDropTargetIdFromPoint(
  point: { x: number; y: number } | null,
): string | null {
  if (!point || typeof document === "undefined") {
    return null;
  }

  const elements = document.elementsFromPoint(point.x, point.y);

  for (const element of elements) {
    const nodeElement = element.closest("[data-node-id]");

    if (nodeElement) {
      return nodeElement.getAttribute("data-node-id");
    }

    if (element.closest('[data-builder-canvas-viewport="true"]')) {
      return BUILDER_CANVAS_DROP_ZONE_ID;
    }
  }

  return null;
}

function ComponentDragOverlay({ componentType }: { componentType: string }) {
  const component = BUILDER_COMPONENTS.find((item) => item.kind === componentType);

  return (
    <div className="flex h-11 w-56 items-center gap-2 rounded-md border border-[#9ee7f2] bg-white px-2 text-left text-sm shadow-lg">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[var(--brand-soft)] text-[var(--brand-strong)]">
        <Box size={15} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[13px] font-semibold leading-4 text-[#172033]">
          {component?.name ?? componentType}
        </span>
        <span className="block truncate text-[11px] leading-4 capitalize text-[#667085]">
          {component?.taxonomyLabel ?? "Component"}
        </span>
      </span>
    </div>
  );
}

export function BuilderWorkspace() {
  const dispatch = useAppDispatch();
  const lastPointerPositionRef = useRef<{ x: number; y: number } | null>(null);
  const [activeComponentType, setActiveComponentType] = useState<string | null>(
    null,
  );
  const nodes = useAppSelector((state) => state.builderDocument.nodes);
  const activePageId = useAppSelector(
    (state) => state.builderDocument.activePageId,
  );
  const rootNodeId = useAppSelector(
    (state) => state.builderDocument.rootNodeIdsByPage[activePageId],
  );
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 4 },
    }),
    useSensor(KeyboardSensor),
  );

  useEffect(() => {
    if (!activeComponentType) {
      lastPointerPositionRef.current = null;
      return;
    }

    const handlePointerMove = (event: PointerEvent) => {
      lastPointerPositionRef.current = {
        x: event.clientX,
        y: event.clientY,
      };
    };

    window.addEventListener("pointermove", handlePointerMove, {
      capture: true,
    });

    return () => {
      window.removeEventListener("pointermove", handlePointerMove, {
        capture: true,
      });
    };
  }, [activeComponentType]);

  const handleDragOver = (event: DragOverEvent) => {
    const componentType = getComponentType(event);
    const overId = String(event.over?.id ?? "");

    if (!componentType || !overId || !rootNodeId) {
      dispatch(setDropIndicator(null));
      return;
    }

    const result = resolveDropIntent({
      componentType,
      nodes,
      overId,
      rootNodeId,
    });

    if (!result) {
      dispatch(setDropIndicator(null));
      return;
    }

    dispatch(
      setDropIndicator({
        intent: result.intent,
        isValid: result.isValid,
        message: result.isValid ? undefined : result.message,
      }),
    );
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const componentType = getComponentType(event);
    const overId =
      String(event.over?.id ?? "") ||
      resolveDropTargetIdFromPoint(lastPointerPositionRef.current) ||
      "";

    setActiveComponentType(null);
    lastPointerPositionRef.current = null;
    dispatch(setDragSession(null));
    dispatch(setDropIndicator(null));

    if (!componentType || !overId || !rootNodeId) {
      return;
    }

    const result = resolveDropIntent({
      componentType,
      nodes,
      overId,
      rootNodeId,
    });

    if (!result?.isValid) {
      return;
    }

    const nodeId =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : createDroppedNodeId(componentType);
    const node = componentRegistry.createNode(componentType, nodeId);

    dispatch(
      insertNode({
        node,
        parentId: result.intent.targetParentId,
        index: resolveInsertionIndex(result.intent),
      }),
    );
    dispatch(selectOne(node.id));
  };

  return (
    <DndContext
      collisionDetection={builderCollisionDetection}
      sensors={sensors}
      onDragCancel={() => {
        setActiveComponentType(null);
        lastPointerPositionRef.current = null;
        dispatch(setDragSession(null));
        dispatch(setDropIndicator(null));
      }}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDragStart={(event) => {
        const componentType = getComponentType(event) ?? "Unknown";
        const activatorEvent = event.activatorEvent;

        if (
          "clientX" in activatorEvent &&
          "clientY" in activatorEvent &&
          typeof activatorEvent.clientX === "number" &&
          typeof activatorEvent.clientY === "number"
        ) {
          lastPointerPositionRef.current = {
            x: activatorEvent.clientX,
            y: activatorEvent.clientY,
          };
        }

        setActiveComponentType(componentType);
        dispatch(
          setDragSession({
            id: String(event.active.id),
            source: {
              kind: "component",
              componentType,
            },
          }),
        );
      }}
    >
      <Layout className="h-screen overflow-hidden bg-[var(--background)] text-[var(--foreground)]">
        <TopToolbar />
        <Layout className="min-h-0 flex-1">
          <LeftSidebar />
          <Layout.Content className="min-w-0 bg-[#eef3f8]">
            <BuilderCanvas />
          </Layout.Content>
          <PropertyPanel />
        </Layout>
        <BuilderConsole />
      </Layout>
      <DragOverlay dropAnimation={null}>
        {activeComponentType ? (
          <ComponentDragOverlay componentType={activeComponentType} />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
