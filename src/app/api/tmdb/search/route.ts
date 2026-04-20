import { NextRequest, NextResponse } from 'next/server';
import {
  searchMulti,
  searchMovies,
  searchTvShows,
  getMovieGenres,
  getTvGenres,
} from '@/lib/tmdb';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

function isTmdbConfigured(): boolean {
  const key = process.env.TMDB_API_KEY;
  return !!key && key !== 'your_tmdb_api_key_here';
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const type = searchParams.get('type') || 'all';
    const page = parseInt(searchParams.get('page') || '1');

    if (!query.trim()) {
      return NextResponse.json({
        results: [],
        page: 1,
        totalPages: 0,
        totalResults: 0,
      });
    }

    // ── DB Fallback when TMDB is not configured ──
    if (!isTmdbConfigured()) {
      const whereClause: Record<string, unknown> = {
        isPublished: true,
        OR: [
          { title: { contains: query } },
          { originalTitle: { contains: query } },
        ],
      };

      // Case-insensitive fallback for SQLite (search lowercase and uppercase)
      const lowerQuery = query.toLowerCase();
      const upperQuery = query.toUpperCase();
      if (lowerQuery !== query || upperQuery !== query) {
        whereClause.OR = [
          { title: { contains: query } },
          { title: { contains: lowerQuery } },
          { title: { contains: upperQuery } },
          { originalTitle: { contains: query } },
          { originalTitle: { contains: lowerQuery } },
          { originalTitle: { contains: upperQuery } },
        ];
      }

      // Filter by media type if specified
      if (type === 'movie') {
        whereClause.mediaType = 'movie';
      } else if (type === 'tv' || type === 'series') {
        whereClause.mediaType = 'series';
      }

      const movies = await db.movie.findMany({
        where: whereClause,
        take: 20,
        skip: (page - 1) * 20,
        orderBy: { rating: 'desc' },
      });

      const results = movies.map((m) => {
        const tmdbId = parseInt(m.id.replace('tmdb-', ''), 10);
        return {
          id: tmdbId,
          tmdbId,
          title: m.title || 'بدون عنوان',
          originalTitle: m.originalTitle || '',
          year: m.releaseYear || 0,
          rating: m.rating || 0,
          mediaType: m.mediaType === 'series' ? 'SERIES' : 'MOVIE',
          posterPath: null,
          backdropPath: null,
          posterUrl: m.posterUrl || '/poster1.jpg',
          backdropUrl: m.backdropUrl || '/backdrop.jpg',
          overview: m.overview || '',
          genreIds: [],
          genreNames: [],
        };
      });

      return NextResponse.json({
        results,
        page,
        totalPages: 1,
        totalResults: results.length,
      });
    }

    // ── Original TMDB logic ──
    // Fetch genres for names
    const [movieGenres, tvGenres] = await Promise.all([
      getMovieGenres(),
      getTvGenres(),
    ]);
    const genreMap = new Map<number, string>();
    for (const g of [...movieGenres, ...tvGenres]) {
      if (!genreMap.has(g.id)) genreMap.set(g.id, g.name);
    }

    let results;

    switch (type.toLowerCase()) {
      case 'movie':
        results = await searchMovies(query, page);
        break;
      case 'tv':
      case 'series':
        results = await searchTvShows(query, page);
        break;
      default:
        results = await searchMulti(query, page);
        break;
    }

    // Enhance with genre names
    const enhancedResults = results.map((item) => ({
      ...item,
      genreNames: item.genreIds
        .map((id) => genreMap.get(id) || '')
        .filter(Boolean),
    }));

    return NextResponse.json({
      results: enhancedResults,
      page,
      totalPages: 500, // TMDB typically limits to 500
      totalResults: enhancedResults.length,
    });
  } catch (error) {
    console.error('[API /tmdb/search] Error:', error);
    return NextResponse.json(
      { error: 'Failed to search' },
      { status: 500 }
    );
  }
}
