// ============================================================
// CinemaPlus - Scraper Selectors Presets & Helpers
// Pre-defined selector templates for common Arabic streaming sites
// ============================================================

import { CssSelectors } from "./types";

// Common presets for popular Arabic streaming websites
export const selectorPresets: Record<string, { name: string; nameAr: string; selectors: CssSelectors }> = {
  // Generic Arabic streaming site structure
  generic: {
    name: "Generic Streaming",
    nameAr: "موقع عام",
    selectors: {
      movieList: ".movies-list .movie-item, .post-item, .content-item",
      movieLink: "a",
      movieTitle: "h2, h3, .title, .entry-title",
      moviePoster: "img",
      quality: ".quality, .badge-quality, [class*=quality]",
      mediaType: ".type, .category, [class*=type]",
      movieYear: ".year, .date, [class*=year]",
      servers: ".servers-list .server-item, .wp-playlist-item, [class*=server]",
      serverName: ".server-name, .name, strong",
      serverLink: "a, iframe",
      downloadSection: ".downloads, .download-section, [class*=download]",
      downloadItem: ".download-item, a[href*=download]",
      downloadLink: "a",
      downloadQuality: ".quality, [class*=quality]",
      downloadSize: ".size, [class*=size]",
    },
  },
  // MyCima-style site
  mycima: {
    name: "MyCima Style",
    nameAr: "نمط ماي سيما",
    selectors: {
      movieList: ".Grid--Waga .GridItem, .post-item",
      movieLink: "a",
      movieTitle: ".EntryTitle, h2",
      moviePoster: "img",
      quality: ".Badge, .quality-badge",
      mediaType: ".Label, .category-label",
      movieYear: ".Year",
      servers: ".List--Seasons--Episodes li, .ServerList li",
      serverName: ".ServerName, strong",
      serverLink: "a[data-url], a",
      downloadSection: ".Download--Section, .DownloadsList",
      downloadItem: ".Download--Item, li",
      downloadLink: "a",
      downloadQuality: ".Quality, .Badge",
      downloadSize: ".Size, .FileSize",
    },
  },
  // Cima4U-style site
  cima4u: {
    name: "Cima4U Style",
    nameAr: "نمط سيما فور يو",
    selectors: {
      movieList: ".movies-list .col-xl-2, .post-item",
      movieLink: "a",
      movieTitle: ".movie-title, h2",
      moviePoster: "img",
      quality: ".quality",
      servers: ".servers-list li, .wp-block-embed",
      serverName: ".server-name",
      serverLink: "a, iframe",
      downloadSection: ".download-section",
      downloadItem: ".download-item",
      downloadLink: "a",
      downloadQuality: ".quality",
      downloadSize: ".file-size",
    },
  },
};

/**
 * Extract attribute from an element using CSS selector
 */
export function getAttr(
  $root: cheerio.CheerioAPI,
  selector: string,
  attr: string,
  context?: cheerio.Cheerio<cheerio.Element>
): string | null {
  const el = context ? context.find(selector) : $root(selector);
  if (el.length === 0) return null;
  const val = el.first().attr(attr);
  return val || null;
}

/**
 * Extract text content from an element
 */
export function getText(
  $root: cheerio.CheerioAPI,
  selector: string,
  context?: cheerio.Cheerio<cheerio.Element>
): string {
  const el = context ? context.find(selector) : $root(selector);
  if (el.length === 0) return "";
  return el.first().text().trim();
}

/**
 * Extract all text items from multiple elements
 */
export function getAllText(
  $root: cheerio.CheerioAPI,
  selector: string,
  context?: cheerio.Cheerio<cheerio.Element>
): string[] {
  const els = context ? context.find(selector) : $root(selector);
  if (els.length === 0) return [];
  return els.map((_, el) => $root(el).text().trim()).get();
}

/**
 * Resolve a relative URL against a base URL
 */
export function resolveUrl(base: string, relative: string): string {
  if (!relative) return "";
  if (relative.startsWith("http://") || relative.startsWith("https://")) {
    return relative;
  }
  if (relative.startsWith("//")) {
    return `https:${relative}`;
  }
  try {
    const url = new URL(relative, base);
    return url.toString();
  } catch {
    return relative;
  }
}

/**
 * Normalize quality string to standard format
 */
export function normalizeQuality(raw: string): string {
  const q = raw.toLowerCase().trim();
  if (q.includes("4k") || q.includes("2160")) return "4K";
  if (q.includes("1080")) return "1080p";
  if (q.includes("720")) return "720p";
  if (q.includes("480")) return "480p";
  if (q.includes("360") || q.includes("240")) return "360p";
  if (q.includes("hd")) return "1080p";
  if (q.includes("sd")) return "480p";
  return "1080p"; // default
}

/**
 * Normalize media type string
 */
export function normalizeMediaType(raw: string): "MOVIE" | "SERIES" {
  const t = raw.toLowerCase().trim();
  if (t.includes("serial") || t.includes("series") || t.includes("مسلسل") || t.includes("موسم")) {
    return "SERIES";
  }
  return "MOVIE";
}

/**
 * Parse season/episode from text
 */
export function parseSeasonEpisode(text: string): { season?: number; episode?: number } {
  const seasonMatch = text.match(/(?:season|موسم|s)\s*(\d+)/i);
  const episodeMatch = text.match(/(?:episode|حلقة|ep)\s*(\d+)/i);

  return {
    season: seasonMatch ? parseInt(seasonMatch[1]) : undefined,
    episode: episodeMatch ? parseInt(episodeMatch[1]) : undefined,
  };
}
