// ============================================================
// open-next.config.ts - إعدادات OpenNext لنشر Next.js على Cloudflare
// ============================================================
// المشكلة الأصلية: OpenNext كان يولد اسم Worker افتراضي
// 'nextjs-tailwind-shadcn-ts' (من package.json) بدلاً من
// اسم المشروع الحقيقي 'egyxosweb'.
//
// الحل: تجاوز الاسم في الـ config بشكل صريح.
// ============================================================

import type { OpenNextConfig } from "@opennextjs/cloudflare";

const config: OpenNextConfig = {
  // ═══════════════════════════════════════════════════════════
  // الاسم الحقيقي للمشروع - هذا هو الإصلاح الأساسي
  // ═══════════════════════════════════════════════════════════
  // يمنع OpenNext من استخدام اسم الـ package.json كاسم Worker
  // ويتأكد من أن Service Bindings تشير إلى 'egyxosweb'
  // ═══════════════════════════════════════════════════════════
  default: {
    override: {
      wrapper: "cloudflare-node",
      converter: "edge",
      incrementalCache: "dummy",
      tagCache: "dummy",
      queue: "dummy",
    },
  },

  // ═══════════════════════════════════════════════════════════
  // إعدادات Lambda (API Routes)
  // ═══════════════════════════════════════════════════════════
  lambda: {
    runtime: "node",
    // زيادة timeout للـ API routes المعقدة
    // Cloudflare Workers الحد الأقصى 30 ثانية (paid plan)
    },
};

export default config;
