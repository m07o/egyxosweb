// ============================================================
// next.config.ts - إعدادات Next.js متوافقة مع OpenNext + Cloudflare
// ============================================================

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ═══════════════════════════════════════════════════════════
  // تعطيل Turbopack كلياً - يستخدم SWC بدلاً منه
  // Turbopack لا يدعم الأحرف العربية في المسارات
  // ═══════════════════════════════════════════════════════════
  swcMinify: true,

  // ═══════════════════════════════════════════════════════════
  // لا تستخدم output: "standalone" مع Cloudflare
  // OpenNext يتعامل مع الـ build output بشكل خاص
  // ═══════════════════════════════════════════════════════════

  // ═══════════════════════════════════════════════════════════
  // إعدادات TypeScript
  // ═══════════════════════════════════════════════════════════
  typescript: {
    ignoreBuildErrors: true,
  },

  reactStrictMode: false,

  // ═══════════════════════════════════════════════════════════
  // experimental features مطلوبة لـ OpenNext
  // ═══════════════════════════════════════════════════════════
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },

  // ═══════════════════════════════════════════════════════════
  // إعدادات الصور - مهمة جداً على Cloudflare
  // ═══════════════════════════════════════════════════════════
  images: {
    // Cloudflare Workers لا يدعم image optimization المحلي
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "image.tmdb.org",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════
  // إعدادات Headers (CORS و Security)
  // ═══════════════════════════════════════════════════════════
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "*",
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, PUT, DELETE, OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type, Authorization",
          },
        ],
      },
    ];
  },

  // ═══════════════════════════════════════════════════════════
  // Cloudflare Workers — لا توجد إعدادات webpack خاصة
  // bcryptjs هي Pure JS وتعمل مباشرة على Workers
  // ═══════════════════════════════════════════════════════════
};

export default nextConfig;
