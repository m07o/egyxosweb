import { NextResponse } from 'next/server'
import { runScraper } from '@/lib/scrapers'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

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
          linksCount: result.filtered || 0,
          message: result.error || `Scraped ${result.filtered || 0} links`,
          duration: result.duration || 0,
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

export async function GET(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const site = searchParams.get('site')
    const limit = parseInt(searchParams.get('limit') || '10', 10)

    const query: any = {}
    if (site) query.site = site

    const logs = await db.scrapeLog.findMany({
      where: query,
      orderBy: { createdAt: 'desc' },
      take: limit,
    })

    return NextResponse.json(logs)
  } catch (error: unknown) {
    const err = error as { message?: string }
    return NextResponse.json({ error: err.message || 'Failed to fetch logs' }, { status: 500 })
  }
}
