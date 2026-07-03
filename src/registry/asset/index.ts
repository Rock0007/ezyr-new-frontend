import { TypedRegistry } from "@/registry/create-registry";
import type { AssetDefinition } from "@/registry/types";

export class AssetRegistry extends TypedRegistry<AssetDefinition> {
  resolve(id: string): AssetDefinition | undefined {
    return this.get(id);
  }
}

export const assetRegistry = new AssetRegistry();
