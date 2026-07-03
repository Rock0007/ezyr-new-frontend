import type { BuilderComponent } from "@/types/builder";
import { componentRegistry } from "@/registry/component";

export const BUILDER_COMPONENTS: BuilderComponent[] = componentRegistry
  .list()
  .map((definition) => ({
    id: definition.id,
    kind: definition.id as BuilderComponent["kind"],
    name: definition.displayName,
    description: definition.description,
    category: definition.category,
    icon: definition.icon,
  }));
