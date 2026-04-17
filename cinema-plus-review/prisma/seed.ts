import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create default admin account
  const admin = await prisma.admin.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      password: await hash("admin123", 12),
    },
  });

  console.log(`Admin created: ${admin.username} (admin/admin123)`);

  // Create default site settings
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
