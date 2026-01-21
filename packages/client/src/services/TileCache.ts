// Offline tile caching using IndexedDB

const DB_NAME = 'ampmatter-tiles';
const DB_VERSION = 1;
const STORE_NAME = 'tiles';

interface CachedTile {
  key: string;      // "{source}/{z}/{x}/{y}"
  blob: Blob;
  timestamp: number;
}

class TileCacheService {
  private db: IDBDatabase | null = null;
  private dbPromise: Promise<IDBDatabase> | null = null;

  async init(): Promise<IDBDatabase> {
    if (this.db) return this.db;
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error('Failed to open tile cache database');
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'key' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });

    return this.dbPromise;
  }

  private getTileKey(source: string, z: number, x: number, y: number): string {
    return `${source}/${z}/${x}/${y}`;
  }

  async getTile(source: string, z: number, x: number, y: number): Promise<Blob | null> {
    try {
      const db = await this.init();
      const key = this.getTileKey(source, z, x, y);

      return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(key);

        request.onsuccess = () => {
          const result = request.result as CachedTile | undefined;
          resolve(result?.blob ?? null);
        };

        request.onerror = () => reject(request.error);
      });
    } catch (err) {
      console.error('Error getting cached tile:', err);
      return null;
    }
  }

  async setTile(source: string, z: number, x: number, y: number, blob: Blob): Promise<void> {
    try {
      const db = await this.init();
      const key = this.getTileKey(source, z, x, y);

      return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);

        const tile: CachedTile = {
          key,
          blob,
          timestamp: Date.now(),
        };

        const request = store.put(tile);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (err) {
      console.error('Error caching tile:', err);
    }
  }

  async getCacheStats(): Promise<{ count: number; sizeBytes: number }> {
    try {
      const db = await this.init();

      return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.openCursor();

        let count = 0;
        let sizeBytes = 0;

        request.onsuccess = (event) => {
          const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
          if (cursor) {
            count++;
            sizeBytes += (cursor.value as CachedTile).blob.size;
            cursor.continue();
          } else {
            resolve({ count, sizeBytes });
          }
        };

        request.onerror = () => reject(request.error);
      });
    } catch (err) {
      console.error('Error getting cache stats:', err);
      return { count: 0, sizeBytes: 0 };
    }
  }

  async clearCache(): Promise<void> {
    try {
      const db = await this.init();

      return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.clear();

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (err) {
      console.error('Error clearing cache:', err);
    }
  }

  async clearOldTiles(maxAgeMs: number = 30 * 24 * 60 * 60 * 1000): Promise<number> {
    // Default: clear tiles older than 30 days
    try {
      const db = await this.init();
      const cutoff = Date.now() - maxAgeMs;

      return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const index = store.index('timestamp');
        const range = IDBKeyRange.upperBound(cutoff);
        const request = index.openCursor(range);

        let deleted = 0;

        request.onsuccess = (event) => {
          const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
          if (cursor) {
            cursor.delete();
            deleted++;
            cursor.continue();
          } else {
            resolve(deleted);
          }
        };

        request.onerror = () => reject(request.error);
      });
    } catch (err) {
      console.error('Error clearing old tiles:', err);
      return 0;
    }
  }
}

// Singleton instance
export const tileCache = new TileCacheService();

// Utility function to fetch and cache a tile
export async function fetchAndCacheTile(
  url: string,
  source: string,
  z: number,
  x: number,
  y: number
): Promise<string> {
  // First check cache
  const cached = await tileCache.getTile(source, z, x, y);
  if (cached) {
    return URL.createObjectURL(cached);
  }

  // Fetch from network
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const blob = await response.blob();

    // Cache the tile
    await tileCache.setTile(source, z, x, y, blob);

    return URL.createObjectURL(blob);
  } catch (err) {
    // Return empty/error tile URL or rethrow
    console.warn(`Failed to fetch tile ${source}/${z}/${x}/${y}:`, err);
    throw err;
  }
}
