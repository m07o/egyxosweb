import { NextRequest, NextResponse } from 'next/server'

const TMDB_BASE = 'https://api.themoviedb.org/3'
const TMDB_API_KEY = process.env.TMDB_API_KEY || ''

// These endpoints need the full movie/show object, not the paginated results
const DETAIL_ENDPOINTS = ['movie/', 'tv/'].filter(Boolean)

export async function GET(request: NextRequest) {
  const endpoint = request.nextUrl.searchParams.get('endpoint')

  if (!endpoint) {
    return NextResponse.json({ error: 'Missing endpoint parameter' }, { status: 400 })
  }

  // If no API key, return dummy flag
  if (!TMDB_API_KEY) {
    return NextResponse.json({ dummy: true, message: 'No TMDB API key configured' })
  }

  try {
    const url = `${TMDB_BASE}/${endpoint}${endpoint.includes('?') ? '&' : '?'}api_key=${TMDB_API_KEY}`
    const res = await fetch(url, {
      next: { revalidate: 3600 },
    })

    if (!res.ok) {
      return NextResponse.json({ error: 'TMDB API error', dummy: true }, { status: 200 })
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Fetch failed', dummy: true }, { status: 200 })
  }
}
