// ============================================================
// CinemaPlus - Rate Limiter
// In-memory sliding window rate limiter for API protection
// ============================================================

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

class RateLimiter {
  private store: Map<string, RateLimitEntry>;
  private cleanupInterval: NodeJS.Timeout | null;

  constructor() {
    this.store = new Map();
    this.cleanupInterval = setInterval(() => this.cleanup(), 60_000);
    if (this.cleanupInterval.unref) this.cleanupInterval.unref();
    if (typeof globalThis !== 'undefined') {
      (globalThis as any).__cinemaRateLimiter = this;
    }
  }

  check(identifier: string, limit: number, windowMs: number): {
    allowed: boolean;
    remaining: number;
    resetAt: number;
  } {
    const now = Date.now();
    const entry = this.store.get(identifier);

    if (!entry || now > entry.resetAt) {
      this.store.set(identifier, { count: 1, resetAt: now + windowMs });
      return { allowed: true, remaining: limit - 1, resetAt: now + windowMs };
    }

    if (entry.count >= limit) {
      return { allowed: false, remaining: 0, resetAt: entry.resetAt };
    }

    entry.count++;
    return { allowed: true, remaining: limit - entry.count, resetAt: entry.resetAt };
  }

  getStats() {
    return { trackedIPs: this.store.size };
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store) {
      if (now > entry.resetAt) this.store.delete(key);
    }
  }

  destroy(): void {
    if (this.cleanupInterval) clearInterval(this.cleanupInterval);
    this.store.clear();
  }
}

export const rateLimiter = new RateLimiter();

export const RATE_LIMITS = {
  TMDB: { limit: 50, windowMs: 60_000 },
  AUTH: { limit: 10, windowMs: 60_000 },
  ADMIN: { limit: 100, windowMs: 60_000 },
  SCRAPER_RUN: { limit: 5, windowMs: 60_000 },
  GENERAL: { limit: 60, windowMs: 60_000 },
} as const;

export function getClientIP(request: Request): string {
  const headers = new Headers(request.headers);
  const forwarded = headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  const realIP = headers.get('x-real-ip');
  if (realIP) return realIP;
  return 'unknown';
}

export function checkRateLimit(
  request: Request,
  preset: keyof typeof RATE_LIMITS,
  identifier?: string
) {
  const config = RATE_LIMITS[preset];
  const ip = identifier || getClientIP(request);
  return rateLimiter.check(ip, config.limit, config.windowMs);
}

export function rateLimitResponse(resetAt: number) {
  return new Response(
    JSON.stringify({ error: 'طلبات كثيرة جداً، حاول بعد قليل', retryAfter: Math.ceil((resetAt - Date.now()) / 1000) }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': String(Math.ceil((resetAt - Date.now()) / 1000)),
        'X-RateLimit-Reset': String(resetAt),
      },
    }
  );
}
