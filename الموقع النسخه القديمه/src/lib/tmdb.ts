import type { Movie, Genre } from '@/types'
import {
  getMovieById,
  getHeroSlides,
  dummyTrending,
  dummyNewMovies,
  dummyForeignMovies,
  dummyForeignSeries,
  dummyAnime,
  dummyAsianMovies,
  dummyArabicMovies,
  dummyAllMovies,
  dummyAllSeries,
  searchMovies,
  getMoviesByGenre,
} from './dummy-data'

const TMDB_BASE = 'https://api.themoviedb.org/3'
const IMG_BASE = 'https://image.tmdb.org/t/p/'
const IMG_W500 = `${IMG_BASE}w500`
const IMG_ORIGINAL = `${IMG_BASE}original`

function getImgUrl(path: string | null, size: 'w500' | 'original' = 'w500'): string {
  if (!path) return `https://placehold.co/300x450/1a1a2e/e94560?text=No+Image`
  const base = size === 'original' ? IMG_ORIGINAL : IMG_W500
  return `${base}${path}`
}

interface TmdbResult {
  results: Movie[]
  page: number
  total_pages: number
  total_results: number
}

async function fetchFromApi(endpoint: string): Promise<TmdbResult | null> {
  try {
    const res = await fetch(`/api/tmdb?endpoint=${encodeURIComponent(endpoint)}`)
    if (!res.ok) return null
    const data = await res.json()
    if (data.dummy) return null
    return data
  } catch {
    return null
  }
}

function mapTmdbMovie(item: Record<string, unknown>): Movie {
  const mediaType = (item.media_type as string) || 'movie'
  return {
    id: item.id as number,
    title: mediaType === 'tv' ? (item.name as string) : (item.title as string),
    originalTitle: item.original_title || item.original_name || (item.title as string),
    overview: (item.overview as string) || '',
    posterPath: getImgUrl(item.poster_path as string),
    backdropPath: getImgUrl(item.backdrop_path as string, 'original'),
    releaseDate: item.release_date || item.first_air_date || '',
    voteAverage: (item.vote_average as number) || 0,
    voteCount: (item.vote_count as number) || 0,
    genreIds: (item.genre_ids as number[]) || [],
    mediaType: mediaType as 'movie' | 'tv',
    popularity: (item.popularity as number) || 0,
    adult: (item.adult as boolean) || false,
  }
}

export async function fetchTrending(page = 1): Promise<Movie[]> {
  try {
    const data = await fetchFromApi(`trending/all/week?page=${page}`)
    if (data?.results?.length) {
      return data.results.map(mapTmdbMovie)
    }
  } catch { /* ignore */ }
  return dummyTrending
}

export async function fetchMovies(category: string, page = 1): Promise<Movie[]> {
  try {
    const data = await fetchFromApi(`movie/${category}?page=${page}&language=ar`)
    if (data?.results?.length) {
      return data.results.map(mapTmdbMovie)
    }
  } catch { /* ignore */ }

  // Fallback by category
  switch (category) {
    case 'now_playing':
    case 'popular':
    case 'top_rated':
      return dummyForeignMovies
    case 'upcoming':
      return dummyNewMovies
    default:
      return dummyAllMovies
  }
}

export async function fetchTvShows(category: string, page = 1): Promise<Movie[]> {
  try {
    const data = await fetchFromApi(`tv/${category}?page=${page}&language=ar`)
    if (data?.results?.length) {
      return data.results.map(mapTmdbMovie)
    }
  } catch { /* ignore */ }

  switch (category) {
    case 'popular':
    case 'top_rated':
    case 'airing_today':
      return dummyForeignSeries
    default:
      return dummyAllSeries
  }
}

