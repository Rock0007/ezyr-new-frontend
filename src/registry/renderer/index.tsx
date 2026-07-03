import { createElement, type ReactNode } from "react";
import type { AppNode } from "@/schemas/app-spec";
import { EzyrButton } from "@/components/ezyr/ezyr-button";
import { EzyrFrame } from "@/components/ezyr/ezyr-frame";
import { EzyrGeneric } from "@/components/ezyr/ezyr-generic";
import { EzyrImage } from "@/components/ezyr/ezyr-image";
import { EzyrSection } from "@/components/ezyr/ezyr-section";
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

export class RendererRegistry extends TypedRegistry<RendererDefinition> {}

const specializedRenderers: readonly RendererDefinition[] = [
  { id: "Frame", render: renderWith(EzyrFrame) },
  { id: "Section", render: renderWith(EzyrSection) },
  { id: "Text", render: renderWith(EzyrText) },
  { id: "Button", render: renderWith(EzyrButton) },
  { id: "Image", render: renderWith(EzyrImage) },
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
