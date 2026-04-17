// ==========================================
// Middleware - حماية مسار /dashboard
// يتحقق من NextAuth JWT token
// ==========================================

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // حماية كل صفحات /dashboard
  if (pathname.startsWith('/dashboard')) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    })

    if (!token) {
      // لو مش مسجل دخول → يحوله لصفحة الدخول
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  // حماية API routes الخاصة بالأدمن
  if (pathname.startsWith('/api/admin') || pathname.startsWith('/api/scrape')) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    })

    if (!token) {
      return NextResponse.json({ error: 'غير مصرح - سجل دخول أولاً' }, { status: 401 })
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/admin/:path*',
    '/api/scrape/:path*',
  ],
}
