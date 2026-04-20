import { NextResponse } from 'next/server';
import {
  getTrending,
  getNowPlayingMovies,
  getPopularMovies,
  getPopularTvShows,
  getTopRatedMovies,
  getTopRatedTvShows,
  getUpcomingMovies,
  getMovieGenres,
  getTvGenres,
} from '@/lib/tmdb';
import { PrismaClient } from '@prisma/client';

export const dynamic = 'force-dynamic';
export const revalidate = 1800; // 30 minutes

// ── Prisma singleton for serverless ──────────────────────────
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// ── Helper: check if TMDB API key is configured ─────────────
function isTmdbConfigured(): boolean {
  const key = process.env.TMDB_API_KEY;
  return !!key && key !== 'your_tmdb_api_key_here';
}

// ── Genre mapping for seed data ─────────────────────────────
// Map movie IDs to genre names for the seeded data
const GENRE_MAP: Record<string, string[]> = {
  'tmdb-157336': ['خيال علمي', 'مغامرة', 'دراما'],
  'tmdb-475557': ['دراما', 'جريمة', 'إثارة'],
  'tmdb-27205': ['خيال علمي', 'أكشن', 'إثارة'],
  'tmdb-278': ['دراما', 'جريمة'],
  'tmdb-238': ['جريمة', 'دراما'],
  'tmdb-680': ['جريمة', 'دراما', 'كوميديا'],
  'tmdb-550': ['دراما', 'إثارة'],
  'tmdb-155': ['أكشن', 'جريمة', 'إثارة'],
  'tmdb-496243': ['دراما', 'كوميديا سوداء', 'إثارة'],
  'tmdb-13': ['دراما', 'كوميديا', 'رومانسية'],
  'tmdb-346698': ['كوميديا', 'مغامرة', 'فانتازيا'],
  'tmdb-872585': ['دراما', 'تاريخي', 'سيرة ذاتية'],
  'tmdb-374720': ['خيال علمي', 'مغامرة', 'أكشن'],
  'tmdb-326279': ['أنمي', 'أكشن', 'مغامرة'],
  'tmdb-987905': ['أنمي', 'أكشن', 'مغامرة'],
  'tmdb-634649': ['أكشن', 'مغامرة', 'خيال علمي'],
  'tmdb-299534': ['أكشن', 'مغامرة', 'خيال علمي'],
  'tmdb-299536': ['أكشن', 'مغامرة', 'خيال علمي'],
  'tmdb-340398': ['كوميديا', 'موسيقى', 'رومانسية'],
  'tmdb-353081': ['خيال علمي', 'أكشن'],
  'tmdb-7451': ['أنمي', 'مغامرة', 'فانتازيا'],
  'tmdb-449924': ['غموض', 'كوميديا', 'جريمة'],
  'tmdb-438631': ['خيال علمي', 'مغامرة'],
  'tmdb-447365': ['دراما'],
  'tmdb-102899': ['سيرة ذاتية', 'جريمة', 'كوميديا'],
  'tmdb-603': ['خيال علمي', 'أكشن'],
  'tmdb-804735': ['أكشن', 'جريمة', 'إثارة'],
  'tmdb-338762': ['كوميديا', 'مغامرة', 'جريمة'],
  'tmdb-324786': ['دراما', 'موسيقى'],
  'tmdb-502356': ['أنمي', 'كوميديا', 'مغامرة'],
  'tmdb-1022789': ['رعب', 'إثارة', 'فانتازيا'],
  'tmdb-748783': ['رعب', 'إثارة', 'غموض'],
  'tmdb-58221': ['كوميديا', 'دراما', 'رومانسية'],
  'tmdb-76241': ['أكشن', 'موسيقى', 'جريمة'],
  'tmdb-512195': ['رعب', 'غموض', 'إثارة'],
  'tmdb-122917': ['رعب', 'إثارة'],
  'tmdb-698507': ['رعب', 'كوميديا سوداء', 'إثارة'],
  'tmdb-429617': ['رعب', 'دراما', 'غموض'],
  'tmdb-274': ['رعب', 'جريمة', 'إثارة'],
  'tmdb-533514': ['دراما', 'كوميديا'],
  'tmdb-12555': ['دراما'],
  'tmdb-11860': ['دراما', 'رومانسية'],
  'tmdb-12477': ['جريمة', 'رعب', 'غموض'],
  'tmdb-456740': ['موسيقى', 'فانتازيا', 'دراما'],
  'tmdb-1024550': ['كوميديا', 'دراما', 'رومانسية'],
};

// ── DB Fallback: Convert DB movie to TmdbMediaListItem ───────
interface DbMovie {
  id: string;
  title: string;
  originalTitle: string | null;
  slug: string;
  overview: string | null;
  posterUrl: string | null;
  backdropUrl: string | null;
  releaseYear: number | null;
  quality: string;
  rating: number;
  mediaType: string;
  site: string;
  isPublished: boolean;
}

interface TmdbMediaListItem {
  id: number;
  tmdbId: number;
  title: string;
  originalTitle: string;
  year: number;
  rating: number;
  mediaType: 'MOVIE' | 'SERIES';
  posterPath: string | null;
  backdropPath: string | null;
  posterUrl: string;
  backdropUrl: string;
  overview: string;
  genreIds: number[];
  genreNames?: string[];
}