export async function fetchMovieDetails(id: number): Promise<Movie | null> {
  try {
    const data = await fetchFromApi(`movie/${id}?language=ar&append_to_response=credits,similar`)
    if (data && !data.dummy) {
      // The API route returns the full movie object, not a TmdbResult
      const movie = data as unknown as Record<string, unknown>
      return {
        id: movie.id as number,
        title: (movie.title as string) || '',
        originalTitle: movie.original_title as string,
        overview: (movie.overview as string) || '',
        posterPath: getImgUrl(movie.poster_path as string),
        backdropPath: getImgUrl(movie.backdrop_path as string, 'original'),
        releaseDate: movie.release_date as string,
        voteAverage: (movie.vote_average as number) || 0,
        voteCount: (movie.vote_count as number) || 0,
        genreIds: ((movie.genres as Record<string, unknown>[]) || []).map((g: Record<string, unknown>) => g.id as number),
        genres: (movie.genres as Genre[]) || [],
        mediaType: 'movie',
        popularity: (movie.popularity as number) || 0,
        adult: (movie.adult as boolean) || false,
        runtime: movie.runtime as number,
        quality: '1080p',
        tags: ['HD', 'مترجم'],
        credits: movie.credits as Movie['credits'],
        similar: movie.similar?.results?.length
          ? (movie.similar.results as Record<string, unknown>[]).map(mapTmdbMovie)
          : [],
        downloadLinks: [
          { quality: '1080p', size: '1.5 GB', server: 'سيرفر مباشر', url: '#' },
          { quality: '720p', size: '800 MB', server: 'سيرفر مباشر', url: '#' },
          { quality: '480p', size: '400 MB', server: 'سيرفر مباشر', url: '#' },
        ],
      }
    }
  } catch { /* ignore */ }

  // Fallback
  return getMovieById(id) || null
}

export async function fetchTvDetails(id: number): Promise<Movie | null> {
  try {
    const data = await fetchFromApi(`tv/${id}?language=ar&append_to_response=credits,similar`)
    if (data && !data.dummy) {
      const show = data as unknown as Record<string, unknown>
      return {
        id: show.id as number,
        title: (show.name as string) || '',
        originalTitle: show.original_name as string,
        overview: (show.overview as string) || '',
        posterPath: getImgUrl(show.poster_path as string),
        backdropPath: getImgUrl(show.backdrop_path as string, 'original'),
        releaseDate: show.first_air_date as string,
        voteAverage: (show.vote_average as number) || 0,
        voteCount: (show.vote_count as number) || 0,
        genreIds: ((show.genres as Record<string, unknown>[]) || []).map((g: Record<string, unknown>) => g.id as number),
        genres: (show.genres as Genre[]) || [],
        mediaType: 'tv',
        popularity: (show.popularity as number) || 0,
        adult: false,
        quality: '1080p',
        tags: ['HD', 'مترجم'],
        seasons: (show.seasons as Movie['seasons']) || [],
        credits: show.credits as Movie['credits'],
        similar: show.similar?.results?.length
          ? (show.similar.results as Record<string, unknown>[]).map(mapTmdbMovie)
          : [],
        downloadLinks: [
          { quality: '1080p', size: '1.5 GB', server: 'سيرفر مباشر', url: '#' },
          { quality: '720p', size: '800 MB', server: 'سيرفر مباشر', url: '#' },
          { quality: '480p', size: '400 MB', server: 'سيرفر مباشر', url: '#' },
        ],
      }
    }
  } catch { /* ignore */ }

  return getMovieById(id) || null
}

export async function searchContent(query: string): Promise<Movie[]> {
  if (!query.trim()) return []

  try {
    const data = await fetchFromApi(`search/multi?query=${encodeURIComponent(query)}&language=ar`)
    if (data?.results?.length) {
      return data.results
        .filter((r: Record<string, unknown>) => (r.media_type as string) === 'movie' || (r.media_type as string) === 'tv')
        .map(mapTmdbMovie)
    }
  } catch { /* ignore */ }

  return searchMovies(query)
}

export async function fetchGenres(): Promise<Genre[]> {
  try {
    const data = await fetchFromApi(`genre/movie/list?language=ar`)
    if (data?.genres?.length) {
      return data.genres as Genre[]
    }
  } catch { /* ignore */ }

  // Already imported from dummy-data
  const { genres: dummyGenres } = await import('./dummy-data')
  return dummyGenres
}

export { getMovieById, getHeroSlides, searchMovies, getMoviesByGenre }
export { dummyTrending, dummyNewMovies, dummyForeignMovies, dummyForeignSeries, dummyAnime, dummyAsianMovies, dummyArabicMovies, dummyAllMovies, dummyAllSeries }
