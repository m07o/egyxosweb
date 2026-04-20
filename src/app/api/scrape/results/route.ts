import { NextRequest, NextResponse } from 'next/server';
import { getScrapedMovies } from '@/lib/scraped-movies';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'movie';
    const limit = parseInt(searchParams.get('limit') || '20');

    const movies = await getScrapedMovies();

    // Filter by type if specified
    const filtered =
      type === 'all'
        ? movies
        : movies.filter(
            (m) => m.type.toLowerCase() === type.toLowerCase()
          );

    // Limit results
    const limited = filtered.slice(0, limit);

    // Transform to expected format
    const results = limited.map((movie) => ({
      id: movie.id,
      title: movie.title,
      quality: movie.quality || '1080p',
      posterUrl: movie.imageUrl || '',
      site: new URL(movie.url || 'https://example.com').hostname,
      type: movie.type,
      url: movie.url,
      links: [] as Array<{
        serverName: string;
        linkType: string;
        quality: string;
        url: string;
      }>,
    }));

    return NextResponse.json({ movies: results });
  } catch (error) {
    console.error('[API /scrape/results] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch scraped results' },
      { status: 500 }
    );
  }
}
