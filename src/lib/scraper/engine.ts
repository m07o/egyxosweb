// ============================================================
// CinemaPlus - Scraper Engine
// Core scraping engine: HTTP fetch + Cheerio parse + DB save
// ============================================================

import * as cheerio from "cheerio";
import axios, { AxiosError } from "axios";
import { db } from "@/lib/db";
import { CssSelectors, ScrapedMovieItem, ScrapedLinkItem, ScraperRunResult } from "./types";
import {
  resolveUrl,
  normalizeQuality,
  normalizeMediaType,
  parseSeasonEpisode,
  selectorPresets,
} from "./selectors";

// User-Agent header for scraping
const SCRAPE_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

// Timeout for HTTP requests (30 seconds)
const SCRAPE_TIMEOUT = 30000;

/**
 * Fetch HTML content from a URL
 */
export async function fetchHtml(url: string): Promise<string> {
  const response = await axios.get(url, {
    headers: {
      "User-Agent": SCRAPE_UA,
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "ar,en-US;q=0.7,en;q=0.3",
      Referer: new URL(url).origin + "/",
    },
    timeout: SCRAPE_TIMEOUT,
    maxRedirects: 5,
    validateStatus: (status) => status < 400,
  });

  return response.data as string;
}

/**
 * Parse CSS selectors from JSON string with preset support
 */
export function parseSelectors(selectorJson: string): CssSelectors {
  const raw = JSON.parse(selectorJson || "{}");

  // If a preset is specified, merge it
  if (raw.preset && selectorPresets[raw.preset]) {
    const preset = selectorPresets[raw.preset].selectors;
    const custom = { ...raw };
    delete custom.preset;
    return { ...preset, ...custom };
  }

  return raw as CssSelectors;
}

/**
 * Scrape a movie list page and extract movie items
 */
export function scrapeMovieList(html: string, baseUrl: string, selectors: CssSelectors): ScrapedMovieItem[] {
  const $ = cheerio.load(html);
  const items: ScrapedMovieItem[] = [];

  if (!selectors.movieList) {
    return items;
  }

  $(selectors.movieList).each((_, element) => {
    const el = $(element);

    // Extract title
    let title = "";
    if (selectors.movieTitle) {
      title = el.find(selectors.movieTitle).first().text().trim();
    }
    if (!title) {
      title = el.text().trim().split("\n")[0].trim();
    }

    // Extract link
    let link = "";
    if (selectors.movieLink) {
      const linkEl = el.find(selectors.movieLink).first();
      link = linkEl.attr("href") || "";
    } else {
      const linkEl = el.find("a").first();
      link = linkEl.attr("href") || "";
    }
    link = resolveUrl(baseUrl, link);

    // Extract poster
    let poster: string | undefined;
    if (selectors.moviePoster) {
      const imgEl = el.find(selectors.moviePoster).first();
      poster = imgEl.attr("src") || imgEl.attr("data-src") || imgEl.attr("data-lazy-src") || undefined;
      if (poster) poster = resolveUrl(baseUrl, poster);
    }

    // Extract quality
    let quality: string | undefined;
    if (selectors.quality) {
      quality = el.find(selectors.quality).first().text().trim() || undefined;
    }

    // Extract media type
    let mediaType: string | undefined;
    if (selectors.mediaType) {
      mediaType = el.find(selectors.mediaType).first().text().trim() || undefined;
    }

    // Extract year
    let year: string | undefined;
    if (selectors.movieYear) {
      year = el.find(selectors.movieYear).first().text().trim() || undefined;
    }

    if (title && link) {
      items.push({ title, link, poster, quality, mediaType, year });
    }
  });

  return items;
}

/**
 * Scrape a movie detail page and extract streaming/download links
 */
