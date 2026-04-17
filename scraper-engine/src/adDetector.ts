// ============================================================
// scraper-engine/src/adDetector.ts - كشف الروابط الإعلانية
// ============================================================

const AD_PATTERNS = [
  /\badvertising\b/i,
  /\bsponsored\b/i,
  /\baffiliate\b/i,
  /\btracking\b/i,
  /doubleclick\.net/i,
  /googleads/i,
  /googlesyndication/i,
  /facebook\.com\/plugins/i,
  /ad\./i,
  /ads\./i,
  /popunder/i,
  /popup/i,
  /banner/i,
  /analytics/i,
  /pixel\./i,
];

const NON_CONTENT_PATTERNS = [
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

const TRACKING_PARAMS = [
  "utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term",
  "fbclid", "gclid", "ref", "referer", "source", "affiliate_id", "click_id",
];

/**
 * فحص هل الرابط إعلاني أم لا
 */
export function isAdLink(url: string): boolean {
  if (!url || url === "#" || url === "/" || url.startsWith("javascript:")) {
    return true;
  }
  for (const pattern of AD_PATTERNS) {
    if (pattern.test(url)) return true;
  }
  for (const pattern of NON_CONTENT_PATTERNS) {
    if (pattern.test(url)) return true;
  }
  if (url.length < 15 && !url.includes("http")) return true;
  return false;
}

/**
 * تنظيف الرابط من معاملات التتبع
 */
export function cleanUrl(url: string): string {
  if (!url) return "";
  let cleaned = url.trim();
  try {
    const urlObj = new URL(cleaned.startsWith("http") ? cleaned : "https://" + cleaned);
    TRACKING_PARAMS.forEach((param) => urlObj.searchParams.delete(param));
    cleaned = urlObj.toString();
    if (cleaned.length > 1 && cleaned.endsWith("/")) {
      cleaned = cleaned.slice(0, -1);
    }
  } catch {
    cleaned = cleaned.replace(/[?#].*$/, "");
  }
  return cleaned
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'");
}

/**
 * تحديد الجودة من النص
 */
export function detectQuality(text: string): string {
  if (/1080|bluray|full\s*hd/i.test(text)) return "1080p";
  if (/720|hd/i.test(text)) return "720p";
  if (/480|sd/i.test(text)) return "480p";
  if (/360|cam|ts|camrip/i.test(text)) return "360p";
  return "720p";
}

/**
 * إنشاء Slug من العنوان
 */
export function slugify(text: string): string {
  return text
    .replace(/[\s\W-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase()
    .slice(0, 200);
}
