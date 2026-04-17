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
      const $el = $(this)
      const $link = $el.find('.Thumb--GridItem a').first() || $el.find('a').first()

      const href = $link.attr('href') || ''
      const title = $link.attr('title') || $link.find('[class*=Title]').first().text().trim() || $el.find('h2, h3').first().text().trim()
      const quality = $el.find('[class*=quality], [class*=Quality]').first().text().trim()

      if (href && title && !seen.has(href)) {
        seen.add(href)
        items.push({
          title,
          url: href.startsWith('http') ? href : `https://wecima.bar${href}`,
          quality,
        })
      }
    })

    this.log(`Parsed ${seen.size} unique items from Wecima`)
    return items
  }
}
