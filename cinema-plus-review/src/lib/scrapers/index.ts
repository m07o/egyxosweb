import { SITES_CONFIG } from "./config/sites";
import { WecimaScraper } from "./engines/wecima";
import { BaseScraper, ScrapeResult, ScrapedMovie } from "./engines/base";

// Registry of all available scrapers
const scraperRegistry: Map<string, BaseScraper> = new Map();

// Initialize scrapers
function initScrapers() {
  for (const [siteId, config] of Object.entries(SITES_CONFIG)) {
    if (config.enabled) {
      switch (siteId) {
        case "wecima":
          scraperRegistry.set(siteId, new WecimaScraper());
          break;
        // Add more scrapers here as they are implemented
        default:
          break;
      }
    }
  }
}

// Auto-initialize
initScrapers();

/**
 * Get a specific scraper by site ID
 */
export function getScraper(siteId: string): BaseScraper | undefined {
  return scraperRegistry.get(siteId);
}

/**
 * Get all available scrapers
 */
export function getAllScrapers(): BaseScraper[] {
  return Array.from(scraperRegistry.values());
}

/**
 * Get all registered site IDs
 */
export function getAvailableSites(): string[] {
  return Array.from(scraperRegistry.keys());
}

/**
 * Run a specific scraper
 */
export async function runScraper(
  siteId: string,
  page?: number,
  category?: string
): Promise<ScrapeResult> {
  const scraper = scraperRegistry.get(siteId);
  if (!scraper) {
    return {
      success: false,
      site: siteId,
      movies: [],
      totalLinks: 0,
      errors: [`Scraper "${siteId}" not found or not enabled`],
      duration: 0,
    };
  }

  return scraper.scrapeMovies(page, category);
}

/**
 * Run all enabled scrapers
 */
export async function runAllScrapers(
  page?: number,
  category?: string
): Promise<ScrapeResult[]> {
  const results: ScrapeResult[] = [];

  for (const [siteId, scraper] of scraperRegistry) {
    try {
      const result = await scraper.scrapeMovies(page, category);
      results.push(result);
    } catch (error) {
      results.push({
        success: false,
        site: siteId,
        movies: [],
        totalLinks: 0,
        errors: [
          `Scraping failed: ${error instanceof Error ? error.message : String(error)}`,
        ],
        duration: 0,
      });
    }
  }

  return results;
}

/**
 * Search across all scrapers
 */
export async function searchAllScrapers(
  query: string
): Promise<ScrapeResult[]> {
  const results: ScrapeResult[] = [];

  for (const [siteId, scraper] of scraperRegistry) {
    try {
      const result = await scraper.searchMovies(query);
      results.push(result);
    } catch (error) {
      results.push({
        success: false,
        site: siteId,
        movies: [],
        totalLinks: 0,
        errors: [
          `Search failed: ${error instanceof Error ? error.message : String(error)}`,
        ],
        duration: 0,
      });
    }
  }

  return results;
}

/**
 * Scrape details for a specific movie
 */
export async function scrapeMovieDetails(
  siteId: string,
  movieUrl: string
): Promise<ScrapedMovie | null> {
  const scraper = scraperRegistry.get(siteId);
  if (!scraper) return null;

  try {
    return await scraper.scrapeMovieDetails(movieUrl);
  } catch {
    return null;
  }
}

export type { ScrapeResult, ScrapedMovie };
export { BaseScraper };
