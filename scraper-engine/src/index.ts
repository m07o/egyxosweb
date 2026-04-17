// ============================================================
// scraper-engine/src/index.ts - نقطة الدخول الرئيسية
// ============================================================
// يتصل بـ Supabase PostgreSQL ويقوم بـ Upsert للأفلام والروابط
// يمكن تشغيله يدوياً أو عبر Cron Job
//
// الاستخدام:
//   npm run scrape:wecima     # استخراج من Wecima
//   npm run scrape:all         # استخراج من كل المواقع
//   npm run scrape:once        # صفحة واحدة فقط (للتجربة)
// ============================================================

import { db } from "./db.js";
import { scrapeWecimaMovies, scrapeWecimaDetails, searchWecima } from "./engines/wecima.js";
import type { ScrapedMovie, ScrapeResult } from "./engines/wecima.js";
import { slugify } from "./adDetector.js";

// ═══════════════════════════════════════════════════════════
// Parse CLI arguments
// ═══════════════════════════════════════════════════════════
function parseArgs(): { site: string; pages: number; search?: string } {
  const args = process.argv.slice(2);
  let site = "wecima";
  let pages = 5;
  let search: string | undefined;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--site" && args[i + 1]) { site = args[++i]; }
    if (args[i] === "--pages" && args[i + 1]) { pages = parseInt(args[++i]) || 5; }
    if (args[i] === "--search" && args[i + 1]) { search = args[++i]; }
  }

  return { site, pages, search };
}

// ═══════════════════════════════════════════════════════════
// حفظ سجل العملية في قاعدة البيانات
// ═══════════════════════════════════════════════════════════
async function createLog(site: string): Promise<string> {
  const log = await db.scrapeLog.create({
    data: {
      site,
      status: "running",
      message: "بدأ استخراج المحتوى...",
    },
  });
  return log.id;
}

async function updateLog(
  logId: string,
  data: {
    status: string;
    pagesScraped?: number;
    moviesFound?: number;
    linksFound?: number;
    linksNew?: number;
    errorMessage?: string;
    durationMs?: number;
    finishedAt?: Date;
  }
) {
  await db.scrapeLog.update({ where: { id: logId }, data });
}

// ═══════════════════════════════════════════════════════════
// Upsert فيلم + روابطة في قاعدة البيانات
// ═══════════════════════════════════════════════════════════
async function saveMovieToDb(movie: ScrapedMovie): Promise<number> {
  const slug = slugify(movie.title) + "-" + Date.now().toString(36);

  // Upsert الفيلم (إذا وُجد بنفس عنوان الموقع، حدثه)
  const dbMovie = await db.movie.upsert({
    where: { slug },
    create: {
      title: movie.title,
      slug,
      posterUrl: movie.imageUrl || null,
      quality: movie.quality,
      mediaType: movie.type,
      site: "wecima",
      siteUrl: movie.url,
      isPublished: true,
      links: {
        create: [
          // روابط المشاهدة (Servers)
          ...movie.servers.map((s, i) => ({
            serverName: s.name,
            linkType: "stream",
            quality: s.quality,
            url: s.url,
            order: i,
          })),
          // روابط التحميل
          ...movie.downloadLinks.map((d, i) => ({
            serverName: `Download ${i + 1}`,
            linkType: "download",
            quality: d.quality,
            url: d.url,
            size: d.size || null,
            order: i,
          })),
        ],
      },
    },
    update: {
      posterUrl: movie.imageUrl || undefined,
      quality: movie.quality,
      siteUrl: movie.url,
      isPublished: true,
    },
  });

  // إذا الفيلم موجود مسبقاً، نضيف الروابط الجديدة فقط
  if (dbMovie) {
    const allNewLinks = [
      ...movie.servers.map((s, i) => ({
        movieId: dbMovie.id,
        serverName: s.name,
        linkType: "stream" as const,
        quality: s.quality,
        url: s.url,
        order: i,
      })),
      ...movie.downloadLinks.map((d, i) => ({
        movieId: dbMovie.id,
        serverName: `Download ${i + 1}`,
        linkType: "download" as const,
        quality: d.quality,
        url: d.url,
        size: d.size || null,
        order: i,
      })),
    ];

    let newLinksCount = 0;
    for (const linkData of allNewLinks) {
      // تحقق إذا الرابط موجود مسبقاً
      const existing = await db.link.findFirst({
        where: { movieId: dbMovie.id, url: linkData.url },
      });
      if (!existing) {
        await db.link.create({ data: linkData });
        newLinksCount++;
      }
    }
    return newLinksCount;
  }

  return movie.servers.length + movie.downloadLinks.length;
}

