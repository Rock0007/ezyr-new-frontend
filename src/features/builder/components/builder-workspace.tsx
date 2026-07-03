"use client";

import {
  DndContext,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { Layout } from "antd";
import { BuilderCanvas } from "@/components/builder/builder-canvas";
import { BuilderConsole } from "@/components/builder/builder-console";
import { LeftSidebar } from "@/components/builder/left-sidebar";
import { PropertyPanel } from "@/components/builder/property-panel";
import { TopToolbar } from "@/components/builder/top-toolbar";
import {
  resolveInsertionIndex,
  validateDropIntent,
} from "@/features/builder/dnd";
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

export function BuilderWorkspace() {
  const dispatch = useAppDispatch();
  const nodes = useAppSelector((state) => state.builderDocument.nodes);

  const handleDragOver = (event: DragOverEvent) => {
    const componentType = getComponentType(event);
    const targetParentId = String(event.over?.id ?? "");
    const parent = nodes[targetParentId];

    if (!componentType || !parent) {
      dispatch(setDropIndicator(null));
      return;
    }

    const intent = {
      componentType,
      targetParentId,
      targetIndex: parent.childIds.length,
      placement: "inside" as const,
    };
    const validation = validateDropIntent(intent, nodes);

    dispatch(
      setDropIndicator({
        intent,
        isValid: validation.isValid,
        message: validation.isValid ? undefined : validation.message,
      }),
    );
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const componentType = getComponentType(event);
    const targetParentId = String(event.over?.id ?? "");
    const parent = nodes[targetParentId];

    dispatch(setDragSession(null));
    dispatch(setDropIndicator(null));

    if (!componentType || !parent) {
      return;
    }

    const intent = {
      componentType,
      targetParentId,
      targetIndex: parent.childIds.length,
      placement: "inside" as const,
    };
    const validation = validateDropIntent(intent, nodes);

    if (!validation.isValid) {
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
        parentId: targetParentId,
        index: resolveInsertionIndex(intent),
      }),
    );
    dispatch(selectOne(node.id));
  };

  return (
    <DndContext
      onDragCancel={() => {
        dispatch(setDragSession(null));
        dispatch(setDropIndicator(null));
      }}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDragStart={(event) =>
        dispatch(
          setDragSession({
            id: String(event.active.id),
            source: {
              kind: "component",
              componentType: getComponentType(event) ?? "Unknown",
            },
          }),
        )
      }
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
    </DndContext>
  );
}
