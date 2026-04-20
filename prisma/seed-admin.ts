// ============================================================
// prisma/seed-admin.ts — Seed Admin Account
// ============================================================
// الاستخدام:
//   npx tsx prisma/seed-admin.ts
// ============================================================

import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

async function main() {
  console.log("🔐 Seeding admin account...");

  const hashedPassword = await hash("Admin@123", 12);

  const admin = await prisma.admin.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      password: hashedPassword,
    },
  });

  console.log(`✅ Admin account seeded (username: ${admin.username})`);
}

main()
  .catch((e) => {
    console.error("❌ Admin seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
