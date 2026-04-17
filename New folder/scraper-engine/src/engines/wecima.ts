// ============================================================
// scraper-engine/src/engines/wecima.ts - سكرابر Wecima
// ============================================================
// يستخدم fetch API مع retry logic
// يوزع HTML باستخدام Regex (بدون DOMParser - يعمل في أي بيئة)
// ============================================================

import { isAdLink, cleanUrl, detectQuality } from "../adDetector.js";

export interface ScrapedMovie {
  title: string;
  url: string;
  imageUrl: string;
  quality: string;
  type: "movie" | "series" | "anime";
  servers: Array<{ name: string; url: string; quality: string }>;
  downloadLinks: Array<{ quality: string; url: string; size?: string }>;
}

export interface ScrapeResult {
  success: boolean;
  site: string;
  movies: ScrapedMovie[];
  totalLinks: number;
  errors: string[];
  durationMs: number;
}

const BASE_URL = "https://wecima.bar";
const MAX_RETRIES = 3;
const TIMEOUT_MS = 30000;
const DEFAULT_USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

async function fetchPage(url: string): Promise<string> {
  let lastError: Error | null = null;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          "User-Agent": DEFAULT_USER_AGENT,
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "ar,en-US;q=0.7,en;q=0.3",
          Referer: BASE_URL,
        },
      });
      clearTimeout(timeoutId);
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      return await response.text();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (attempt < MAX_RETRIES) {
        console.log(`  ⚠ Retry ${attempt}/${MAX_RETRIES} for ${url}`);
        await sleep(attempt * 1500);
      }
    }
  }
  throw new Error(`Failed after ${MAX_RETRIES} retries: ${lastError?.message}`);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function resolveUrl(url: string): string {
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (url.startsWith("//")) return "https:" + url;
  if (url.startsWith("/")) return BASE_URL + url;
  return BASE_URL + "/" + url;
}

function cleanText(text: string): string {
  return text.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

function extractAll(html: string, pattern: RegExp): string[] {
  const matches: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(html)) !== null) {
    matches.push(match[1] || match[0]);
  }
  return matches;
}

function parseContentBlocks(blocks: string[]): ScrapedMovie[] {
  const movies: ScrapedMovie[] = [];
  for (const block of blocks) {
    try {
      const linkMatch = block.match(/<a[^>]*href="([^"]*)"[^>]*>/);
      if (!linkMatch) continue;
      const url = cleanUrl(linkMatch[1]);
      if (!url || isAdLink(url)) continue;

      const titleMatch =
        block.match(/(?:post-title|entry-title|movie-title)[^>]*>([\s\S]*?)<\/\w+/) ||
        block.match(/alt="([^"]*)"/) ||
        block.match(/title="([^"]*)"/);
      const title = titleMatch ? cleanText(titleMatch[1]) : "عنوان غير معروف";

      const imageMatch =
        block.match(/<img[^>]*src="([^"]*)"/) ||
        block.match(/data-(?:src|lazy|bg)="([^"]*(?:jpe?g|png|webp)[^"]*)"/);
      const imageUrl = imageMatch ? resolveUrl(imageMatch[1]) : "";

      const qualityMatch =
        block.match(/(?:quality|badge)[^>]*>([^<]*)</i) ||
        block.match(/(1080[pP]|720[pP]|480[pP]|360[pP]|CAM|HD|SD)/);
      const quality = qualityMatch ? detectQuality(qualityMatch[1]) : "720p";

      const type: "movie" | "series" | "anime" = block.match(/مسلسل|سلسل|حلق/i)
        ? "series"
        : block.match(/أنمي|anime/i)
          ? "anime"
          : "movie";

      movies.push({ title, url: resolveUrl(url), imageUrl, quality, type, servers: [], downloadLinks: [] });
    } catch {
      // Skip malformed blocks
    }
  }
  return movies;
}

