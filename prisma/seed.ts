// ============================================================
// prisma/seed.ts — بيانات أولية (محمّية)
// ============================================================
// ترقيعات الأمان:
//
// 1. لا توجد بيانات دخول افتراضية (hardcoded) في الكود.
//    Admin يُقرأ من Environment Variables:
//      - ADMIN_USERNAME (مطلوب، 3 أحرف على الأقل)
//      - ADMIN_PASSWORD (مطلوب، 8 أحرف على الأقل)
//
// 2. إذا لم تُعرّف المتغيرات، يرمي Error ولا يُنشئ حساب.
//
// 3. يمكن تشغيله بأمان في بيئة الإنتاج.
//
// الاستخدام:
//   ADMIN_USERNAME=admin ADMIN_PASSWORD=MyStr0ngP@ss! npx prisma db seed
// ============================================================

import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // ═══════════════════════════════════════════════════════════
  // 1. إنشاء حساب المدير من Environment Variables
  // ═══════════════════════════════════════════════════════════
  const adminUsername = process.env.ADMIN_USERNAME;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminUsername || adminUsername.length < 3) {
    throw new Error(
      "[SECURITY] ADMIN_USERNAME is required (min 3 characters). " +
      "Usage: ADMIN_USERNAME=admin ADMIN_PASSWORD=<strong_pass> npx prisma db seed"
    );
  }

  if (!adminPassword || adminPassword.length < 8) {
    throw new Error(
      "[SECURITY] ADMIN_PASSWORD is required (min 8 characters). " +
      "Usage: ADMIN_USERNAME=admin ADMIN_PASSWORD=<strong_pass> npx prisma db seed"
    );
  }

  // تحقق من قوة كلمة المرور
  const hasUppercase = /[A-Z]/.test(adminPassword);
  const hasLowercase = /[a-z]/.test(adminPassword);
  const hasNumber = /[0-9]/.test(adminPassword);
  const hasSpecial = /[^A-Za-z0-9]/.test(adminPassword);

  if (!hasUppercase || !hasLowercase || !hasNumber || !hasSpecial) {
    console.warn(
      "[SECURITY] ADMIN_PASSWORD is weak. " +
      "It should contain uppercase, lowercase, numbers, and special characters."
    );
  }

  const admin = await prisma.admin.upsert({
    where: { username: adminUsername },
    update: {},
    create: {
      username: adminUsername,
      password: await hash(adminPassword, 12),
    },
  });

  console.log(`Admin created: ${admin.username}`);

  // ═══════════════════════════════════════════════════════════
  // 2. إعدادات الموقع
  // ═══════════════════════════════════════════════════════════
  const settings = await prisma.siteSettings.upsert({
    where: { id: "main" },
    update: {},
    create: {
      id: "main",
      siteName: "سينما بلس",
      siteDescription: "مشاهدة وتحميل أفلام ومسلسلات",
      heroAutoPlay: true,
      heroInterval: 7,
    },
  });

  console.log(`Settings created: ${settings.siteName}`);

  console.log("Seeding completed!");
}

main()
  .catch((e) => {
    console.error("Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
