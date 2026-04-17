import {
  BaseScraper,
  ScrapedMovie,
  ScrapeResult,
  ScrapedServer,
  ScrapedDownloadLink,
} from "./base";
import { isAdLink, cleanUrl } from "../utils/adDetector";

export class WecimaScraper extends BaseScraper {
  constructor() {
    super("wecima", "Wecima", "https://wecima.bar");
  }

  async scrapeMovies(
    page: number = 1,
    category?: string
  ): Promise<ScrapeResult> {
    const startTime = Date.now();
    const errors: string[] = [];
    const movies: ScrapedMovie[] = [];

    try {
      let url = this.baseUrl;
      if (category) {
        url = `${this.baseUrl}/category/${category}`;
      }
      if (page > 1) {
        url += `${url.includes("?") ? "&" : "?"}page=${page}`;
      }

      const html = await this.fetchPage(url);

      // Extract movie cards - look for post/article elements with links
      const articlePattern = /<article[^>]*>([\s\S]*?)<\/article>/gi;
      const articles = this.extractAll(html, articlePattern);

      if (articles.length === 0) {
        // Fallback: try div-based layout
        const divPattern =
          /<div[^>]*class="[^"]*(?:post|grid|item)[^"]*"[^>]*>([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>/gi;
        const divs = this.extractAll(html, divPattern);
        this.parseContentBlocks(divs, movies, errors);
      } else {
        this.parseContentBlocks(articles, movies, errors);
      }
    } catch (error) {
      errors.push(
        `Failed to scrape page: ${error instanceof Error ? error.message : String(error)}`
      );
    }

    return {
      success: errors.length === 0 && movies.length > 0,
      site: this.siteId,
      movies,
      totalLinks: movies.reduce(
        (acc, m) => acc + m.servers.length + m.downloadLinks.length,
        0
      ),
      errors,
      duration: Date.now() - startTime,
    };
  }

  async scrapeMovieDetails(movieUrl: string): Promise<ScrapedMovie> {
    const resolvedUrl = this.resolveUrl(movieUrl);
    const html = await this.fetchPage(resolvedUrl);

    // Extract title
    const titleMatch = html.match(
      /<h1[^>]*class="[^"]*(?:entry-title|post-title|movie-title)[^"]*"[^>]*>([\s\S]*?)<\/h1>/i
    );
    const title = titleMatch
      ? this.cleanText(titleMatch[1])
      : "Unknown Title";

    // Extract image
    const imageMatch = html.match(
      /<img[^>]*(?:poster|image)[^>]*src="([^"]+)"/i
    ) || html.match(/<img[^>]*src="(https?:\/\/[^"]*(?:poster|thumb)[^"]*)"/i) || html.match(/<meta[^>]*property="og:image"[^>]*content="([^"]+)"/i);
    const imageUrl = imageMatch
      ? this.resolveUrl(imageMatch[1])
      : "";

