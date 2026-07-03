import type { BuilderComponent } from "@/types/builder";
import { componentRegistry } from "@/registry/component";
import type { ComponentTaxonomy } from "@/registry/types";

export const BUILDER_TAXONOMY_LABELS: Record<ComponentTaxonomy, string> = {
  business: "Business Components",
  content: "Content",
  "data-display": "Data Display",
  "data-entry": "Data Entry",
  feedback: "Feedback",
  interactive: "Interactive",
  layout: "Layout",
  navigation: "Navigation",
  overlay: "Overlay",
};

export const BUILDER_TAXONOMY_ORDER: readonly ComponentTaxonomy[] = [
  "layout",
  "content",
  "interactive",
  "overlay",
  "navigation",
  "data-display",
  "data-entry",
  "feedback",
  "business",
];

export const BUILDER_COMPONENTS: BuilderComponent[] = componentRegistry
  .listCanvasInsertable()
  .map((definition) => ({
    id: definition.id,
    kind: definition.id as BuilderComponent["kind"],
    name: definition.displayName,
    description: definition.description,
    taxonomy: definition.taxonomy,
    taxonomyLabel: BUILDER_TAXONOMY_LABELS[definition.taxonomy],
    icon: definition.icon,
  }));
