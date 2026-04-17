<<<<<<< HEAD
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith('/dashboard')) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    })

    if (!token) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  if (pathname.startsWith('/api/admin') || pathname.startsWith('/api/scrape')) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    })

    if (!token) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }
  }

  return NextResponse.next()
=======
// ============================================================
// src/middleware.ts — Route Protection + Rate Limiting
// ============================================================
// ترقيعات الأمان المُطبّقة:
//
// 1. حماية مسارات /dashboard (إعادة توجيه لـ /login)
// 2. حماية مسارات /api/scrapers (401 unauthorized)
// 3. Rate Limiting:
//    - /api/scrapers و /api/admin: 10 طلبات/دقيقة لكل IP
//    - /api/auth/* (تسجيل الدخول): 20 طلب/دقيقة لكل IP
//    - تجاوز الحد → 429 Too Many Requests
//    - Headers: X-RateLimit-Remaining, X-RateLimit-Reset
// ============================================================

import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limiter";

// ═══════════════════════════════════════════════════════════
// Rate Limit Configs
// ═══════════════════════════════════════════════════════════
const RATE_LIMIT_CONFIGS = {
  // API محمية — 10 طلبات/دقيقة
  protectedApi: {
    maxRequests: 10,
    windowMs: 60 * 1000, // 1 دقيقة
  },
  // تسجيل الدخول — 20 طلب/دقيقة (لأن Brute Force في auth.ts يعالج الباقي)
  authApi: {
    maxRequests: 20,
    windowMs: 60 * 1000, // 1 دقيقة
  },
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const clientIp = getClientIp(request as unknown as Request);

  // ═══════════════════════════════════════════════════════════
  // 1. Rate Limiting لتسجيل الدخول
  // ═══════════════════════════════════════════════════════════
  if (pathname.startsWith("/api/auth")) {
    const result = checkRateLimit(
      `auth:${clientIp}`,
      RATE_LIMIT_CONFIGS.authApi
    );

    if (result.limited) {
      const retryAfterSec = Math.ceil(
        (result.resetAt - Date.now()) / 1000
      );
      return NextResponse.json(
        {
          error: "طلبات كثيرة جداً. حاول بعد قليل.",
          retryAfter: retryAfterSec,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(retryAfterSec),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": String(Math.ceil(result.resetAt / 1000)),
          },
        }
      );
    }
  }

  // ═══════════════════════════════════════════════════════════
  // 2. Rate Limiting لـ API المحمية (scrapers + admin)
  // ═══════════════════════════════════════════════════════════
  if (pathname.startsWith("/api/scrapers") || pathname.startsWith("/api/admin")) {
    const result = checkRateLimit(
      `api:${clientIp}`,
      RATE_LIMIT_CONFIGS.protectedApi
    );

    if (result.limited) {
      const retryAfterSec = Math.ceil(
        (result.resetAt - Date.now()) / 1000
      );
      return NextResponse.json(
        {
          error: "طلبات كثيرة جداً. حاول بعد قليل.",
          retryAfter: retryAfterSec,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(retryAfterSec),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": String(Math.ceil(result.resetAt / 1000)),
          },
        }
      );
    }
  }

  // ═══════════════════════════════════════════════════════════
  // 3. حماية مسارات Dashboard
  // ═══════════════════════════════════════════════════════════
  if (pathname.startsWith("/dashboard")) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // ═══════════════════════════════════════════════════════════
  // 4. حماية API Scrapers — يتطلب مصادقة
  // ═══════════════════════════════════════════════════════════
  if (pathname.startsWith("/api/scrapers")) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token) {
      return NextResponse.json(
        { error: "غير مصرح" },
        { status: 401 }
      );
    }
  }

  // ═══════════════════════════════════════════════════════════
  // 5. حماية API Admin — يتطلب مصادقة
  // ═══════════════════════════════════════════════════════════
  if (pathname.startsWith("/api/admin")) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token) {
      return NextResponse.json(
        { error: "غير مصرح" },
        { status: 401 }
      );
    }
  }

  // ═══════════════════════════════════════════════════════════
  // 6. إضافة Security Headers لكل الطلبات
  // ═══════════════════════════════════════════════════════════
  const response = NextResponse.next();

  // منع clickjacking
  response.headers.set("X-Frame-Options", "DENY");
  // حماية XSS
  response.headers.set("X-Content-Type-Options", "nosniff");
  // منع MIME sniffing
  response.headers.set("X-XSS-Protection", "1; mode=block");
  // HSTS — HTTPS فقط
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains"
  );
  // منع تتبع المرجع
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  // Content Security Policy — أساسي
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https:;"
  );

  return response;
>>>>>>> origin/master
}

export const config = {
  matcher: [
<<<<<<< HEAD
    '/dashboard/:path*',
    '/api/admin/:path*',
    '/api/scrape/:path*',
  ],
}
=======
    "/dashboard/:path*",
    "/api/scrapers/:path*",
    "/api/admin/:path*",
    "/api/auth/:path*",
  ],
};
>>>>>>> origin/master
