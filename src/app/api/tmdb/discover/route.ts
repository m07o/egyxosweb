import { NextRequest, NextResponse } from 'next/server';
import {
  discoverMedia,
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
    const type = (searchParams.get('type') || 'movie').toLowerCase();
    const genreId = searchParams.get('genreId');
    const year = searchParams.get('year');
    const sortBy = searchParams.get('sort') || 'popularity.desc';
    const page = parseInt(searchParams.get('page') || '1');

    // ── DB Fallback when TMDB is not configured ──
    if (!isTmdbConfigured()) {
      const mediaType = type === 'tv' || type === 'series' ? 'series' : 'movie';

      const whereClause: Record<string, unknown> = {
        isPublished: true,
        mediaType,
      };

      // Year filtering
      if (year) {
        whereClause.releaseYear = parseInt(year);
      }

      // Genre filtering is not available via DB since movies don't store genre IDs
      // We ignore genreId in DB fallback mode

      const movies = await db.movie.findMany({
        where: whereClause,
        skip: (page - 1) * 20,
        take: 20,
        orderBy: { rating: 'desc' },
      });

      const totalMovies = await db.movie.count({ where: whereClause });
      const totalPages = Math.ceil(totalMovies / 20);

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
        totalPages,
        totalResults: totalMovies,
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

    const tmdbMediaType = type === 'tv' || type === 'series' ? 'tv' : 'movie';

    const data = await discoverMedia(tmdbMediaType, {
      page,
      sortBy,
      genreId: genreId ? parseInt(genreId) : undefined,
      year: year ? parseInt(year) : undefined,
    });

    // Enhance with genre names
    const enhancedResults = data.results.map((item) => ({
      ...item,
      genreNames: item.genreIds
        .map((id) => genreMap.get(id) || '')
        .filter(Boolean),
    }));

    return NextResponse.json({
      results: enhancedResults,
      page: data.page,
      totalPages: data.totalPages,
      totalResults: data.totalResults,
    });
  } catch (error) {
    console.error('[API /tmdb/discover] Error:', error);
    return NextResponse.json(
      { error: 'Failed to discover content' },
      { status: 500 }
    );
  }
}
