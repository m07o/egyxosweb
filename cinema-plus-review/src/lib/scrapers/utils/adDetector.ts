import { AD_PATTERNS } from "../config/sites";

/**
 * Check if a URL is an advertisement/tracking link
 */
export function isAdLink(url: string): boolean {
  if (!url || url === "#" || url === "/" || url.startsWith("javascript:")) {
    return true;
  }

  // Check against known ad patterns
  for (const pattern of AD_PATTERNS) {
    if (pattern.test(url)) {
      return true;
    }
  }

  // Check for very short URLs that are likely navigational, not content
  if (url.length < 15 && !url.includes("http")) {
    return true;
  }

  // Check for common non-content URL patterns
  const nonContentPatterns = [
    /^mailto:/i,
    /^tel:/i,
    /^#/,
    /^\/\//,
    /\/login/i,
    /\/register/i,
    /\/contact/i,
    /\/about/i,
    /\/privacy/i,
    /\/terms/i,
    /\/wp-/i,
    /\/feed/i,
    /\/xmlrpc/i,
    /\/sitemap/i,
    /\/tag\//i,
    /\/page\//i,
  ];

  for (const pattern of nonContentPatterns) {
    if (pattern.test(url)) {
      return true;
    }
  }

  return false;
}

/**
 * Clean a URL by removing tracking parameters, referrers, etc.
 */
export function cleanUrl(url: string): string {
  if (!url) return "";

  let cleaned = url.trim();

  // Remove URL tracking parameters
  const trackingParams = [
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_content",
    "utm_term",
    "fbclid",
    "gclid",
    "ref",
    "referer",
    "source",
    "affiliate_id",
    "click_id",
  ];

  try {
    const urlObj = new URL(cleaned.startsWith("http") ? cleaned : "https://" + cleaned);
    trackingParams.forEach((param) => {
      urlObj.searchParams.delete(param);
    });
    cleaned = urlObj.toString();

    // Remove trailing slash if not root
    if (cleaned.length > 1 && cleaned.endsWith("/")) {
      cleaned = cleaned.slice(0, -1);
    }
  } catch {
    // If URL parsing fails, return as-is after basic cleanup
    cleaned = cleaned.replace(/[?#].*$/, "");
  }

  // Decode HTML entities
  cleaned = cleaned
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'");

  return cleaned;
}

/**
 * Extract domain from URL
 */
export function getDomain(url: string): string {
  try {
    const urlObj = new URL(url.startsWith("http") ? url : "https://" + url);
    return urlObj.hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

/**
 * Check if URL points to a streaming/embed service
 */
export function isStreamUrl(url: string): boolean {
  const streamHosts = [
    "vidsrc",
    "embed",
    "player",
    "stream",
    "video",
    "watch",
    "dood",
    "vidoza",
    "upstream",
    "mixdrop",
    "streamtape",
    "voe",
    "streamsb",
    "filemoon",
    "wolfstream",
    "gounlimited",
    "uqload",
    "mega",
    "youtube",
    "vimeo",
    "dailymotion",
  ];

  const lower = url.toLowerCase();
  return streamHosts.some((host) => lower.includes(host));
}
