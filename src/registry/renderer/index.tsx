import { createElement, type ReactNode } from "react";
import type { AppNode } from "@/schemas/app-spec";
import { EzyrButton } from "@/components/ezyr/ezyr-button";
import { EzyrFrame } from "@/components/ezyr/ezyr-frame";
import { EzyrImage } from "@/components/ezyr/ezyr-image";
import { EzyrSection } from "@/components/ezyr/ezyr-section";
import { EzyrText } from "@/components/ezyr/ezyr-text";
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

export const rendererRegistry = new RendererRegistry([
  { id: "Frame", render: renderWith(EzyrFrame) },
  { id: "Section", render: renderWith(EzyrSection) },
  { id: "Text", render: renderWith(EzyrText) },
  { id: "Button", render: renderWith(EzyrButton) },
  { id: "Image", render: renderWith(EzyrImage) },
  { id: "Form", render: renderWith(EzyrFrame) },
]);
