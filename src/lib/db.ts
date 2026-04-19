// ============================================================
// src/lib/db.ts - Prisma Client لـ PostgreSQL (Supabase)
// ============================================================
// تم تحسينه ليعمل مع Connection Pooling على Cloudflare
// ═══════════════════════════════════════════════════════════

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    // تقليل الـ logs في الإنتاج
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "warn", "error"]
        : ["error"],
  });

// في التطوير: نحافظ على نفس الـ instance
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