export function scrapeDetailPage(html: string, baseUrl: string, selectors: CssSelectors): ScrapedLinkItem[] {
  const $ = cheerio.load(html);
  const links: ScrapedLinkItem[] = [];

  // Scrape watch servers
  if (selectors.servers) {
    $(selectors.servers).each((_, element) => {
      const el = $(element);

      let serverName = "سيرفر";
      if (selectors.serverName) {
        serverName = el.find(selectors.serverName).first().text().trim() || serverName;
      }

      let url = "";
      if (selectors.serverLink) {
        const linkEl = el.find(selectors.serverLink).first();
        url = linkEl.attr("href") || linkEl.attr("data-url") || "";
        // Also check for iframe src
        if (!url) {
          url = el.find("iframe").first().attr("src") || "";
        }
      }
      url = resolveUrl(baseUrl, url);

      let quality: string | undefined;
      if (selectors.serverLink) {
        const qualityEl = el.find(selectors.serverLink).first();
        quality = qualityEl.text().trim().match(/\d{3,4}p/i)?.[0] || undefined;
      }

      const se = parseSeasonEpisode(serverName + " " + (selectors.serverName ? el.find(selectors.serverName).text() : ""));

      if (url) {
        links.push({
          serverName,
          url,
          quality,
          linkType: "WATCH",
          season: se.season,
          episode: se.episode,
        });
      }
    });
  }

  // Scrape download links
  if (selectors.downloadSection) {
    $(selectors.downloadSection).each((_, sectionEl) => {
      const section = $(sectionEl);
      const items = selectors.downloadItem ? section.find(selectors.downloadItem) : section.find("a[href]");

      items.each((_, itemEl) => {
        const item = $(itemEl);

        let url = "";
        if (selectors.downloadLink) {
          url = item.find(selectors.downloadLink).first().attr("href") || "";
        }
        if (!url && item.is("a")) {
          url = item.attr("href") || "";
        }
        url = resolveUrl(baseUrl, url);

        let quality: string | undefined;
        if (selectors.downloadQuality) {
          quality = section.find(selectors.downloadQuality).first().text().trim() || undefined;
          if (!quality) {
            quality = item.find(selectors.downloadQuality).first().text().trim() || undefined;
          }
        }

        let size: string | undefined;
        if (selectors.downloadSize) {
          size = section.find(selectors.downloadSize).first().text().trim() || undefined;
          if (!size) {
            size = item.find(selectors.downloadSize).first().text().trim() || undefined;
          }
        }

        const se = parseSeasonEpisode(item.text());

        if (url) {
          links.push({
            serverName: "تحميل",
            url,
            quality,
            linkType: "DOWNLOAD",
            season: se.season,
            episode: se.episode,
            size,
          });
        }
      });
    });
  }

  // Also try direct server links on the page (no section wrapper)
  if (links.length === 0 && selectors.serverLink) {
    $(selectors.serverLink).each((_, element) => {
      const el = $(element);
      const url = el.attr("href") || el.attr("data-url") || "";
      if (url) {
        links.push({
          serverName: el.text().trim() || "سيرفر",
          url: resolveUrl(baseUrl, url),
          linkType: "WATCH",
        });
      }
    });
  }

  return links;
}

/**
 * Find or create a movie in the database based on scraped data
 */
async function findOrCreateMovie(
  item: ScrapedMovieItem,
  scraperName: string,
  maxItems?: number
): Promise<{ movieId: string | null; isNew: boolean }> {
  if (!item.title) return { movieId: null, isNew: false };

  // Try to find by exact title
  let movie = await db.movie.findFirst({
    where: {
      OR: [
        { title: item.title },
        { titleAr: item.title },
      ],
    },
  });

  if (movie) return { movieId: movie.id, isNew: false };

  // Create a new movie entry (without TMDB data - will be enriched later)
  const mediaType = item.mediaType ? normalizeMediaType(item.mediaType) : "MOVIE";

  movie = await db.movie.create({
    data: {
      tmdbId: 0, // Placeholder, will be updated by TMDB search later
      title: item.title,
      titleAr: item.title,
      overview: "",
      posterUrl: item.poster || null,
      mediaType,
      releaseDate: item.year || null,
      rating: 0,
      voteCount: 0,
      genres: "[]",
      seasonsCount: 0,
      status: "RELEASED",
    },
  });

  return { movieId: movie.id, isNew: true };
}

/**
 * Save scraped links to the database
 */
