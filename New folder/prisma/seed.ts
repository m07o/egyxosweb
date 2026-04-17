// ============================================================
// prisma/seed.ts - بيانات أولية لـ PostgreSQL
// ============================================================
// تشغيل: npx prisma db seed
// ═══════════════════════════════════════════════════════════

import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding PostgreSQL database...");

  // ═══════════════════════════════════════════════════════════
  // 1. إنشاء حساب المدير
  // ═══════════════════════════════════════════════════════════
  const admin = await prisma.admin.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      password: await hash("admin123", 12),
    },
  });
  console.log(`✅ Admin: ${admin.username} (admin/admin123)`);

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
  console.log(`✅ Settings: ${settings.siteName}`);

  // ═══════════════════════════════════════════════════════════
  // 3. إعدادات السكرابر
  // ═══════════════════════════════════════════════════════════
  const wecimaConfig = await prisma.scraperConfig.upsert({
    where: { siteId: "wecima" },
    update: {},
    create: {
      siteId: "wecima",
      siteName: "Wecima",
      baseUrl: "https://wecima.bar",
      enabled: true,
      maxPages: 5,
      delayMs: 2000,
    },
  });
  console.log(`✅ Scraper: ${wecimaConfig.siteName} (${wecimaConfig.baseUrl})`);

  const mycimaConfig = await prisma.scraperConfig.upsert({
    where: { siteId: "mycima" },
    update: {},
    create: {
      siteId: "mycima",
      siteName: "MyCima",
      baseUrl: "https://mycima.cc",
      enabled: false,
      maxPages: 5,
      delayMs: 2000,
    },
  });
  console.log(`✅ Scraper: ${mycimaConfig.siteName} (disabled)`);

  // ═══════════════════════════════════════════════════════════
  // 4. رابط وهمي للتجربة
  // ═══════════════════════════════════════════════════════════
  const testMovie = await prisma.movie.upsert({
    where: { slug: "test-movie-" + "demo123" },
    update: {},
    create: {
      title: "فيلم تجريبي",
      slug: "test-movie-" + "demo123",
      quality: "1080p",
      mediaType: "movie",
      site: "manual",
      isPublished: true,
      links: {
        create: [
          {
            serverName: "Server 1",
            linkType: "stream",
            quality: "1080p",
            url: "https://example.com/embed/test",
            isActive: true,
          },
          {
            serverName: "Download",
            linkType: "download",
            quality: "1080p",
            url: "https://example.com/download/test.mp4",
            size: "1.5 GB",
            isActive: true,
          },
        ],
      },
    },
  });
  console.log(`✅ Test Movie: ${testMovie.title} (${testMovie.links.length} links)`);

  console.log("\n🎉 Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
