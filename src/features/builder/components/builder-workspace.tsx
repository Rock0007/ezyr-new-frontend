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
  calculateAutoScrollVector,
  BUILDER_CANVAS_DROP_ZONE_ID,
  createDropPlan,
  type DragPayload,
} from "@/features/builder/dnd";
import { useAppDispatch } from "@/hooks/use-app-dispatch";
import { useAppSelector } from "@/hooks/use-app-selector";
import { componentRegistry } from "@/registry/component";
import {
  applyBuilderCommand,
  setDragSession,
  setDropIndicator,
} from "@/store/slices/builder-document-slice";
import { nudgeCanvasPan } from "@/store/slices/builder-slice";
import { selectOne } from "@/store/slices/selection-slice";

let droppedNodeSequence = 0;

function createDroppedNodeId(componentType: string): string {
  droppedNodeSequence += 1;
  return `${componentType}-${droppedNodeSequence}`;
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

function getDragPayload(
  event: DragEndEvent | DragOverEvent | DragStartEvent,
): DragPayload | null {
  const data = event.active.data.current;
  const sourceKind = data?.sourceKind;

  if (sourceKind === "component" && typeof data?.componentType === "string") {
    return { kind: "new-component", componentType: data.componentType };
  }

  if (sourceKind === "node" && typeof data?.nodeId === "string") {
    return { kind: "existing-node", nodeId: data.nodeId };
  }

  if (typeof data?.componentType === "string") {
    return { kind: "new-component", componentType: data.componentType };
  }

  return null;
}

function getPointerPosition(): { x: number; y: number } | null {
  return lastKnownPointerPosition;
}

let lastKnownPointerPosition: { x: number; y: number } | null = null;

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
  const autoPanFrameRef = useRef<number | null>(null);
  const [activeDragPayload, setActiveDragPayload] = useState<DragPayload | null>(
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
    if (!activeDragPayload) {
      lastPointerPositionRef.current = null;
      lastKnownPointerPosition = null;
      return;
    }

    const handlePointerMove = (event: PointerEvent) => {
      lastPointerPositionRef.current = {
        x: event.clientX,
        y: event.clientY,
      };
      lastKnownPointerPosition = lastPointerPositionRef.current;
    };

    window.addEventListener("pointermove", handlePointerMove, {
      capture: true,
    });

    return () => {
      window.removeEventListener("pointermove", handlePointerMove, {
        capture: true,
      });
    };
  }, [activeDragPayload]);

  useEffect(
    () => () => {
      if (autoPanFrameRef.current !== null) {
        cancelAnimationFrame(autoPanFrameRef.current);
      }
    },
    [],
  );

  const queueAutoPan = () => {
    const point = lastPointerPositionRef.current ?? getPointerPosition();
    const viewportElement = document.querySelector<HTMLElement>(
      '[data-builder-canvas-viewport="true"]',
    );

    if (!point || !viewportElement) {
      return;
    }

    const vector = calculateAutoScrollVector(
      point,
      viewportElement.getBoundingClientRect(),
      56,
      14,
    );

    if (vector.x === 0 && vector.y === 0) {
      return;
    }

    if (autoPanFrameRef.current !== null) {
      cancelAnimationFrame(autoPanFrameRef.current);
    }

    autoPanFrameRef.current = requestAnimationFrame(() => {
      dispatch(nudgeCanvasPan({ x: -vector.x, y: -vector.y }));
      autoPanFrameRef.current = null;
    });
  };

  const createPreviewNode = (componentType: string) =>
    componentRegistry.createNode(componentType, "__drop-preview__");

  const handleDragOver = (event: DragOverEvent) => {
    const payload = getDragPayload(event);
    const overId = String(event.over?.id ?? "");

    queueAutoPan();

    if (!payload || !overId) {
      dispatch(setDropIndicator(null));
      return;
    }

    if (!rootNodeId) {
      const canCreateRoot =
        payload.kind === "new-component" && payload.componentType === "Frame";

      dispatch(
        setDropIndicator({
          intent: null,
          isValid: canCreateRoot,
          message: canCreateRoot
            ? undefined
            : "Add a Frame before placing other components.",
        }),
      );
      return;
    }

    const plan = createDropPlan({
      payload,
      nodes,
      overId,
      rootNodeId,
      pointer: lastPointerPositionRef.current,
      overRect: event.over?.rect ?? null,
      createNode: createPreviewNode,
    });

    dispatch(
      setDropIndicator({
        intent: plan.intent,
        isValid: plan.isValid,
        message: plan.isValid ? undefined : plan.message,
      }),
    );
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const payload = getDragPayload(event);
    const finalPointer = lastPointerPositionRef.current;
    const overId =
      String(event.over?.id ?? "") ||
      resolveDropTargetIdFromPoint(finalPointer) ||
      "";

    setActiveDragPayload(null);
    lastPointerPositionRef.current = null;
    lastKnownPointerPosition = null;
    dispatch(setDragSession(null));
    dispatch(setDropIndicator(null));

    if (!payload || !overId) {
      return;
    }

    const componentType =
      payload.kind === "new-component"
        ? payload.componentType
        : nodes[payload.nodeId]?.type;
    const nodeId = componentType
      ? typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : createDroppedNodeId(componentType)
      : "";

    if (!rootNodeId) {
      if (payload.kind !== "new-component" || payload.componentType !== "Frame") {
        return;
      }

      const node = componentRegistry.createNode(payload.componentType, nodeId);
      dispatch(
        applyBuilderCommand({
          type: "set-page-root",
          pageId: activePageId,
          node,
        }),
      );
      dispatch(selectOne(node.id));
      return;
    }

    const plan = createDropPlan({
      payload,
      nodes,
      overId,
      rootNodeId,
      pointer: finalPointer,
      overRect: event.over?.rect ?? null,
      createNode: (nextComponentType) =>
        componentRegistry.createNode(nextComponentType, nodeId),
    });

    if (!plan.isValid) {
      return;
    }

    dispatch(applyBuilderCommand(plan.command));

    if (plan.command.type === "insert-node") {
      dispatch(selectOne(plan.command.node.id));
      return;
    }

    if (
      plan.command.type === "move-node" ||
      plan.command.type === "reorder-node"
    ) {
      dispatch(selectOne(plan.command.nodeId));
    }
  };

  const resolveActiveComponentType = () => {
    if (!activeDragPayload) {
      return null;
    }

    return activeDragPayload.kind === "new-component"
      ? activeDragPayload.componentType
      : nodes[activeDragPayload.nodeId]?.type ?? null;
  };

  const activeComponentType = resolveActiveComponentType();

  return (
    <DndContext
      collisionDetection={builderCollisionDetection}
      sensors={sensors}
      onDragCancel={() => {
        setActiveDragPayload(null);
        lastPointerPositionRef.current = null;
        lastKnownPointerPosition = null;
        dispatch(setDragSession(null));
        dispatch(setDropIndicator(null));
      }}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDragStart={(event) => {
        const payload = getDragPayload(event);
        const activatorEvent = event.activatorEvent;

        if (!payload) {
          return;
        }

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
          lastKnownPointerPosition = lastPointerPositionRef.current;
        }

        setActiveDragPayload(payload);
        dispatch(
          setDragSession({
            id: String(event.active.id),
            source:
              payload.kind === "new-component"
                ? {
                    kind: "component",
                    componentType: payload.componentType,
                  }
                : {
                    kind: "node",
                    nodeId: payload.nodeId,
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
