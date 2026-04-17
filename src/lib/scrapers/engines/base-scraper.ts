import axios from 'axios'
import * as cheerio from 'cheerio'
import type { SiteConfig } from '../config/sites'
import { extractQuality, extractEpisodeInfo, cleanUrl, isAdLink } from '../utils/link-cleaner'

export interface ScrapedItem {
  title: string
  url: string
  quality: string
  site: string
  siteName: string
  linkType: 'watch' | 'download'
  contentType: 'movie' | 'series' | 'anime' | 'unknown'
  episodeInfo?: string
  imageUrl?: string
}

export interface ScraperResult {
  success: boolean
  items: ScrapedItem[]
  totalFound: number
  filtered: number
  duration: number
  error?: string
  logs: string[]
}

export interface RawItem {
  title: string
  url: string
  quality: string
  imageUrl?: string
}

const DEFAULT_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'ar,en-US;q=0.9,en;q=0.8',
  'Accept-Encoding': 'identity',
  'Cache-Control': 'no-cache',
}

export abstract class BaseScraper {
  protected config: SiteConfig
  protected logs: string[] = []
  protected startTime: number = 0

  constructor(config: SiteConfig) {
    this.config = config
  }

  protected log(message: string): void {
    const timestamp = new Date().toLocaleTimeString('ar-EG')
    this.logs.push(`[${timestamp}] ${message}`)
  }

  protected async fetchHtml(url: string): Promise<string | null> {
    const domains = [this.config.baseUrl, ...this.config.altDomains]

    for (const domain of domains) {
      try {
        const fullUrl = url.replace(this.config.baseUrl, domain).replace(/^https?:\/\/[^/]+/, domain)

        this.log(`Connecting to ${domain}...`)

        const response = await axios.get(fullUrl, {
          headers: DEFAULT_HEADERS,
          timeout: 30000,
          maxRedirects: 5,
          validateStatus: (status) => status < 400,
        })

        const html = response.data

        if (this.isChallengePage(html)) {
          this.log(`Warning: ${domain} is protected (Cloudflare) - trying alternate...`)
          continue
        }

        if (html.length < 500) {
          this.log(`Warning: ${domain} returned empty content`)
          continue
        }

        this.log(`Connected to ${domain} (${(html.length / 1024).toFixed(1)} KB)`)
        return html
      } catch (error: unknown) {
        const err = error as { code?: string; message?: string }
        this.log(`Failed: ${domain} - ${err.code || err.message || 'Unknown error'}`)
      }
    }

    this.log(`All domains failed for ${this.config.nameAr}`)
    return null
  }

  protected isChallengePage(html: string): boolean {
    return (
      html.includes('Just a moment') ||
      html.includes('Checking your browser') ||
      html.includes('_Incapsula_Resource') ||
      html.includes('cf-browser-verification') ||
      html.includes('challenge-platform') ||
      html.includes('Enable JavaScript and cookies') ||
      html.length < 1000
    )
  }

  async run(): Promise<ScraperResult> {
    this.startTime = Date.now()
    this.logs = []

    this.log(`Starting ${this.config.nameAr} scraper...`)

    try {
      const url = this.getScrapeUrl()
      const html = await this.fetchHtml(url)

      if (!html) {
        return {
          success: false, items: [], totalFound: 0, filtered: 0,
          duration: Date.now() - this.startTime,
          error: 'Connection failed', logs: this.logs,
        }
      }

      const $ = cheerio.load(html)
      const rawItems = this.parsePage($)

      this.log(`Found ${rawItems.length} raw items`)

      const filteredItems = this.cleanItems(rawItems)

      this.log(`After filtering: ${filteredItems.length} valid items`)

      const duration = Date.now() - this.startTime
      this.log(`Duration: ${(duration / 1000).toFixed(1)}s`)

      return {
        success: true, items: filteredItems,
        totalFound: rawItems.length, filtered: filteredItems.length,
        duration, logs: this.logs,
      }
    } catch (error: unknown) {
      const err = error as { message?: string }
      const duration = Date.now() - this.startTime
      this.log(`Error: ${err.message || 'Unknown error'}`)

      return {
        success: false, items: [], totalFound: 0, filtered: 0,
        duration, error: err.message, logs: this.logs,
      }
    }
  }

  protected abstract getScrapeUrl(): string
  protected abstract parsePage($: cheerio.CheerioAPI): RawItem[]

  protected cleanItems(rawItems: RawItem[]): ScrapedItem[] {
    const seen = new Set<string>()
    const items: ScrapedItem[] = []

    for (const raw of rawItems) {
      const url = cleanUrl(raw.url)
      const title = raw.title.trim()

      if (!title || !url) continue
      if (isAdLink(url)) continue
      if (!url.includes('/watch/') && !url.includes('/episode') && !url.includes('/download/') && !url.includes('/movie') && !url.includes('/series') && !url.includes('/anime')) continue

      const key = title + url
      if (seen.has(key)) continue
      seen.add(key)

      items.push({
        title,
        url,
        quality: extractQuality(raw.quality || title),
        site: this.config.key,
        siteName: this.config.nameAr,
        linkType: url.includes('/download') || /تحميل/i.test(title) ? 'download' : 'watch',
        contentType: this.detectContentType(title),
        episodeInfo: extractEpisodeInfo(title),
        imageUrl: raw.imageUrl,
      })

      if (items.length >= 50) break
    }

    return items
  }

  protected detectContentType(title: string): 'movie' | 'series' | 'anime' | 'unknown' {
    const t = title.toLowerCase()
    if (/مسلسل|حلقة|الموسم|موسم/i.test(t)) return 'series'
    if (/انمي|أنمي|anime/i.test(t)) return 'anime'
    if (/فيلم|movie/i.test(t)) return 'movie'
    return 'unknown'
  }
}
