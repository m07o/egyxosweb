import { ScrapeResult, ScrapedMovie } from "../engines/base";

/**
 * Generate a simple unique ID
 */
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

/**
 * Format file size from bytes to human-readable
 */
export function formatSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

/**
 * Estimate quality from file size
 */
export function estimateQualityFromSize(sizeStr?: string): string {
  if (!sizeStr) return "unknown";
  const sizeMatch = sizeStr.match(/(\d+\.?\d*)\s*(GB|MB)/i);
  if (!sizeMatch) return "unknown";
  const value = parseFloat(sizeMatch[1]);
  const unit = sizeMatch[2].toUpperCase();

  const sizeInMB = unit === "GB" ? value * 1024 : value;

  if (sizeInMB >= 2000) return "1080p";
  if (sizeInMB >= 800) return "720p";
  if (sizeInMB >= 400) return "480p";
  return "360p";
}

/**
 * Merge scrape results, avoiding duplicates by title
 */
export function mergeScrapeResults(
  ...results: ScrapeResult[]
): ScrapeResult {
  const allMovies: ScrapedMovie[] = [];
  const seenTitles = new Set<string>();
  const allErrors: string[] = [];
  let totalDuration = 0;

  for (const result of results) {
    totalDuration += result.duration;
    allErrors.push(...result.errors);

    for (const movie of result.movies) {
      const key = movie.title.toLowerCase().trim();
      if (!seenTitles.has(key)) {
        seenTitles.add(key);
        allMovies.push(movie);
      }
    }
  }

  return {
    success: allMovies.length > 0,
    site: "multiple",
    movies: allMovies,
    totalLinks: allMovies.reduce(
      (acc, m) => acc + m.servers.length + m.downloadLinks.length,
      0
    ),
    errors: allErrors,
    duration: totalDuration,
  };
}

/**
 * Filter movies by type
 */
export function filterByType(
  movies: ScrapedMovie[],
  type: "movie" | "series" | "anime"
): ScrapedMovie[] {
  return movies.filter((m) => m.type === type);
}

/**
 * Sort movies by quality (best first)
 */
export function sortByQuality(movies: ScrapedMovie[]): ScrapedMovie[] {
  const qualityOrder = ["1080p", "720p", "480p", "360p", "CAM"];
  return [...movies].sort(
    (a, b) =>
      qualityOrder.indexOf(a.quality) - qualityOrder.indexOf(b.quality)
  );
}