    // Extract servers (watch links)
    const servers: ScrapedServer[] = [];
    const serverPatterns = [
      /<iframe[^>]*src="([^"]*)"[^>]*>/gi,
      /<a[^>]*class="[^"]*(?:server|watch|play)[^"]*"[^>]*href="([^"]*)"[^>]*>/gi,
      /data-src="([^"]*(?:embed|player|server)[^"]*)"/gi,
      /src="(https?:\/\/[^"]*(?:embed|player|server|iframe)[^"]*)"/gi,
    ];

    for (const pattern of serverPatterns) {
      let match: RegExpExecArray | null;
      while ((match = pattern.exec(html)) !== null) {
        const url = cleanUrl(match[1]);
        if (url && !isAdLink(url)) {
          const quality = this.detectQuality(
            match[0] + (match.index > 0 ? html.substring(match.index - 50, match.index) : "")
          );
          servers.push({
            name: `Server ${servers.length + 1}`,
            url: this.resolveUrl(url),
            quality,
          });
        }
      }
    }

    // Extract download links
    const downloadLinks: ScrapedDownloadLink[] = [];
    const downloadPattern =
      /<a[^>]*(?:download|تحميل)[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi;
    let dlMatch: RegExpExecArray | null;
    while ((dlMatch = downloadPattern.exec(html)) !== null) {
      const url = cleanUrl(dlMatch[1]);
      if (url && !isAdLink(url)) {
        const linkText = this.cleanText(dlMatch[2]);
        const quality = this.detectQuality(linkText);
        const sizeMatch = linkText.match(
          /(\d+\.?\d*\s*(?:GB|MB|KB))/i
        );
        downloadLinks.push({
          quality,
          url: this.resolveUrl(url),
          size: sizeMatch ? sizeMatch[1] : undefined,
        });
      }
    }

    return {
      id: Buffer.from(movieUrl).toString("base64url").slice(0, 12),
      title,
      url: resolvedUrl,
      imageUrl,
      quality: servers[0]?.quality || downloadLinks[0]?.quality || "720p",
      site: this.siteId,
      type: this.detectContentType(html),
      servers: this.deduplicateServers(servers),
      downloadLinks: this.deduplicateDownloads(downloadLinks),
      scrapedAt: new Date().toISOString(),
    };
  }

  async searchMovies(query: string): Promise<ScrapeResult> {
    const startTime = Date.now();
    const errors: string[] = [];
    const movies: ScrapedMovie[] = [];

    try {
      const searchUrl = `${this.baseUrl}/?s=${encodeURIComponent(query)}`;
      const html = await this.fetchPage(searchUrl);

      const articlePattern = /<article[^>]*>([\s\S]*?)<\/article>/gi;
      const articles = this.extractAll(html, articlePattern);
      this.parseContentBlocks(articles, movies, errors);
    } catch (error) {
      errors.push(
        `Search failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }

    return {
      success: errors.length === 0 && movies.length > 0,
      site: this.siteId,
      movies,
      totalLinks: movies.reduce(
        (acc, m) => acc + m.servers.length + m.downloadLinks.length,
        0
      ),
      errors,
      duration: Date.now() - startTime,
    };
  }

  private parseContentBlocks(
    blocks: string[],
    movies: ScrapedMovie[],
    errors: string[]
  ): void {
    for (const block of blocks) {
      try {
        // Extract link
        const linkMatch = block.match(/<a[^>]*href="([^"]*)"[^>]*>/);
        if (!linkMatch) continue;

        const url = cleanUrl(linkMatch[1]);
        if (!url || isAdLink(url)) continue;

        // Extract title
        const titleMatch =
          block.match(
            /(?:post-title|entry-title|movie-title)[^>]*>([\s\S]*?)<\/\w+>/
          ) || block.match(/alt="([^"]*)"/) || block.match(/title="([^"]*)"/);
        const title = titleMatch
          ? this.cleanText(titleMatch[1])
          : "عنوان غير معروف";

        // Extract image
        const imageMatch =
          block.match(/<img[^>]*src="([^"]*)"/) ||
          block.match(
            /data-(?:src|lazy|bg)="([^"]*(?:jpe?g|png|webp)[^"]*)"/
          );
        const imageUrl = imageMatch
          ? this.resolveUrl(imageMatch[1])
          : "";

        // Extract quality
        const qualityMatch = block.match(
          /(?:quality|badge)[^>]*>([^<]*)</i
        ) || block.match(/(1080[pP]|720[pP]|480[pP]|360[pP]|CAM|HD|SD)/);
        const quality = qualityMatch
          ? this.detectQuality(qualityMatch[1])
          : "720p";

        // Detect content type
        const type = block.match(/مسلسل|سلسل|حلق/i)
          ? "series"
          : block.match(/أنمي|anime/i)
            ? "anime"
            : "movie";

        movies.push({
          id: Buffer.from(url).toString("base64url").slice(0, 12),
          title,
          url: this.resolveUrl(url),
          imageUrl,
          quality,
          site: this.siteId,
          type: type as ScrapedMovie["type"],
          servers: [],
          downloadLinks: [],
          scrapedAt: new Date().toISOString(),
        });
      } catch (error) {
        errors.push(
          `Failed to parse block: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    }
  }

  private detectContentType(html: string): "movie" | "series" | "anime" {
    if (/أنمي|anime/i.test(html)) return "anime";
    if (/مسلسل|حلق|موسم|season|episode/i.test(html)) return "series";
    return "movie";
  }

  private deduplicateServers(
    servers: ScrapedServer[]
  ): ScrapedServer[] {
    const seen = new Set<string>();
    return servers.filter((s) => {
      if (seen.has(s.url)) return false;
      seen.add(s.url);
      return true;
    });
  }

  private deduplicateDownloads(
    links: ScrapedDownloadLink[]
  ): ScrapedDownloadLink[] {
    const seen = new Set<string>();
    return links.filter((l) => {
      if (seen.has(l.url)) return false;
      seen.add(l.url);
      return true;
    });
  }
}
