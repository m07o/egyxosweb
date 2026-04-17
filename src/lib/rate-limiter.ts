// ============================================================
// src/lib/rate-limiter.ts
// نظام تقييد الطلبات (Rate Limiter) + حماية من Brute Force
// ============================================================
// يعمل في الذاكرة (In-Memory) مع تنظيف تلقائي
// مناسب لبيئة Serverless و Cloudflare Workers
// ============================================================

interface RateLimitEntry {
  count: number;
  resetAt: number; // Unix timestamp (ms) when the counter resets
}

interface BruteForceEntry {
  attempts: number;
  lockedUntil: number; // Unix timestamp (ms) when lockout expires
}

// ═══════════════════════════════════════════════════════════
// In-Memory Store
// ═══════════════════════════════════════════════════════════
const rateLimitStore = new Map<string, RateLimitEntry>();
const bruteForceStore = new Map<string, BruteForceEntry>();

// تنظيف تلقائي كل 5 دقائق
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore) {
    if (entry.resetAt <= now) rateLimitStore.delete(key);
  }
  for (const [key, entry] of bruteForceStore) {
    if (entry.lockedUntil <= now) bruteForceStore.delete(key);
  }
}, CLEANUP_INTERVAL_MS).unref();

// ═══════════════════════════════════════════════════════════
// Rate Limiter - لتقييد عدد الطلبات
// ═══════════════════════════════════════════════════════════
export interface RateLimitConfig {
  maxRequests: number; // أقصى عدد طلبات
  windowMs: number; // طول فترة القياس (ms)
}

/**
 * فحص وتحديث Rate Limit لمفتاح معين (IP)
 * @returns { limited: boolean, remaining: number, resetAt: number }
 */
export function checkRateLimit(
  key: string,
  config: RateLimitConfig
): { limited: boolean; remaining: number; resetAt: number } {
  const now = Date.now();

  const existing = rateLimitStore.get(key);

  // إذا انتهت فترة القياس، ابدأ من جديد
  if (!existing || existing.resetAt <= now) {
    const resetAt = now + config.windowMs;
    rateLimitStore.set(key, { count: 1, resetAt });
    return {
      limited: false,
      remaining: config.maxRequests - 1,
      resetAt,
    };
  }

  // ضمن نفس فترة القياس
  if (existing.count >= config.maxRequests) {
    return {
      limited: true,
      remaining: 0,
      resetAt: existing.resetAt,
    };
  }

  // زيادة العداد
  existing.count++;
  return {
    limited: false,
    remaining: config.maxRequests - existing.count,
    resetAt: existing.resetAt,
  };
}

// ═══════════════════════════════════════════════════════════
// Brute Force Protection - حماية من تسجيل الدخول المتكرر
// ═══════════════════════════════════════════════════════════
export interface BruteForceConfig {
  maxAttempts: number; // أقصى عدد محاولات فشل
  lockoutMs: number; // مدة الحظر (ms)
}

/**
 * تسجيل محاولة فشل في تسجيل الدخول
 * @returns { locked: boolean, remainingAttempts: number, lockedUntil: number | null }
 */
export function recordFailedLogin(
  key: string,
  config: BruteForceConfig
): { locked: boolean; remainingAttempts: number; lockedUntil: number | null } {
  const now = Date.now();
  const existing = bruteForceStore.get(key);

  // إذا كان محظوراً ولم تنتهِ المدة
  if (existing && existing.lockedUntil > now) {
    return {
      locked: true,
      remainingAttempts: 0,
      lockedUntil: existing.lockedUntil,
    };
  }

  // إذا انتهت مدة الحظر، ابدأ من جديد
  if (!existing || existing.lockedUntil <= now) {
    const newAttempts = 1;
    const isLocked = newAttempts >= config.maxAttempts;
    bruteForceStore.set(key, {
      attempts: newAttempts,
      lockedUntil: isLocked ? now + config.lockoutMs : 0,
    });
    return {
      locked: isLocked,
      remainingAttempts: config.maxAttempts - newAttempts,
      lockedUntil: isLocked ? now + config.lockoutMs : null,
    };
  }

  // زيادة عدد المحاولات
  existing.attempts++;
  const isLocked = existing.attempts >= config.maxAttempts;

  if (isLocked) {
    existing.lockedUntil = now + config.lockoutMs;
  }

  return {
    locked: isLocked,
    remainingAttempts: Math.max(0, config.maxAttempts - existing.attempts),
    lockedUntil: isLocked ? existing.lockedUntil : null,
  };
}

/**
 * تسجيل نجاح تسجيل الدخول (مسح المحاولات)
 */
export function recordSuccessfulLogin(key: string): void {
  bruteForceStore.delete(key);
}

/**
 * فحص هل الـ IP محظور حالياً
 */
export function isLockedOut(key: string): { locked: boolean; lockedUntil: number | null } {
  const existing = bruteForceStore.get(key);
  if (!existing) return { locked: false, lockedUntil: null };

  const now = Date.now();
  if (existing.lockedUntil > now) {
    return { locked: true, lockedUntil: existing.lockedUntil };
  }

  // انتهت مدة الحظر
  bruteForceStore.delete(key);
  return { locked: false, lockedUntil: null };
}

/**
 * استخراج IP من الطلب
 */
export function getClientIp(request: Request): string {
  // try X-Forwarded-For (Cloudflare / Nginx)
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  // try CF-Connecting-IP (Cloudflare)
  const cfIp = request.headers.get("cf-connecting-ip");
  if (cfIp) return cfIp;

  // try X-Real-IP
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp;

  return "unknown";
}