async function scrapeMovieDetails(movieUrl: string): Promise<ScrapedMovie> {
  const resolvedUrl = resolveUrl(movieUrl);
  const html = await fetchPage(resolvedUrl);

  const titleMatch = html.match(
    /<h1[^>]*class="[^"]*(?:entry-title|post-title|movie-title)[^"]*"[^>]*>([\s\S]*?)<\/h1>/i
  );
  const title = titleMatch ? cleanText(titleMatch[1]) : "Unknown";

  const imageMatch =
    html.match(/<img[^>]*(?:poster|image)[^>]*src="([^"]+)"/i) ||
    html.match(/<img[^>]*src="(https?:\/\/[^"]*(?:poster|thumb)[^"]*)"/i) ||
    html.match(/<meta[^>]*property="og:image"[^>]*content="([^"]+)"/i);
  const imageUrl = imageMatch ? resolveUrl(imageMatch[1]) : "";

  const servers: ScrapedMovie["servers"] = [];
  const serverPatterns = [
    /<iframe[^>]*src="([^"]*)"[^>]*>/gi,
    /<a[^>]*class="[^"]*(?:server|watch|play)[^"]*"[^>]*href="([^"]*)"[^>]*>/gi,
    /data-src="([^"]*(?:embed|player|server)[^"]*)"/gi,
    /src="(https?:\/\/[^"]*(?:embed|player|server|iframe)[^"]*)"/gi,
  ];
  for (const pattern of serverPatterns) {
    let m: RegExpExecArray | null;
    while ((m = pattern.exec(html)) !== null) {
      const url = cleanUrl(m[1]);
      if (url && !isAdLink(url)) {
        servers.push({ name: `Server ${servers.length + 1}`, url: resolveUrl(url), quality: detectQuality(m[0]) });
      }
    }
  }

  const downloadLinks: ScrapedMovie["downloadLinks"] = [];
  const dlPattern = /<a[^>]*(?:download|تحميل)[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi;
  let dlMatch: RegExpExecArray | null;
  while ((dlMatch = dlPattern.exec(html)) !== null) {
    const url = cleanUrl(dlMatch[1]);
    if (url && !isAdLink(url)) {
      const linkText = cleanText(dlMatch[2]);
      const sizeMatch = linkText.match(/(\d+\.?\d*\s*(?:GB|MB|KB))/i);
      downloadLinks.push({ quality: detectQuality(linkText), url: resolveUrl(url), size: sizeMatch ? sizeMatch[1] : undefined });
    }
  }

  const type: "movie" | "series" | "anime" = html.match(/أنمي|anime/i)
    ? "anime"
    : html.match(/مسلسل|حلق|موسم|season|episode/i) ? "series" : "movie";

  return {
    title, url: resolvedUrl, imageUrl,
    quality: servers[0]?.quality || downloadLinks[0]?.quality || "720p",
    type,
    servers: dedupServers(servers),
    downloadLinks: dedupDownloads(downloadLinks),
  };
}

function dedupServers(servers: ScrapedMovie["servers"]): ScrapedMovie["servers"] {
  const seen = new Set<string>();
  return servers.filter((s) => { if (seen.has(s.url)) return false; seen.add(s.url); return true; });
}
function dedupDownloads(links: ScrapedMovie["downloadLinks"]): ScrapedMovie["downloadLinks"] {
  const seen = new Set<string>();
  return links.filter((l) => { if (seen.has(l.url)) return false; seen.add(l.url); return true; });
}

// ═══════════════════════════════════════════════════════════
// الدوال العامة
// ═══════════════════════════════════════════════════════════

export async function scrapeWecimaMovies(page: number = 1, maxPages: number = 5): Promise<ScrapeResult> {
  const startTime = Date.now();
  const errors: string[] = [];
  const allMovies: ScrapedMovie[] = [];

  for (let p = page; p <= Math.min(page + maxPages - 1, 50); p++) {
    try {
      const url = p === 1 ? BASE_URL : `${BASE_URL}/page/${p}`;
      console.log(`  📄 Page ${p}: ${url}`);
      const html = await fetchPage(url);
      const articles = extractAll(html, /<article[^>]*>([\s\S]*?)<\/article>/gi);
      if (articles.length === 0) { console.log(`  ⚠ Empty page, stopping.`); break; }
      const movies = parseContentBlocks(articles);
      allMovies.push(...movies);
      console.log(`  ✅ Found ${movies.length} items`);
      if (movies.length < 5) { console.log(`  ⚠ Last page reached.`); break; }
      if (p < page + maxPages - 1) await sleep(2000);
    } catch (error) {
      errors.push(`Page ${p}: ${error instanceof Error ? error.message : String(error)}`);
      console.log(`  ❌ Page ${p} failed`);
    }
  }

  return {
    success: errors.length < allMovies.length / 2,
    site: "wecima",
    movies: allMovies,
    totalLinks: allMovies.reduce((acc, m) => acc + m.servers.length + m.downloadLinks.length, 0),
    errors,
    durationMs: Date.now() - startTime,
  };
}

export async function scrapeWecimaDetails(movieUrl: string): Promise<ScrapedMovie | null> {
  try { return await scrapeMovieDetails(movieUrl); }
  catch { return null; }
}

export async function searchWecima(query: string): Promise<ScrapeResult> {
  const startTime = Date.now();
  const errors: string[] = [];
  const movies: ScrapedMovie[] = [];
  try {
    console.log(`  🔍 Searching: ${query}`);
    const html = await fetchPage(`${BASE_URL}/?s=${encodeURIComponent(query)}`);
    movies.push(...parseContentBlocks(extractAll(html, /<article[^>]*>([\s\S]*?)<\/article>/gi)));
  } catch (error) {
    errors.push(`Search: ${error instanceof Error ? error.message : String(error)}`);
  }
  return { success: errors.length === 0 && movies.length > 0, site: "wecima", movies, totalLinks: 0, errors, durationMs: Date.now() - startTime };
}
