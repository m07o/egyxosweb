import * as cheerio from 'cheerio'
import { BaseScraper, type RawItem } from './base-scraper'
import { getSiteConfig } from '../config/sites'

export class ArabSeedScraper extends BaseScraper {
  constructor() {
    super(getSiteConfig('arabseed')!)
  }

  protected getScrapeUrl(): string {
    return this.config.baseUrl
  }

  protected parsePage($: cheerio.CheerioAPI): RawItem[] {
    const items: RawItem[] = []
    const seen = new Set<string>()

    const containers = '.post-item, .entry, article, .BlockItemsContent'

    for (const container of containers.split(', ')) {
      $(container).each(function (this: cheerio.Element) {
        const $el = $(this)
        const $link = $el.find('a').first()

        const title = $el.find('h2 a, h3 a, .post-title a').first().text().trim()
        const href = $link.attr('href') || ''
        const quality = $el.find('.quality, [class*=quality]').first().text().trim()

        if (title && href && !seen.has(href)) {
          seen.add(href)
          items.push({
            title,
            url: href.startsWith('http') ? href : `https://arabseed.life${href}`,
            quality,
          })
        }
      })
    }

    return items
  }
}
