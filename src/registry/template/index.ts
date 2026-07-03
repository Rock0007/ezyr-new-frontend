import type { AppNode } from "@/schemas/app-spec";
import { TypedRegistry } from "@/registry/create-registry";
import type { TemplateDefinition } from "@/registry/types";

const heroTemplateRoot: AppNode = {
  id: "template-hero-root",
  type: "Section",
  props: {},
  style: {},
  bindings: {},
  events: {},
  children: [
    {
      id: "template-hero-title",
      type: "Text",
      props: { text: "Build something new", level: "heading" },
      style: {},
      bindings: {},
      events: {},
      children: [],
    },
    {
      id: "template-hero-action",
      type: "Button",
      props: { text: "Get started", variant: "primary", size: "large" },
      style: {},
      bindings: {},
      events: { click: { workflowId: "primary-action" } },
      children: [],
    },
  ],
};

export const templateRegistry = new TypedRegistry<TemplateDefinition>([
  {
    id: "hero-basic",
    name: "Hero",
    category: "Marketing",
    root: heroTemplateRoot,
  },
]);
