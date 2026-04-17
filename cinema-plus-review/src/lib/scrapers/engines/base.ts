export interface ScrapedMovie {
  id: string;
  title: string;
  url: string;
  imageUrl: string;
  quality: string;
  site: string;
  type: "movie" | "series" | "anime";
  servers: ScrapedServer[];
  downloadLinks: ScrapedDownloadLink[];
  scrapedAt: string;
}

export interface ScrapedServer {
  name: string;
  url: string;
  quality: string;
}

export interface ScrapedDownloadLink {
  quality: string;
  url: string;
  size?: string;
}

export interface ScrapeResult {
  success: boolean;
  site: string;
  movies: ScrapedMovie[];
  totalLinks: number;
  errors: string[];
  duration: number;
}

/**
 * BaseScraper - Abstract class that all scrapers must extend.
 * Provides common functionality and defines the interface.
 */
export abstract class BaseScraper {
  protected siteId: string;
  protected siteName: string;
  protected baseUrl: string;
  protected maxRetries: number = 3;
  protected timeout: number = 15000;

  constructor(siteId: string, siteName: string, baseUrl: string) {
    this.siteId = siteId;
    this.siteName = siteName;
    this.baseUrl = baseUrl;
  }

  /**
   * Fetch page HTML with retry logic
   */
  protected async fetchPage(url: string): Promise<string> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(
          () => controller.abort(),
          this.timeout
        );

        const response = await fetch(url, {
          signal: controller.signal,
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "ar,en-US;q=0.7,en;q=0.3",
            Referer: this.baseUrl,
          },
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return await response.text();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        // Wait before retry
        if (attempt < this.maxRetries) {
          await new Promise((resolve) =>
            setTimeout(resolve, attempt * 1000)
          );
        }
      }
    }

    throw new Error(
      `Failed to fetch ${url} after ${this.maxRetries} attempts: ${lastError?.message}`
    );
  }

  /**
   * Parse HTML string using simple regex-based parsing
   * (No DOMParser needed for server-side)
   */
  protected extractAll(html: string, pattern: RegExp): string[] {
    const matches: string[] = [];
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(html)) !== null) {
      matches.push(match[1] || match[0]);
    }
    return matches;
  }

  /**
   * Extract first match from HTML
   */
  protected extractFirst(html: string, pattern: RegExp): string | null {
    const match = pattern.exec(html);
    return match ? (match[1] || match[0]) : null;
  }

  /**
   * Resolve relative URLs to absolute URLs
   */
  protected resolveUrl(url: string): string {
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }
    if (url.startsWith("//")) {
      return "https:" + url;
    }
    if (url.startsWith("/")) {
      return this.baseUrl + url;
    }
    return this.baseUrl + "/" + url;
  }

  /**
   * Clean text (remove extra whitespace, HTML tags, etc.)
   */
  protected cleanText(text: string): string {
    return text
      .replace(/<[^>]*>/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  /**
   * Detect quality from text
   */
  protected detectQuality(text: string): string {
    if (/1080|bluray|full\s*hd/i.test(text)) return "1080p";
    if (/720|hd/i.test(text)) return "720p";
    if (/480|sd/i.test(text)) return "480p";
    if (/360|cam|ts|camrip/i.test(text)) return "360p";
    return "720p";
  }

  /**
   * Abstract: Get list of movies from main page or category
   */
  abstract scrapeMovies(
    page?: number,
    category?: string
  ): Promise<ScrapeResult>;

  /**
   * Abstract: Get servers and download links for a specific movie
   */
  abstract scrapeMovieDetails(movieUrl: string): Promise<ScrapedMovie>;

  /**
   * Abstract: Search for movies
   */
  abstract searchMovies(query: string): Promise<ScrapeResult>;
}