function dbMovieToListItem(movie: DbMovie): TmdbMediaListItem {
  const tmdbIdNum = parseInt(movie.id.replace('tmdb-', ''), 10) || 0;
  const genreNames = GENRE_MAP[movie.id] || ['دراما'];
  const genreIds = genreNames.map((_, i) => (hashString(movie.id) + i) % 20 + 1);

  return {
    id: tmdbIdNum,
    tmdbId: tmdbIdNum,
    title: movie.title,
    originalTitle: movie.originalTitle || '',
    year: movie.releaseYear || 0,
    rating: movie.rating,
    mediaType: movie.mediaType === 'tv' ? 'SERIES' : 'MOVIE',
    posterPath: movie.posterUrl || null,
    backdropPath: movie.backdropUrl || null,
    posterUrl: movie.posterUrl || '/poster1.jpg',
    backdropUrl: movie.backdropUrl || '/backdrop.jpg',
    overview: movie.overview || '',
    genreIds,
    genreNames,
  };
}

// Simple hash for deterministic genre IDs
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

// ── DB Fallback: Fetch and distribute movies ─────────────────
async function getHomeDataFromDB() {
  const movies = await prisma.movie.findMany({
    where: { isPublished: true },
    orderBy: { rating: 'desc' },
  });

  if (movies.length === 0) {
    return null;
  }

  // Convert all movies to list items
  const allItems = movies.map(dbMovieToListItem);

  // Shuffle helper
  const shuffle = <T>(arr: T[]): T[] => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  // Hero: movies with backdrops (top rated first), or top 5 rated
  const withBackdrop = allItems.filter(m => m.backdropUrl && m.backdropUrl !== '/backdrop.jpg');
  const hero = (withBackdrop.length >= 5 ? withBackdrop.slice(0, 5) : allItems.slice(0, 5)).map(m => ({
    ...m,
    genreNames: m.genreNames || [],
  }));

  // Trending: shuffled selection of ~15 movies
  const trending = shuffle(allItems).slice(0, Math.min(15, allItems.length));

  // Now Playing: recent movies (2023+) sorted by rating
  const nowPlaying = allItems
    .filter(m => m.year >= 2023)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 12);

  // Popular Movies: highest rated
  const popularMovies = allItems.slice(0, Math.min(15, allItems.length));

  // Top Rated Movies: sorted by rating desc
  const topRatedMovies = [...allItems].sort((a, b) => b.rating - a.rating).slice(0, 15);

  // Upcoming: most recent (2024-2025)
  const upcoming = allItems
    .filter(m => m.year >= 2024)
    .sort((a, b) => b.year - a.year || b.rating - a.rating)
    .slice(0, 10);

  // We have no TV shows in the seed, so these will be empty
  const popularTv: TmdbMediaListItem[] = [];
  const topRatedTv: TmdbMediaListItem[] = [];

  console.log(`[DB Fallback] Serving ${allItems.length} movies from database`);

  return {
    hero,
    trending,
    nowPlaying,
    popularMovies,
    popularTv,
    topRatedMovies,
    topRatedTv,
    upcoming,
  };
}

// ── Main Handler ─────────────────────────────────────────────

export async function GET() {
  try {
    // If TMDB API key is configured, use TMDB API
    if (isTmdbConfigured()) {
      const [
        trending,
        nowPlaying,
        popularMovies,
        popularTv,
        topRatedMovies,
        topRatedTv,
        upcoming,
        movieGenres,
        tvGenres,
      ] = await Promise.all([
        getTrending('week', 1),
        getNowPlayingMovies(1),
        getPopularMovies(1),
        getPopularTvShows(1),
        getTopRatedMovies(1),
        getTopRatedTvShows(1),
        getUpcomingMovies(1),
        getMovieGenres(),
        getTvGenres(),
      ]);

      // Build genre name lookup
      const genreMap = new Map<number, string>();
      for (const g of [...movieGenres, ...tvGenres]) {
        if (!genreMap.has(g.id)) genreMap.set(g.id, g.name);
      }

      // Extend items with genreNames
      function withGenreNames(items: typeof trending) {
        return items.map((item) => ({
          ...item,
          genreNames: item.genreIds
            .map((id) => genreMap.get(id) || '')
            .filter(Boolean),
        }));
      }

      // Hero: top 5 trending items (they have best backdrops)
      const hero = withGenreNames(trending.slice(0, 5));

      return NextResponse.json({
        hero,
        trending: withGenreNames(trending),
        nowPlaying: withGenreNames(nowPlaying),
        popularMovies: withGenreNames(popularMovies),
        popularTv: withGenreNames(popularTv),
        topRatedMovies: withGenreNames(topRatedMovies),
        topRatedTv: withGenreNames(topRatedTv),
        upcoming: withGenreNames(upcoming),
      });
    }

    // TMDB not configured — fall back to database
    console.log('[API /tmdb/home] TMDB API key not configured, using database fallback');
    const dbData = await getHomeDataFromDB();

    if (!dbData) {
      return NextResponse.json(
        { error: 'No data available - TMDB not configured and database is empty' },
        { status: 503 }
      );
    }

    return NextResponse.json(dbData);
  } catch (error) {
    console.error('[API /tmdb/home] Error:', error);

    // On any TMDB error, try DB fallback
    if (isTmdbConfigured()) {
      console.log('[API /tmdb/home] TMDB failed, attempting database fallback');
      try {
        const dbData = await getHomeDataFromDB();
        if (dbData) {
          return NextResponse.json(dbData);
        }
      } catch (dbError) {
        console.error('[API /tmdb/home] Database fallback also failed:', dbError);
      }
    }

    return NextResponse.json(
      { error: 'Failed to fetch home data' },
      { status: 500 }
    );
  }
}
