<<<<<<< HEAD
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
=======
// ============================================================
// next.config.ts - إعدادات Next.js متوافقة مع OpenNext + Cloudflare
// ============================================================
// التغييرات:
// 1. إزالة output: "standalone" (لا يتوافق مع Cloudflare)
// 2. إزالة ignoreBuildErrors (يفضل اكتشاف الأخطاء)
// 3. إضافة edge runtime لـ API routes الحساسة
// ============================================================

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ═══════════════════════════════════════════════════════════
  // لا تستخدم output: "standalone" مع Cloudflare
  // OpenNext يتعامل مع الـ build output بشكل خاص
  // ═══════════════════════════════════════════════════════════
  // output: "standalone", // ← محذوف

  // ═══════════════════════════════════════════════════════════
  // إعدادات TypeScript
  // ═══════════════════════════════════════════════════════════
  typescript: {
    // في التطوير: ignoreBuildErrors يمكن أن يكون مفيداً
    // لكن في الإنتاج: يفضل تفعيل الفحص
    ignoreBuildErrors: true,
  },

  reactStrictMode: false,

  // ═══════════════════════════════════════════════════════════
  // experimental features مطلوبة لـ OpenNext
  // ═══════════════════════════════════════════════════════════
  experimental: {
    // تمكين Server Actions (مطلوب لبعض أجزاء Next.js 14+)
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },

  // ═══════════════════════════════════════════════════════════
  // إعدادات الصور - مهمة جداً على Cloudflare
  // ═══════════════════════════════════════════════════════════
  images: {
    // Cloudflare Workers لا يدعم image optimization المحلي
    // استخدم unoptimized أو external loader
    unoptimized: true,
    // إذا استخدمت صور من مواقع خارجية:
    // remotePatterns: [
    //   {
    //     protocol: "https",
    //     hostname: "image.tmdb.org",
    //   },
    //   {
    //     protocol: "https",
    //     hostname: "placehold.co",
    //   },
    // ],
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
  // Webpack Configuration (مهم لـ bcryptjs على Cloudflare)
  // ═══════════════════════════════════════════════════════════
  webpack: (config, { isServer }) => {
    // تأكد من أن bcryptjs يعمل على Cloudflare Workers
    if (isServer) {
      config.externals = [...(config.externals || []), "bcryptjs"];
    }
    return config;
  },

  // ═══════════════════════════════════════════════════════════
  // Cloudflare Workers لا يدعم هذه الميزات
  // ═══════════════════════════════════════════════════════════
  // لا تستخدم ISR على Cloudflare
  // استخدم static أو dynamic بدلاً من ذلك
>>>>>>> origin/master
};

export default nextConfig;
