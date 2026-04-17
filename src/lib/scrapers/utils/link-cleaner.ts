const AD_PATTERNS = [
  /doubleclick\.net/i, /googleads/i, /googlesyndication/i,
  /facebook\.com\/plugins/i, /adnxs\.com/i, /adsrvr\.org/i,
  /ads\.php/i, /ad\.php/i, /popup/i, /popunder/i, /clickunder/i,
  /pixel\.php/i, /track\.php/i, /analytics/i, /counter\.php/i,
  /api\.facebook/i, /platform\.twitter/i, /connect\.facebook/i,
  /ouo\.io/i, /shrink\.me/i, /short\.ee/i, /link-to\.net/i,
  /go\.php/i, /redirect\.php/i,
]

export function isAdLink(url: string): boolean {
  return AD_PATTERNS.some(pattern => pattern.test(url))
}

export function cleanUrl(url: string): string {
  try {
    const parsed = new URL(url)
    const adParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'ref', 'fbclid', 'gclid']
    adParams.forEach(param => parsed.searchParams.delete(param))
    return parsed.toString().split('#')[0]
  } catch {
    return url
  }
}

export function extractQuality(text: string): string {
  if (!text) return ''
  const patterns = [/4K/i, /1080[pP]/, /720[pP]/, /480[pP]/, /360[pP]/, /HD/i, /FHD/i, /BluRay/i, /WEB-?DL/i, /CAM/i, /HDRip/i, /DVDRip/i]
  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match) return match[0].toUpperCase()
  }
  return ''
}

export function extractEpisodeInfo(title: string): string | undefined {
  const patterns = [
    /(?:الموسم|موسم)\s*(\d+)\s*(?:الحلقة|حلقة)\s*(\d+)/i,
    /(?:الحلقة|حلقة)\s*(\d+)/i,
    /S(\d+)E(\d+)/i,
  ]
  for (const pattern of patterns) {
    const match = title.match(pattern)
    if (match) {
      if (match[1] && match[2]) return `الموسم ${match[1]} الحلقة ${match[2]}`
      return `الحلقة ${match[1]}`
    }
  }
  return undefined
}
