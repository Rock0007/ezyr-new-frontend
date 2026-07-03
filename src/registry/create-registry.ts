import type {
  RegistryEntry,
  RegistryKey,
  RegistrySearchOptions,
} from "./types";

export class TypedRegistry<TEntry extends RegistryEntry> {
  private readonly entries = new Map<RegistryKey, TEntry>();

  constructor(initialEntries: readonly TEntry[] = []) {
    initialEntries.forEach((entry) => this.register(entry));
  }

  register(entry: TEntry): void {
    this.entries.set(entry.id, entry);
  }

  unregister(id: RegistryKey): void {
    this.entries.delete(id);
  }

  get(id: RegistryKey): TEntry | undefined {
    return this.entries.get(id);
  }

  has(id: RegistryKey): boolean {
    return this.entries.has(id);
  }

  list(): readonly TEntry[] {
    return Array.from(this.entries.values());
  }

  search(options: RegistrySearchOptions = {}): readonly TEntry[] {
    const normalizedQuery = options.query?.trim().toLowerCase();

    return this.list().filter((entry) => {
      const matchesQuery =
        !normalizedQuery ||
        JSON.stringify(entry).toLowerCase().includes(normalizedQuery);
      const matchesCategory =
        !options.category ||
        !("category" in entry) ||
        entry.category === options.category;

      return matchesQuery && matchesCategory;
    });
  }
}