// ═══════════════════════════════════════════════════════════
// تشغيل السكرابر الكامل
// ═══════════════════════════════════════════════════════════
async function runFullScrape(site: string, maxPages: number) {
  console.log("═══════════════════════════════════════════════════");
  console.log(`🚀 EgyxosWeb Scraper Engine v1.0`);
  console.log(`📡 Target: ${site.toUpperCase()}`);
  console.log(`📄 Max Pages: ${maxPages}`);
  console.log(`⏰ Started: ${new Date().toISOString()}`);
  console.log("═══════════════════════════════════════════════════");

  const logId = await createLog(site);
  const startTime = Date.now();
  let totalMovies = 0;
  let totalLinks = 0;
  let totalNewLinks = 0;
  let totalErrors = 0;

  try {
    // الخطوة 1: استخراج قائمة الأفلام من الصفحات الرئيسية
    console.log("\n📡 Step 1: Scraping movie listings...");
    let result: ScrapeResult;

    if (site === "wecima" || site === "all") {
      result = await scrapeWecimaMovies(1, maxPages);
    } else {
      throw new Error(`Unknown site: ${site}`);
    }

    console.log(`\n📊 Listings Result:`);
    console.log(`   ✅ Movies found: ${result.movies.length}`);
    console.log(`   ✅ Total links: ${result.totalLinks}`);
    console.log(`   ❌ Errors: ${result.errors.length}`);
    if (result.errors.length > 0) {
      result.errors.forEach((e) => console.log(`      ⚠ ${e}`));
    }

    totalMovies = result.movies.length;

    // الخطوة 2: حفظ الأفلام في قاعدة البيانات
    console.log("\n💾 Step 2: Saving to database (Upsert)...");
    for (let i = 0; i < result.movies.length; i++) {
      const movie = result.movies[i];
      try {
        const newLinks = await saveMovieToDb(movie);
        totalLinks += movie.servers.length + movie.downloadLinks.length;
        totalNewLinks += newLinks;

        if ((i + 1) % 10 === 0 || i === result.movies.length - 1) {
          console.log(`   📦 Processed ${i + 1}/${result.movies.length} movies (${totalNewLinks} new links)`);
        }
      } catch (error) {
        totalErrors++;
        console.log(`   ❌ Failed to save "${movie.title}": ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    // الخطوة 3: تحديث سجل العملية
    const durationMs = Date.now() - startTime;
    await updateLog(logId, {
      status: "success",
      pagesScraped: maxPages,
      moviesFound: totalMovies,
      linksFound: totalLinks,
      linksNew: totalNewLinks,
      durationMs,
      finishedAt: new Date(),
      message: `تم بنجاح: ${totalMovies} فيلم، ${totalLinks} رابط (${totalNewLinks} جديد)`,
    });

    console.log("\n═══════════════════════════════════════════════════");
    console.log("✅ SCRAPE COMPLETED SUCCESSFULLY");
    console.log(`   📊 Movies: ${totalMovies}`);
    console.log(`   🔗 Total Links: ${totalLinks}`);
    console.log(`   🆕 New Links: ${totalNewLinks}`);
    console.log(`   ❌ Errors: ${totalErrors}`);
    console.log(`   ⏱ Duration: ${(durationMs / 1000).toFixed(1)}s`);
    console.log(`   📅 Finished: ${new Date().toISOString()}`);
    console.log("═══════════════════════════════════════════════════");

  } catch (error) {
    await updateLog(logId, {
      status: "error",
      errorMessage: error instanceof Error ? error.message : String(error),
      durationMs: Date.now() - startTime,
      finishedAt: new Date(),
    });
    console.error("\n❌ SCRAPE FAILED:", error instanceof Error ? error.message : String(error));
    process.exit(1);
  } finally {
    await db.$disconnect();
  }
}

// ═══════════════════════════════════════════════════════════
// تشغيل بحث
// ═══════════════════════════════════════════════════════════
async function runSearch(query: string) {
  console.log(`\n🔍 Searching for: "${query}"`);
  const result = await searchWecima(query);
  console.log(`Found ${result.movies.length} results`);
  for (const movie of result.movies) {
    console.log(`  - ${movie.title} (${movie.type}) [${movie.quality}]`);
  }
}

// ═══════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════
async function main() {
  const { site, pages, search } = parseArgs();

  try {
    // اختبار الاتصال بقاعدة البيانات
    await db.$connect();
    console.log("✅ Connected to Supabase PostgreSQL");

    if (search) {
      await runSearch(search);
    } else {
      await runFullScrape(site, pages);
    }
  } catch (error) {
    console.error("❌ Fatal error:", error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

main();
