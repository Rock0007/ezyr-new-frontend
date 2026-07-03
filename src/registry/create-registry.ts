import type {
  RegistryEntry,
  RegistryKey,
  RegistrySearchOptions,
} from "./types";

export class TypedRegistry<TEntry extends RegistryEntry> {
  private readonly entries = new Map<RegistryKey, TEntry>();

  constructor(initialEntries: readonly TEntry[] = []) {
    initialEntries.forEach((entry) => this.addInitialEntry(entry));
  }

  private addInitialEntry(entry: TEntry): void {
    if (this.entries.has(entry.id)) {
      throw new Error(`Registry entry "${entry.id}" is already registered.`);
    }

    this.entries.set(entry.id, entry);
  }

  register(entry: TEntry): void {
    if (this.entries.has(entry.id)) {
      throw new Error(`Registry entry "${entry.id}" is already registered.`);
    }

    this.entries.set(entry.id, entry);
  }

  replace(entry: TEntry): void {
    this.entries.set(entry.id, entry);
  }

  upsert(entry: TEntry): void {
    this.replace(entry);
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

  getAll(): readonly TEntry[] {
    return this.list();
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
