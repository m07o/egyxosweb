// ============================================================
// prisma/seed-series.ts — Seed TV Series Data
// بيانات 10 مسلسلات شائعة
// ============================================================
// الاستخدام:
//   npx tsx prisma/seed-series.ts
// ============================================================

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

const series = [
  {
    id: "tmdb-1396",
    title: "مسلسل Breaking Bad",
    originalTitle: "Breaking Bad",
    slug: "breaking-bad-2008",
    overview: "والتر وايت مدرس كيمياء في المدرسة الثانوية يُشخّص بسرطان الرئة. لضمان مستقبل عائلته المالي بعد وفاته، يتحالف مع جيسي بينكمان تلميذه السابق لتصنيع وبيع الميثامفيتامين عالي الجودة. يتحول والتر تدريجياً من رجل عادي إلى بارون مخدرات يُعرف باسم هايزنبرغ.",
    posterUrl: "https://a.ltrbxd.com/resized/film-poster/6/0/5/2/4/60524-breaking-bad-season-5-0-500-0-750-crop.jpg",
    backdropUrl: "",
    releaseYear: 2008,
    rating: 9.5,
  },
  {
    id: "tmdb-1399",
    title: "صراع العروش",
    originalTitle: "Game of Thrones",
    slug: "game-of-thrones-2011",
    overview: "في قارة ويستيروس الخيالية، تقاتل عائلات نبيلة من أجل السيطرة على عرش الممالك السبع. بينما يهدد خطر قديم من وراء جدار الشمال. تتشابك خيوط السياسة والخيانة والحب والحرب في ملحمة ملحمية.",
    posterUrl: "https://a.ltrbxd.com/resized/film-poster/1/0/1/3/8/10138-game-of-thrones-0-500-0-750-crop.jpg",
    backdropUrl: "",
    releaseYear: 2011,
    rating: 9.2,
  },
  {
    id: "tmdb-66732",
    title: "أشياء غريبة",
    originalTitle: "Stranger Things",
    slug: "stranger-things-2016",
    overview: "في بلدة هوكينز الصغيرة عام 1983، يختفي ويل بايرز في ظروف غامضة. تكشف أصدقاؤه عن وجود فتاة ذات قدرات خارقة تُدعى إلفين. معاً يواجهون كائنات من بُعد آخر يحاول غزو العالم.",
    posterUrl: "https://a.ltrbxd.com/resized/film-poster/2/5/6/8/4/3/256843-stranger-things-0-500-0-750-crop.jpg",
    backdropUrl: "",
    releaseYear: 2016,
    rating: 8.7,
  },
  {
    id: "tmdb-100088",
    title: "آخرنا",
    originalTitle: "The Last of Us",
    slug: "the-last-of-us-2023",
    overview: "بعد عشرين عاماً من تدمير الحضارة البشرية بسبب عدوى فطرية، يُكلف جويل وهو مهرب قاسٍ بنقل إيلي وهي فتاة مراهقة من منطقة أمنية خاضعة لسيطرة عسكرية. قد تكون إيلي المفتاح لعلاج المرض.",
    posterUrl: "https://a.ltrbxd.com/resized/film-poster/8/5/9/4/1/0/859410-the-last-of-us-0-500-0-750-crop.jpg",
    backdropUrl: "",
    releaseYear: 2023,
    rating: 8.8,
  },
  {
    id: "tmdb-119051",
    title: "وينزداي",
    originalTitle: "Wednesday",
    slug: "wednesday-2022",
    overview: "وينزداي آدامز تدخل أكاديمية نيفيرمور وهي مدرسة ثانوية للوحوش. تحاول وينزداي حل غمض قتل يعود 25 عاماً أثناء مواجهتها مع علاقاتها الجديدة وقدراتها النفسية الخارقة.",
    posterUrl: "https://a.ltrbxd.com/resized/film-poster/8/7/6/3/2/3/876323-wednesday-0-500-0-750-crop.jpg",
    backdropUrl: "",
    releaseYear: 2022,
    rating: 8.1,
  },
  {
    id: "tmdb-71912",
    title: "الويتشر",
    originalTitle: "The Witcher",
    slug: "the-witcher-2019",
    overview: "جيرالت من ريڤيا صياد وحوش متجول في عالم خيالي حيث يعيش البشر والأقزام والجان والأضرار معاً. يبحث عن مصيره بينما يجد نفسه مرتبطاً بالساحرة يينيفر والأميرة سيري.",
    posterUrl: "https://a.ltrbxd.com/resized/film-poster/5/6/4/4/3/2/564432-the-witcher-0-500-0-750-crop.jpg",
    backdropUrl: "",
    releaseYear: 2019,
    rating: 8.0,
  },
  {
    id: "tmdb-60574",
    title: "ذبيان بليندرز",
    originalTitle: "Peaky Blinders",
    slug: "peaky-blinders-2013",
    overview: "توماس شيلبي زعيم عائلة شيلبي الإجرامية في برمنغهام بعد الحرب العالمية الأولى. يخطط لتوسيع إمبراطوريته غير القانونية في لندن وما وراءها بينما يتعامل مع الشرطة والمنافسين.",
    posterUrl: "https://a.ltrbxd.com/resized/film-poster/2/1/8/9/4/6/218946-peaky-blinders-0-500-0-750-crop.jpg",
    backdropUrl: "",
    releaseYear: 2013,
    rating: 8.8,
  },
  {
    id: "tmdb-70523",
    title: "دارك",
    originalTitle: "Dark",
    slug: "dark-2017",
    overview: "في بلدة ويندن الألمانية الصغيرة، يختفي طفل ويكشف عن لغز يربط بين أربع عائلات على مدى ثلاثة أجيال. يتضمن المسلسل رحلات عبر الزمن وتفاصيل معقدة حول القدر والسبب والنتيجة.",
    posterUrl: "https://a.ltrbxd.com/resized/film-poster/3/5/8/8/5/3/358853-dark-0-500-0-750-crop.jpg",
    backdropUrl: "",
    releaseYear: 2017,
    rating: 8.8,
  },
  {
    id: "tmdb-71446",
    title: "الجريمة الإسبانية",
    originalTitle: "Money Heist / La Casa de Papel",
    slug: "money-heist-2017",
    overview: "رجل غامض يُعرف باسم البروفيسور يجمع ثمانية لصوص لتنفيذ أكبر سرقة في تاريخ إسبانيا. يستولون على دار سك العملة الملكية الإسبانية بينما يحتجزون رهائن ويطبعون المليارات.",
    posterUrl: "https://a.ltrbxd.com/resized/film-poster/2/8/6/8/4/5/286845-money-heist-0-500-0-750-crop.jpg",
    backdropUrl: "",
    releaseYear: 2017,
    rating: 8.2,
  },
  {
    id: "tmdb-93405",
    title: "لعبة الحبار",
    originalTitle: "Squid Game / 오징어 게임",
    slug: "squid-game-2021",
    overview: "سيونغ جي هون رجل مديون بديون ضخمة يوافق على المشاركة في سلسلة ألعاب أطفال يتنافس فيها للفوز بجائزة مالية ضخمة. لكن الخاسرين يدفعون الثمن بحياتهم.",
    posterUrl: "https://a.ltrbxd.com/resized/film-poster/8/5/7/8/4/8/857848-squid-game-0-500-0-750-crop.jpg",
    backdropUrl: "",
    releaseYear: 2021,
    rating: 8.0,
  },
];

