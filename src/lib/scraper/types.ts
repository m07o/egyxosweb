// ============================================================
// CinemaPlus - Scraper Types
// TypeScript types for the scraping system
// ============================================================

// CSS Selectors configuration for a scraper
export interface CssSelectors {
  // List page selectors
  movieList?: string;        // Container for all movie items
  movieLink?: string;        // Anchor element for each movie
  movieTitle?: string;       // Title text within each item
  moviePoster?: string;      // Poster image src
  quality?: string;          // Quality badge (1080p, 720p, etc.)
  mediaType?: string;        // Type indicator (movie/series)
  movieYear?: string;        // Release year

  // Detail page selectors
  servers?: string;          // Server list items
  serverName?: string;       // Server display name
  serverLink?: string;       // Server embed URL
  downloadSection?: string;  // Download links section
  downloadItem?: string;     // Individual download item
  downloadLink?: string;     // Download URL
  downloadQuality?: string;  // Download quality label
  downloadSize?: string;     // File size text

  // Season/Episode selectors (for series)
  seasons?: string;          // Season container
  seasonNumber?: string;     // Season number/label
  episodes?: string;         // Episode list
  episodeNumber?: string;    // Episode number/label
  episodeLink?: string;      // Episode embed URL
}

// Scraped movie from list page
export interface ScrapedMovieItem {
  title: string;
  link: string;
  poster?: string;
  quality?: string;
  mediaType?: string;
  year?: string;
}

// Scraped server/link from detail page
export interface ScrapedLinkItem {
  serverName: string;
  url: string;
  quality?: string;
  linkType: "WATCH" | "DOWNLOAD";
  season?: number;
  episode?: number;
  size?: string;
}

// Scraper run options
export interface ScraperRunOptions {
  scraperId: string;
  mode?: "list" | "detail" | "search";
  query?: string;             // For search mode
  detailUrl?: string;         // For detail mode
  maxItems?: number;          // Limit items to scrape
}

// Scraper run result
export interface ScraperRunResult {
  status: "SUCCESS" | "FAILED" | "PARTIAL";
  message: string;
  itemsFound: number;
  itemsSaved: number;
  durationMs: number;
  errors?: string[];
  items?: ScrapedMovieItem[];
  links?: ScrapedLinkItem[];
}

// Selector test result
export interface SelectorTestResult {
  url: string;
  html: string;
  matchedCount: number;
  matches: Array<{
    selector: string;
    count: number;
    samples: string[];
  }>;
}
