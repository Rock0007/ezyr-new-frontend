import { TypedRegistry } from "@/registry/create-registry";
import type { AdapterDefinition } from "@/registry/types";

export class AdapterRegistry extends TypedRegistry<AdapterDefinition> {
  getForComponent(componentType: string): AdapterDefinition | undefined {
    return this.list().find(
      (adapter) => adapter.componentType === componentType,
    );
  }
}

export const adapterRegistry = new AdapterRegistry();
