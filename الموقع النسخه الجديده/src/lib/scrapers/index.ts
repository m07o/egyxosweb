import { WecimaScraper } from './engines/wecima-scraper'
import { DramaCafeScraper } from './engines/dramacafe-scraper'
import { CimaNowScraper } from './engines/cimanow-scraper'
import { ArabSeedScraper } from './engines/arabseed-scraper'
import { BaseScraper, type ScraperResult } from './engines/base-scraper'
import { getSiteConfig } from './config/sites'

const scraperMap: Record<string, () => BaseScraper> = {
  wecima: () => new WecimaScraper(),
  dramacafe: () => new DramaCafeScraper(),
  cimanow: () => new CimaNowScraper(),
  arabseed: () => new ArabSeedScraper(),
}

export async function runScraper(siteKey: string): Promise<ScraperResult> {
  const factory = scraperMap[siteKey]
  if (!factory) {
    return { success: false, items: [], totalFound: 0, filtered: 0, duration: 0, error: `Unknown site: ${siteKey}`, logs: [] }
  }
  const scraper = factory()
  return scraper.run()
}

export async function runAllScrapers(): Promise<Record<string, ScraperResult>> {
  const keys = Object.keys(scraperMap)
  const results: Record<string, ScraperResult> = {}
  const promises = keys.map(async (key) => { results[key] = await runScraper(key) })
  await Promise.allSettled(promises)
  return results
}

export { scraperMap, getSiteConfig }
export type { ScraperResult }