async function saveLinks(movieId: string, links: ScrapedLinkItem[], source: string): Promise<number> {
  let saved = 0;

  for (const link of links) {
    if (!link.url) continue;

    // Check if link already exists for this movie
    const existing = await db.link.findFirst({
      where: {
        movieId,
        url: link.url,
        serverName: link.serverName,
        linkType: link.linkType,
      },
    });

    if (existing) {
      // Update existing link status to active
      await db.link.update({
        where: { id: existing.id },
        data: { status: "ACTIVE" },
      });
      saved++;
      continue;
    }

    // Create new link
    await db.link.create({
      data: {
        movieId,
        serverName: link.serverName,
        url: link.url,
        quality: link.quality ? normalizeQuality(link.quality) : "1080p",
        linkType: link.linkType,
        status: "ACTIVE",
        season: link.season,
        episode: link.episode,
        size: link.size,
        source,
      },
    });
    saved++;
  }

  return saved;
}

/**
 * Execute a full scraper run: fetch → parse → save → log
 */
export async function executeScraper(
  scraperId: string,
  options?: { query?: string; detailUrl?: string; maxItems?: number }
): Promise<ScraperRunResult> {
  const startTime = Date.now();
  const errors: string[] = [];

  try {
    // 1. Get scraper config from DB
    const scraper = await db.scraperConfig.findUnique({
      where: { id: scraperId },
    });

    if (!scraper) {
      return {
        status: "FAILED",
        message: "السكريبر غير موجود",
        itemsFound: 0,
        itemsSaved: 0,
        durationMs: Date.now() - startTime,
        errors: ["Scraper not found"],
      };
    }

    const selectors = parseSelectors(scraper.cssSelectors);
    const baseUrl = scraper.targetUrl.replace(/\/+$/, "");
    let itemsFound = 0;
    let itemsSaved = 0;

    // 2. Determine scrape mode
    if (options?.detailUrl) {
      // DETAIL MODE: Scrape a specific page for links
      const html = await fetchHtml(options.detailUrl);
      const links = scrapeDetailPage(html, options.detailUrl, selectors);
      itemsFound = links.length;

      // Try to find existing movie with similar URL reference
      const existingLink = await db.link.findFirst({
        where: { url: options.detailUrl },
      });

      if (existingLink) {
        itemsSaved = await saveLinks(existingLink.movieId, links, scraper.name);
      } else {
        // Try to match by URL patterns
        errors.push("لم يتم العثور على فيلم مرتبط بهذه الصفحة");
      }

      return {
        status: itemsSaved > 0 ? "SUCCESS" : "PARTIAL",
        message: `تم العثور على ${itemsFound} رابط، حفظ ${itemsSaved}`,
        itemsFound,
        itemsSaved,
        durationMs: Date.now() - startTime,
        errors,
        links,
      };
    }

    if (options?.query && scraper.searchUrl) {
      // SEARCH MODE: Search for a specific movie
      const searchUrl = scraper.searchUrl.replace("{query}", encodeURIComponent(options.query));
      const html = await fetchHtml(searchUrl);
      const items = scrapeMovieList(html, baseUrl, selectors);
      itemsFound = items.length;

      // Limit items if specified
      const limitedItems = options.maxItems ? items.slice(0, options.maxItems) : items;

      for (const item of limitedItems) {
        const { movieId, isNew } = await findOrCreateMovie(item, scraper.name);
        if (movieId) {
          // Scrape detail page for links
          try {
            const detailHtml = await fetchHtml(item.link);
            const links = scrapeDetailPage(detailHtml, item.link, selectors);
            if (links.length > 0) {
              const saved = await saveLinks(movieId, links, scraper.name);
              itemsSaved += saved;
            }
          } catch (detailError) {
            errors.push(`خطأ في ${item.title}: ${(detailError as Error).message}`);
          }
        }
      }
    } else {
      // LIST MODE: Scrape the main listing page
      const html = await fetchHtml(baseUrl);
      const items = scrapeMovieList(html, baseUrl, selectors);
      itemsFound = items.length;

      // Limit items if specified
      const limitedItems = options?.maxItems ? items.slice(0, options.maxItems) : items;

      for (const item of limitedItems) {
        try {
          const { movieId } = await findOrCreateMovie(item, scraper.name);
          if (movieId) {
            // Optionally scrape detail page for links
            try {
              const detailHtml = await fetchHtml(item.link);
              const links = scrapeDetailPage(detailHtml, item.link, selectors);
              if (links.length > 0) {
                const saved = await saveLinks(movieId, links, scraper.name);
                itemsSaved += saved;
              }
            } catch {
              // Detail page scrape failed but movie was saved
            }
            itemsSaved++;
          }
        } catch (itemError) {
          errors.push(`خطأ في ${item.title}: ${(itemError as Error).message}`);
        }
      }
    }

    // 3. Update scraper stats
    const runStatus = itemsSaved > 0 ? "SUCCESS" : itemsFound > 0 ? "PARTIAL" : "FAILED";
    const duration = Date.now() - startTime;

    await db.scraperConfig.update({
      where: { id: scraperId },
      data: {
        lastRunAt: new Date(),
        successCount: { increment: runStatus === "SUCCESS" ? 1 : 0 },
        failCount: { increment: runStatus === "FAILED" ? 1 : 0 },
      },
    });

    // 4. Create log entry
    await db.scrapeLog.create({
      data: {
        scraperId,
        status: runStatus,
        message: runStatus === "SUCCESS"
          ? `تم بنجاح - ${itemsSaved} عنصر محفوظ من ${itemsFound}`
          : runStatus === "PARTIAL"
          ? `جزئي - ${itemsSaved} من ${itemsFound}`
          : errors.join("; ") || "لم يتم العثور على عناصر",
        itemsFound,
        itemsSaved,
        durationMs: duration,
      },
    });

    return {
      status: runStatus as "SUCCESS" | "FAILED" | "PARTIAL",
      message: runStatus === "SUCCESS"
        ? `تم بنجاح - ${itemsSaved} عنصر محفوظ من ${itemsFound}`
        : runStatus === "PARTIAL"
        ? `جزئي - ${itemsSaved} من ${itemsFound}`
        : "فشل - لم يتم العثور على عناصر",
      itemsFound,
      itemsSaved,
      durationMs: duration,
      errors,
    };

  } catch (error) {
    const duration = Date.now() - startTime;
    const message = (error instanceof AxiosError)
      ? `خطأ HTTP: ${error.response?.status} ${error.response?.statusText} - ${error.config?.url}`
      : `خطأ: ${(error as Error).message}`;

    // Update scraper fail count
    try {
      await db.scraperConfig.update({
        where: { id: scraperId },
        data: {
          lastRunAt: new Date(),
          failCount: { increment: 1 },
        },
      });

      await db.scrapeLog.create({
        data: {
          scraperId,
          status: "FAILED",
          message,
          itemsFound: 0,
          itemsSaved: 0,
          durationMs: duration,
        },
      });
    } catch {
      // DB error during logging - ignore
    }

    return {
      status: "FAILED",
      message,
      itemsFound: 0,
      itemsSaved: 0,
      durationMs: duration,
      errors: [message],
    };
  }
}

