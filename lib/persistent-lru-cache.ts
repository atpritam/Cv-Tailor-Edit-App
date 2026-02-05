// LRU cache that persists in sessionStorage.
export class PersistentLRUCache<K, V> {
  private capacity: number;
  private storageKey: string;
  private cache: Map<K, V>;

  constructor(storageKey: string, capacity: number) {
    this.storageKey = storageKey;
    this.capacity = capacity;
    this.cache = this._loadFromStorage();
  }

  private _loadFromStorage(): Map<K, V> {
    try {
      if (typeof window !== "undefined" && window.sessionStorage) {
        const stored = window.sessionStorage.getItem(this.storageKey);
        if (stored) {
          // The stored value is an array of [key, value] pairs
          return new Map(JSON.parse(stored));
        }
      }
    } catch (error) {
      console.error("Failed to load from sessionStorage:", error);
    }
    return new Map();
  }

  private _saveToStorage(): void {
    try {
      if (typeof window !== "undefined" && window.sessionStorage) {
        // Convert Map to array of [key, value] pairs for serialization
        const serialized = JSON.stringify(Array.from(this.cache.entries()));
        window.sessionStorage.setItem(this.storageKey, serialized);
      }
    } catch (error) {
      console.error("Failed to save to sessionStorage:", error);
    }
  }

  get(key: K): V | undefined {
    if (!this.cache.has(key)) {
      return undefined;
    }

    const value = this.cache.get(key)!;
    // Move to end to mark as recently used
    this.cache.delete(key);
    this.cache.set(key, value);
    this._saveToStorage();
    return value;
  }

  set(key: K, value: V): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.capacity) {
      const leastUsedKey = this.cache.keys().next().value;
      if (leastUsedKey !== undefined) {
        this.cache.delete(leastUsedKey);
      }
    }
    this.cache.set(key, value);
    this._saveToStorage();
  }

  has(key: K): boolean {
    return this.cache.has(key);
  }

  clear(): void {
    this.cache.clear();
    try {
      if (typeof window !== "undefined" && window.sessionStorage) {
        window.sessionStorage.removeItem(this.storageKey);
      }
    } catch (error) {
      console.error("Failed to clear sessionStorage:", error);
    }
  }
}
