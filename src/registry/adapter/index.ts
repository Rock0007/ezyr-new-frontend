import { TypedRegistry } from "@/registry/create-registry";
import type { AdapterDefinition } from "@/registry/types";

export class AdapterRegistry extends TypedRegistry<AdapterDefinition> {
  private readonly componentCache = new Map<string, AdapterDefinition>();

  override register(entry: AdapterDefinition): void {
    super.register(entry);
    this.componentCache.delete(this.cacheKey(entry.componentType, entry.provider));
    this.componentCache.delete(this.cacheKey(entry.componentType));
  }

  override replace(entry: AdapterDefinition): void {
    super.replace(entry);
    this.componentCache.delete(this.cacheKey(entry.componentType, entry.provider));
    this.componentCache.delete(this.cacheKey(entry.componentType));
  }

  override unregister(id: string): void {
    const entry = this.get(id);
    super.unregister(id);

    if (entry) {
      this.componentCache.delete(this.cacheKey(entry.componentType, entry.provider));
      this.componentCache.delete(this.cacheKey(entry.componentType));
    }
  }

  getForComponent(
    componentType: string,
    provider?: string,
  ): AdapterDefinition | undefined {
    const key = this.cacheKey(componentType, provider);
    const cached = this.componentCache.get(key);

    if (cached) {
      return cached;
    }

    const adapter = this.list().find(
      (candidate) =>
        candidate.componentType === componentType &&
        (!provider || candidate.provider === provider),
    );

    if (adapter) {
      this.componentCache.set(key, adapter);
    }

    return adapter;
  }

  private cacheKey(componentType: string, provider = "default"): string {
    return `${provider}:${componentType}`;
  }
}

export const adapterRegistry = new AdapterRegistry();
