import { NextResponse } from 'next/server'
import { runScraper } from '@/lib/scrapers'
import { db } from '@/lib/db'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { site } = body
    if (!site || typeof site !== 'string') return NextResponse.json({ error: 'Site required' }, { status: 400 })

    const validSites = ['wecima', 'dramacafe', 'cimanow', 'arabseed']
    if (!validSites.includes(site)) return NextResponse.json({ error: `Invalid site: ${validSites.join(', ')}` }, { status: 400 })

    const result = await runScraper(site)

    try {
      await db.scrapeLog.create({
        data: {
          site,
          status: result.success ? 'success' : 'error',
          linksFound: result.filtered || 0,
          linksNew: result.filtered || 0,
          errorMessage: result.error || undefined,
          durationMs: result.duration || 0,
          pagesScraped: 1,
          moviesFound: result.filtered || 0,
        },
      })
    } catch (logError) {
      console.error('Log save failed:', logError)
    }

    return NextResponse.json(result)
  } catch (error: unknown) {
    const err = error as { message?: string }
    return NextResponse.json({ error: err.message || 'Scraper error' }, { status: 500 })
  }
}

