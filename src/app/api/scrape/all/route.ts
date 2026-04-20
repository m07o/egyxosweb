import { NextResponse } from "next/server";
import { runAllScrapers } from "@/lib/scrapers";
import { db } from "@/lib/db";
import type { ScrapedItem } from "@/lib/scrapers/engines/base-scraper";

export async function POST() {
  try {
    // Run all scrapers in parallel
    const bySite = await runAllScrapers();

    // Combine all results
    const allItems: ScrapedItem[] = [];
    for (const [site, result] of Object.entries(bySite)) {
      if (result.success && result.items.length > 0) {
        allItems.push(...result.items);
      }
    }

    // Save results to database (Movie + Link models)
    let savedCount = 0;
    try {
      for (const item of allItems) {
        // Generate a unique slug from title + site
        const slug = `${item.site}-${item.title
          .replace(/\s+/g, "-")
          .replace(/[^a-zA-Z0-9\u0621-\u064A-]/g, "")
          .slice(0, 80)}-${Date.now().toString(36)}`;

        // Parse episode info if available
        let season: number | null = null;
        let episode: number | null = null;
        if (item.episodeInfo) {
          const epMatch = item.episodeInfo.match(/(\d+)/g);
          if (epMatch) {
            if (epMatch.length >= 2) {
              season = parseInt(epMatch[0], 10);
              episode = parseInt(epMatch[1], 10);
            } else if (epMatch.length === 1) {
              episode = parseInt(epMatch[0], 10);
            }
          }
        }

        // Determine mediaType
        const mediaType = item.contentType === "series"
          ? "series"
          : item.contentType === "anime"
            ? "anime"
            : "movie";

        // Upsert Movie record
        const movie = await db.movie.upsert({
          where: { slug },
          create: {
            title: item.title,
            slug,
            overview: "",
            posterUrl: item.imageUrl || null,
            quality: item.quality || "720p",
            rating: 0,
            mediaType,
            site: item.site,
            siteUrl: item.url,
            isPublished: true,
            links: {
              create: {
                serverName: item.siteName || item.site,
                linkType: item.linkType === "download" ? "download" : "stream",
                quality: item.quality || "720p",
                url: item.url,
                season,
                episode,
                isActive: true,
                language: "ar",
              },
            },
          },
          update: {
            isPublished: true,
            updatedAt: new Date(),
          },
        });

        // If movie existed, create link if not duplicate
        if (movie) {
          const existingLink = await db.link.findFirst({
            where: {
              movieId: movie.id,
              url: item.url,
            },
          });

          if (!existingLink) {
            await db.link.create({
              data: {
                movieId: movie.id,
                serverName: item.siteName || item.site,
                linkType: item.linkType === "download" ? "download" : "stream",
                quality: item.quality || "720p",
                url: item.url,
                season,
                episode,
                isActive: true,
                language: "ar",
              },
            });
          }
        }

        savedCount++;
      }
    } catch (dbError: unknown) {
      const err = dbError as { message?: string };
      console.error("[API /scrape/all] DB save error:", err.message);
    }

    // Log the scrape run
    try {
      const totalLinks = allItems.length;
      const successSites = Object.entries(bySite)
        .filter(([, r]) => r.success)
        .map(([site]) => site);

      for (const site of successSites) {
        await db.scrapeLog.create({
          data: {
            site,
            status: "success",
            linksFound: totalLinks,
            linksNew: savedCount,
            durationMs: bySite[site].duration || 0,
            pagesScraped: 1,
            moviesFound: bySite[site].filtered || 0,
          },
        });
      }

      const failedSites = Object.entries(bySite).filter(
        ([, r]) => !r.success
      );
      for (const [site, result] of failedSites) {
        await db.scrapeLog.create({
          data: {
            site,
            status: "error",
            errorMessage: result.error || "Unknown error",
            durationMs: result.duration || 0,
            pagesScraped: 0,
          },
        });
      }
    } catch (logError) {
      console.error("[API /scrape/all] Log save failed:", logError);
    }

    return NextResponse.json({
      results: allItems,
      total: allItems.length,
      savedCount,
      bySite: Object.fromEntries(
        Object.entries(bySite).map(([site, result]) => [
          site,
          {
            success: result.success,
            items: result.items,
            totalFound: result.totalFound,
            filtered: result.filtered,
            duration: result.duration,
            error: result.error || null,
          },
        ])
      ),
    });
  } catch (error: unknown) {
    const err = error as { message?: string };
    console.error("[API /scrape/all] Error:", err.message);
    return NextResponse.json(
      { error: "Scraper run failed" },
      { status: 500 }
    );
  }
}
