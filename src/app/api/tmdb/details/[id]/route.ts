import { NextRequest, NextResponse } from 'next/server';
import {
  getMovieDetails,
  getTvDetails,
  getSeasonDetails,
  TMDB_IMAGE,
} from '@/lib/tmdb';
import type { TmdbMediaListItem } from '@/lib/tmdb.types';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

function isTmdbConfigured(): boolean {
  const key = process.env.TMDB_API_KEY;
  return !!key && key !== 'your_tmdb_api_key_here';
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params;
    const tmdbId = parseInt(idStr);
    if (!tmdbId || isNaN(tmdbId)) {
      return NextResponse.json(
        { error: 'Invalid ID' },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const type = (searchParams.get('type') || 'movie').toLowerCase();

    // ── DB Fallback when TMDB is not configured ──
    if (!isTmdbConfigured()) {
      const movie = await db.movie.findUnique({
        where: { id: `tmdb-${tmdbId}` },
      });

      if (!movie) {
        return NextResponse.json(
          { error: 'Not found' },
          { status: 404 }
        );
      }

      const isSeries = movie.mediaType === 'series';

      // Get similar movies from DB (same media type, top rated)
      const similarMovies = await db.movie.findMany({
        where: {
          isPublished: true,
          mediaType: movie.mediaType,
          id: { not: movie.id },
        },
        take: 10,
        orderBy: { rating: 'desc' },
      });

      const similar: TmdbMediaListItem[] = similarMovies.map((m) => {
        const mTmdbId = parseInt(m.id.replace('tmdb-', ''), 10);
        return {
          id: mTmdbId,
          tmdbId: mTmdbId,
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
        };
      });

      const details = {
        id: tmdbId,
        title: movie.title || '',
        originalTitle: movie.originalTitle || '',
        overview: movie.overview || '',
        posterUrl: movie.posterUrl || '/poster1.jpg',
        backdropUrl: movie.backdropUrl || '/backdrop.jpg',
        vote_average: movie.rating || 0,
        vote_count: 0,
        release_date: movie.releaseYear ? `${movie.releaseYear}-01-01` : '',
        runtime: 0,
        status: 'Released',
        budget: 0,
        revenue: 0,
        genres: [],
        production_countries: [],
        tagline: '',
        type: isSeries ? 'series' : 'movie',
        first_air_date: movie.releaseYear ? `${movie.releaseYear}-01-01` : '',
        last_air_date: movie.releaseYear ? `${movie.releaseYear}-01-01` : '',
        episode_run_time: [],
        number_of_seasons: isSeries ? 1 : 0,
        number_of_episodes: isSeries ? 10 : 0,
      };

      if (isSeries) {
        const episodes = Array.from({ length: 10 }, (_, i) => ({
          id: `ep-${tmdbId}-${i + 1}`,
          episode_number: i + 1,
          name: `الحلقة ${i + 1}`,
          overview: '',
          still_path: null,
          air_date: null,
          runtime: 45,
          vote_average: 0,
        }));

        return NextResponse.json({
          details,
          director: null,
          cast: [],
          similar,
          videos: [],
          trailerUrl: null,
          seasons: [
            {
              id: 'season-placeholder',
              season_number: 1,
              name: 'الموسم 1',
              episode_count: 10,
              poster_path: movie.posterUrl || '/poster1.jpg',
              air_date: '',
              episodes,
            },
          ],
        });
      }

      return NextResponse.json({
        details,
        director: null,
        cast: [],
        similar,
        videos: [],
        trailerUrl: null,
        seasons: [],
      });
    }

    // ── Original TMDB logic ──
    if (type === 'tv' || type === 'series') {
      // ── TV Show ──
      const tvDetails = await getTvDetails(tmdbId);
      if (!tvDetails) {
        return NextResponse.json(
          { error: 'TV show not found' },
          { status: 404 }
        );
      }

      // Fetch episodes for all seasons in parallel
      const seasonsWithEpisodes = await Promise.all(
        (tvDetails.seasons || [])
          .filter((s) => s.season_number > 0) // skip specials
          .map(async (season) => {
            try {
              const seasonDetail = await getSeasonDetails(
                tmdbId,
                season.season_number
              );
              return seasonDetail
                ? {
                    ...season,
                    episodes: seasonDetail.episodes || [],
                  }
                : { ...season, episodes: [] };
            } catch {
              return { ...season, episodes: [] };
            }
          })
      );

      // Extract cast, similar, videos from appended response
      const cast = (tvDetails.credits?.cast || [])
        .slice(0, 20)
        .map((c) => ({
          id: c.id,
          name: c.name,
          character: c.character || '',
          photo: TMDB_IMAGE.profile(c.profile_path),
          order: c.order || 0,
        }));

      const director = (tvDetails.credits?.crew || []).find(
        (c) => c.job === 'Director' || c.department === 'Directing'
      );

      const similar: TmdbMediaListItem[] = (
        tvDetails.similar?.results || []
      ).map((item) => ({
        id: item.id,
        tmdbId: item.id,
        title: item.name || 'بدون عنوان',
        originalTitle: item.original_name || '',
        year: item.first_air_date
          ? new Date(item.first_air_date).getFullYear()
          : 0,
        rating: item.vote_average || 0,
        mediaType: 'SERIES' as const,
        posterPath: item.poster_path,
        backdropPath: item.backdrop_path,
        posterUrl: TMDB_IMAGE.poster(item.poster_path),
        backdropUrl: TMDB_IMAGE.backdrop(item.backdrop_path),
        overview: item.overview || '',
        genreIds: item.genre_ids || [],
      }));

      const trailer = (tvDetails.videos?.results || []).find(
        (v) => v.type === 'Trailer' && v.site === 'YouTube'
      );

      return NextResponse.json({
        details: {
          id: tvDetails.id,
          title: tvDetails.name || '',
          originalTitle: tvDetails.original_name || '',
          overview: tvDetails.overview || '',
          posterUrl: TMDB_IMAGE.poster(tvDetails.poster_path),
          backdropUrl: TMDB_IMAGE.backdrop(tvDetails.backdrop_path),
          vote_average: tvDetails.vote_average || 0,
          vote_count: tvDetails.vote_count || 0,
          first_air_date: tvDetails.first_air_date || '',
          last_air_date: tvDetails.last_air_date || '',
          episode_run_time: tvDetails.episode_run_time || [],
          number_of_seasons: tvDetails.number_of_seasons || 0,
          number_of_episodes: tvDetails.number_of_episodes || 0,
          status: tvDetails.status || '',
          genres: (tvDetails.genres || []).map((g) => ({
            id: g.id,
            name: g.name,
          })),
          production_countries:
            tvDetails.production_companies?.map((c) => c.name) || [],
          tagline: tvDetails.tagline || '',
          type: 'series',
        },
        director: director
          ? {
              name: director.name,
              photo: TMDB_IMAGE.profile(director.profile_path),
            }
          : null,
        cast,
        similar,
        videos: tvDetails.videos?.results || [],
        trailerUrl: trailer
          ? `https://www.youtube.com/embed/${trailer.key}`
          : null,
        seasons: seasonsWithEpisodes.map((s) => ({
          id: s.id,
          season_number: s.season_number,
          name: s.name,
          episode_count: s.episode_count,
          poster_path: TMDB_IMAGE.poster(s.poster_path),
          air_date: s.air_date || '',
          episodes: (s.episodes || []).map((ep) => ({
            id: ep.id,
            episode_number: ep.episode_number,
            name: ep.name || '',
            overview: ep.overview || '',
            still_path: TMDB_IMAGE.still(ep.still_path),
            air_date: ep.air_date || '',
            runtime: ep.runtime || 0,
            vote_average: ep.vote_average || 0,
          })),
        })),
      });
    } else {
      // ── Movie ──
      const movieDetails = await getMovieDetails(tmdbId);
      if (!movieDetails) {
        return NextResponse.json(
          { error: 'Movie not found' },
          { status: 404 }
        );
      }

      const cast = (movieDetails.credits?.cast || [])
        .slice(0, 20)
        .map((c) => ({
          id: c.id,
          name: c.name,
          character: c.character || '',
          photo: TMDB_IMAGE.profile(c.profile_path),
          order: c.order || 0,
        }));

      const director = (movieDetails.credits?.crew || []).find(
        (c) => c.job === 'Director'
      );

      const similar: TmdbMediaListItem[] = (
        movieDetails.similar?.results || []
      ).map((item) => ({
        id: item.id,
        tmdbId: item.id,
        title: item.title || 'بدون عنوان',
        originalTitle: item.original_title || '',
        year: item.release_date
          ? new Date(item.release_date).getFullYear()
          : 0,
        rating: item.vote_average || 0,
        mediaType: 'MOVIE' as const,
        posterPath: item.poster_path,
        backdropPath: item.backdrop_path,
        posterUrl: TMDB_IMAGE.poster(item.poster_path),
        backdropUrl: TMDB_IMAGE.backdrop(item.backdrop_path),
        overview: item.overview || '',
        genreIds: item.genre_ids || [],
      }));

      const trailer = (movieDetails.videos?.results || []).find(
        (v) => v.type === 'Trailer' && v.site === 'YouTube'
      );

      return NextResponse.json({
        details: {
          id: movieDetails.id,
          title: movieDetails.title || '',
          originalTitle: movieDetails.original_title || '',
          overview: movieDetails.overview || '',
          posterUrl: TMDB_IMAGE.poster(movieDetails.poster_path),
          backdropUrl: TMDB_IMAGE.backdrop(movieDetails.backdrop_path),
          vote_average: movieDetails.vote_average || 0,
          vote_count: movieDetails.vote_count || 0,
          release_date: movieDetails.release_date || '',
          runtime: movieDetails.runtime || 0,
          status: movieDetails.status || '',
          budget: movieDetails.budget || 0,
          revenue: movieDetails.revenue || 0,
          genres: (movieDetails.genres || []).map((g) => ({
            id: g.id,
            name: g.name,
          })),
          production_countries:
            movieDetails.production_countries?.map((c) => c.name) || [],
          tagline: movieDetails.tagline || '',
          type: 'movie',
        },
        director: director
          ? {
              name: director.name,
              photo: TMDB_IMAGE.profile(director.profile_path),
            }
          : null,
        cast,
        similar,
        videos: movieDetails.videos?.results || [],
        trailerUrl: trailer
          ? `https://www.youtube.com/embed/${trailer.key}`
          : null,
        seasons: [],
      });
    }
  } catch (error) {
    console.error('[API /tmdb/details] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch details' },
      { status: 500 }
    );
  }
}
