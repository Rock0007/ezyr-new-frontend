import { createElement, type ReactNode } from "react";
import type { AppNode } from "@/schemas/app-spec";
import { EzyrButton } from "@/components/ezyr/ezyr-button";
import { EzyrCard } from "@/components/ezyr/ezyr-card";
import { EzyrFrame } from "@/components/ezyr/ezyr-frame";
import { EzyrGeneric } from "@/components/ezyr/ezyr-generic";
import { EzyrImage } from "@/components/ezyr/ezyr-image";
import { EzyrInput } from "@/components/ezyr/ezyr-input";
import { EzyrModal } from "@/components/ezyr/ezyr-modal";
import { EzyrSection } from "@/components/ezyr/ezyr-section";
import { EzyrTable } from "@/components/ezyr/ezyr-table";
import { EzyrTabs } from "@/components/ezyr/ezyr-tabs";
import { EzyrText } from "@/components/ezyr/ezyr-text";
import { coreComponentDefinitions } from "@/registry/component/definitions";
import { TypedRegistry } from "@/registry/create-registry";
import type { RendererDefinition } from "@/registry/types";

function renderWith(
  component: (props: {
    readonly node: AppNode;
    readonly children?: ReactNode;
  }) => ReactNode,
) {
  return function renderRegisteredComponent(
    node: AppNode,
    children: ReactNode,
  ) {
    return createElement(component, { node }, children);
  };
}

export class RendererRegistry extends TypedRegistry<RendererDefinition> {
  private readonly cache = new Map<string, RendererDefinition>();

  override register(entry: RendererDefinition): void {
    super.register(entry);
    this.cache.delete(entry.id);
  }

  override replace(entry: RendererDefinition): void {
    super.replace(entry);
    this.cache.delete(entry.id);
  }

  override unregister(id: string): void {
    super.unregister(id);
    this.cache.delete(id);
  }

  resolve(componentType: string): RendererDefinition | undefined {
    const cached = this.cache.get(componentType);

    if (cached) {
      return cached;
    }

    const renderer = this.get(componentType);

    if (renderer) {
      this.cache.set(componentType, renderer);
    }

    return renderer;
  }
}

const specializedRenderers: readonly RendererDefinition[] = [
  { id: "Frame", render: renderWith(EzyrFrame) },
  { id: "Section", render: renderWith(EzyrSection) },
  { id: "Text", render: renderWith(EzyrText) },
  { id: "Button", render: renderWith(EzyrButton) },
  { id: "Image", render: renderWith(EzyrImage) },
  { id: "Input", render: renderWith(EzyrInput) },
  { id: "Card", render: renderWith(EzyrCard) },
  { id: "Modal", render: renderWith(EzyrModal) },
  { id: "Table", render: renderWith(EzyrTable) },
  { id: "Tabs", render: renderWith(EzyrTabs) },
];

export const rendererRegistry = new RendererRegistry([
  ...specializedRenderers,
  ...coreComponentDefinitions
    .filter(
      (definition) =>
        !specializedRenderers.some((renderer) => renderer.id === definition.id),
    )
    .map((definition) => ({
      id: definition.id,
      render: renderWith(EzyrGeneric),
    })),
]);
