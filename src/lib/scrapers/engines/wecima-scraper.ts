import * as cheerio from 'cheerio'
import { BaseScraper, type RawItem } from './base-scraper'
import { getSiteConfig } from '../config/sites'

export class WecimaScraper extends BaseScraper {
  constructor() {
    super(getSiteConfig('wecima')!)
  }

  protected getScrapeUrl(): string {
    return this.config.baseUrl
  }

  protected parsePage($: cheerio.CheerioAPI): RawItem[] {
    const items: RawItem[] = []
    const seen = new Set<string>()

    $('.GridItem').each(function (this: cheerio.Element) {
      const el = $(this)
      const a = el.find('a').first()
      const href = a.attr('href') || ''

      // Title from <strong> tag (the real Arabic title)
      const title = a.find('strong').text().trim()

      // Image from CSS custom property data-lazy-style
      let image = ''
      const bgSpan = a.find('.BG--GridItem').first()
      const lazyStyle = bgSpan.attr('data-lazy-style') || ''
      const imgMatch = lazyStyle.match(/url\(([^)]+)\)/)
      if (imgMatch) image = imgMatch[1]

      // Fallback: try img tags
      if (!image) {
        const img = a.find('img').first()
        image = img.attr('data-src') || img.attr('src') || ''
      }

      // Quality
      const quality = title.match(/(4K|1080p|720p|480p|BluRay|WEB-DL|WEBRip|HDRip)/i)?.[1] || ''

      if (title && href && !seen.has(href)) {
        seen.add(href)
        items.push({
          title,
          url: href.startsWith('http') ? href : 'https://wecima.bar' + href,
          quality,
          imageUrl: image,
        })
      }
    })

    this.log('Parsed ' + seen.size + ' unique items from Wecima')
    return items
  }
}
