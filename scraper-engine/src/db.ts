// ============================================================
// scraper-engine/src/db.ts - Prisma Client للسكرابر
// ============================================================
// يستخدم Direct URL لاتصال طويل بدون Pooling
// ============================================================

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "warn", "error"] : ["error"],
  });

// في التطوير: نحافظ على نفس الـ instance لمنعConnections المتعددة
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}

// Graceful shutdown
process.on("beforeExit", async () => {
  await db.$disconnect();
});
