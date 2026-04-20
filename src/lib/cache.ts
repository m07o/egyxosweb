// ============================================================
// CinemaPlus - Cache System
// In-memory TTL cache with Map-based storage
// Supports: get, set, delete, clear, has, stats, cachedFetch
// ============================================================

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
  createdAt: number;
  hitCount: number;
}

interface CacheStats {
  size: number;
  maxSize: number;
  hits: number;
  misses: number;
  sets: number;
  evictions: number;
  hitRate: string;
}

class MemoryCache {
  private cache: Map<string, CacheEntry<unknown>>;
  private hits: number;
  private misses: number;
  private sets: number;
  private evictions: number;
  private defaultTtl: number;
  private cleanupInterval: NodeJS.Timeout | null;
  private maxKeys: number;

  constructor(options?: { defaultTtl?: number; maxKeys?: number; cleanupIntervalMs?: number }) {
    this.cache = new Map();
    this.hits = 0;
    this.misses = 0;
    this.sets = 0;
    this.evictions = 0;
    this.defaultTtl = options?.defaultTtl ?? 5 * 60 * 1000;
    this.maxKeys = options?.maxKeys ?? 5000;
    this.cleanupInterval = setInterval(
      () => this.cleanup(),
      options?.cleanupIntervalMs ?? 5 * 60 * 1000
    );
    if (this.cleanupInterval.unref) {
      this.cleanupInterval.unref();
    }
    if (typeof globalThis !== 'undefined') {
      (globalThis as any).__cinemaCache = this;
    }
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) {
      this.misses++;
      return null;
    }
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      this.misses++;
      this.evictions++;
      return null;
    }
    entry.hitCount++;
    this.hits++;
    return entry.value as T;
  }

  set<T>(key: string, value: T, ttl?: number): void {
    if (this.cache.size >= this.maxKeys && !this.cache.has(key)) {
      this.evictOldest(Math.ceil(this.maxKeys * 0.1));
    }
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + (ttl ?? this.defaultTtl),
      createdAt: Date.now(),
      hitCount: 0,
    });
    this.sets++;
  }

  async getOrSet<T>(key: string, fn: () => T | Promise<T>, ttl?: number): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== null) return cached;
    const value = await fn();
    this.set(key, value, ttl);
    return value;
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return false;
    }
    return true;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  deleteByPrefix(prefix: string): number {
    let count = 0;
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
        count++;
      }
    }
    return count;
  }

  invalidate(pattern: string): number {
    return this.deleteByPrefix(pattern);
  }

  clear(): void {
    this.cache.clear();
  }

  getStats(): CacheStats {
    const total = this.hits + this.misses;
    return {
      size: this.cache.size,
      maxSize: this.maxKeys,
      hits: this.hits,
      misses: this.misses,
      sets: this.sets,
      evictions: this.evictions,
      hitRate: total > 0 ? `${((this.hits / total) * 100).toFixed(1)}%` : "N/A",
    };
  }

  get size(): number {
    return this.cache.size;
  }

  private cleanup(): void {
    const now = Date.now();
    let cleaned = 0;
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
        cleaned++;
      }
    }
    if (cleaned > 0) {
      console.log(`[CACHE] Cleaned up ${cleaned} expired entries. Remaining: ${this.cache.size}`);
    }
  }

  private evictOldest(count: number): void {
    const entries = Array.from(this.cache.entries())
      .sort((a, b) => a[1].hitCount - b[1].hitCount || a[1].createdAt - b[1].createdAt);
    for (let i = 0; i < Math.min(count, entries.length); i++) {
      this.cache.delete(entries[i][0]);
      this.evictions++;
    }
  }
}

// ── Pre-configured Cache Instances ──
export const shortCache = new MemoryCache({ defaultTtl: 60 * 1000, maxKeys: 1000 });
export const mediumCache = new MemoryCache({ defaultTtl: 5 * 60 * 1000, maxKeys: 2000 });
export const longCache = new MemoryCache({ defaultTtl: 60 * 60 * 1000, maxKeys: 3000 });
export const rateLimitCache = new MemoryCache({ defaultTtl: 60 * 1000, maxKeys: 10000 });
export const cache = new MemoryCache({ defaultTtl: 10 * 60 * 1000, maxKeys: 5000 });
export default cache;

// ── TTL Presets ──
export const TTL = {
  SHORT: 5 * 60 * 1000,         // 5 minutes
  MEDIUM: 15 * 60 * 1000,       // 15 minutes
  LONG: 60 * 60 * 1000,         // 1 hour
  VERY_LONG: 6 * 60 * 60 * 1000, // 6 hours
  DAILY: 24 * 60 * 60 * 1000,   // 24 hours
} as const;

// ── Helper: cachedFetch ──
export async function cachedFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl?: number
): Promise<T> {
  const cached = cache.get<T>(key);
  if (cached !== null) return cached;
  const data = await fetcher();
  cache.set(key, data, ttl);
  return data;
}

// ── Helper: cacheKey ──
export function cacheKey(prefix: string, ...parts: (string | number | undefined | null)[]): string {
  return `${prefix}:${parts.filter(Boolean).join(':')}`;
}