async function main() {
  console.log("📺 بدء زراعة بيانات المسلسلات...");
  console.log(`📦 عدد المسلسلات: ${series.length}`);

  // Delete existing series to avoid duplicates
  const deleteResult = await prisma.movie.deleteMany({
    where: { mediaType: "series" },
  });
  console.log(`🗑️ تم حذف ${deleteResult.count} مسلسل قديم`);

  // Seed all series
  let created = 0;
  for (const s of series) {
    const tmdbIdStr = s.id.replace("tmdb-", "");
    const tmdbIdNum = parseInt(tmdbIdStr, 10);

    await prisma.movie.create({
      data: {
        id: s.id,
        title: s.title,
        originalTitle: s.originalTitle,
        slug: s.slug,
        overview: s.overview,
        posterUrl: s.posterUrl,
        backdropUrl: s.backdropUrl || null,
        releaseYear: s.releaseYear,
        quality: "1080p",
        rating: s.rating,
        mediaType: "series",
        site: "tmdb",
        siteUrl: `https://www.themoviedb.org/tv/${tmdbIdNum}`,
        isPublished: true,
      },
    });
    created++;
  }

  console.log(`✅ تم إنشاء ${created} مسلسل بنجاح!`);

  // Verify
  const totalSeries = await prisma.movie.count({
    where: { mediaType: "series", isPublished: true },
  });
  console.log(`📊 إجمالي المسلسلات المنشورة: ${totalSeries}`);

  // Show sample
  const sample = await prisma.movie.findMany({
    where: { mediaType: "series" },
    take: 5,
    orderBy: { rating: "desc" },
  });
  console.log("\n🔝 أعلى 5 مسلسلات تقييماً:");
  for (const s of sample) {
    console.log(`   ⭐ ${s.rating.toFixed(1)} - ${s.title} (${s.releaseYear})`);
  }

  // Total count
  const totalMovies = await prisma.movie.count({
    where: { isPublished: true },
  });
  console.log(`\n📊 إجمالي المحتوى المنشور (أفلام + مسلسلات): ${totalMovies}`);
}

main()
  .catch((e) => {
    console.error("❌ فشلت عملية الزراعة:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
