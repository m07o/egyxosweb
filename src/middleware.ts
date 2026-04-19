// src/middleware.ts — Route Protection + Rate Limiting
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limiter";

// Rate Limit Configs
const RATE_LIMIT_CONFIGS = {
  protectedApi: {
    maxRequests: 10,
    windowMs: 60 * 1000, // 1 دقيقة
  },
  authApi: {
    maxRequests: 20,
    windowMs: 60 * 1000, // 1 دقيقة
  },
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const clientIp = getClientIp(request as unknown as Request);

  // 1. Rate Limiting لتسجيل الدخول
  if (pathname.startsWith("/api/auth")) {
    const result = checkRateLimit(`auth:${clientIp}`, RATE_LIMIT_CONFIGS.authApi);
    if (result.limited) {
      const retryAfterSec = Math.ceil((result.resetAt - Date.now()) / 1000);
      return NextResponse.json(
        { error: "طلبات كثيرة جداً. حاول بعد قليل.", retryAfter: retryAfterSec },
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

  // 2. حماية مسارات Dashboard و API
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/api/scrapers") || pathname.startsWith("/api/admin")) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token) {
      if (pathname.startsWith("/dashboard")) {
        const homeUrl = new URL("/", request.url);
        homeUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(homeUrl);
      }
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }
  }

  // 3. إضافة Security Headers
  const response = NextResponse.next();
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https:;"
  );

  return response;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/api/scrapers/:path*",
    "/api/admin/:path*",
    "/api/auth/:path*",
  ],
};