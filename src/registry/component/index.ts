import { TypedRegistry } from "@/registry/create-registry";
import type { ComponentDefinition } from "@/registry/types";
import { coreComponentDefinitions } from "./definitions";

export class ComponentRegistry extends TypedRegistry<ComponentDefinition> {
  createNode(type: string, id: string) {
    const definition = this.get(type);

    if (!definition) {
      throw new Error(`Unknown component type: ${type}`);
    }

    return {
      id,
      type,
      props: definition.defaultProps,
      style: {},
      bindings: {},
      events: {},
      children: [],
    };
  }
}

export const componentRegistry = new ComponentRegistry(
  coreComponentDefinitions,
);

export type { ComponentDefinition };