/**
 * Test CSS selectors against a URL (preview mode)
 */
export async function testSelectors(
  url: string,
  selectorJson: string
): Promise<{
  html: string;
  selectors: CssSelectors;
  matchedCount: number;
  samples: Array<{ selector: string; count: number; preview: string[] }>;
}> {
  const html = await fetchHtml(url);
  const $ = cheerio.load(html);
  const selectors = parseSelectors(selectorJson);
  const samples: Array<{ selector: string; count: number; preview: string[] }> = [];

  // Test each selector
  const testEntries: Array<[string, string | undefined]> = [
    ["movieList", selectors.movieList],
    ["movieTitle", selectors.movieTitle],
    ["movieLink", selectors.movieLink],
    ["servers", selectors.servers],
    ["downloadSection", selectors.downloadSection],
  ];

  for (const [name, selector] of testEntries) {
    if (!selector) continue;
    const count = $(selector).length;
    const preview: string[] = [];
    $(selector).slice(0, 3).each((_, el) => {
      preview.push($(el).text().trim().substring(0, 100));
    });
    samples.push({ selector: `${name}: ${selector}`, count, preview });
  }

  // Truncate HTML for preview (first 5000 chars)
  const truncatedHtml = html.substring(0, 5000) + (html.length > 5000 ? "..." : "");

  return {
    html: truncatedHtml,
    selectors,
    matchedCount: selectors.movieList ? $(selectors.movieList).length : 0,
    samples,
  };
}
