// ============================================================
// CinemaPlus - TMDB API Integration
// Professional TMDB Data Fetching Layer
// ============================================================

import type {
  TmdbMovie,
  TmdbTvShow,
  TmdbMovieDetails,
  TmdbTvDetails,
  TmdbPerson,
  TmdbSearchResult,
  TmdbMediaListItem,
  TmdbSeasonDetails,
  TmdbGenre,
  TmdbVideo,
} from "./tmdb.types";

// ── Constants ──────────────────────────────────────────────

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";

export const TMDB_IMAGE = {
  poster: (path: string | null, size = "w500") =>
    path ? `${TMDB_IMAGE_BASE}/${size}${path}` : "/poster1.jpg",
  backdrop: (path: string | null, size = "w1280") =>
    path ? `${TMDB_IMAGE_BASE}/${size}${path}` : "/backdrop.jpg",
  profile: (path: string | null, size = "w185") =>
    path ? `${TMDB_IMAGE_BASE}/${size}${path}` : "/cast1.jpg",
  still: (path: string | null, size = "w300") =>
    path ? `${TMDB_IMAGE_BASE}/${size}${path}` : "/poster1.jpg",
};

// ── API Key Helper ─────────────────────────────────────────

function getApiKey(): string {
  const key = process.env.TMDB_API_KEY;
  if (!key || key === "your_tmdb_api_key_here") {
    console.warn(
      "[TMDB] Warning: TMDB_API_KEY is not configured. Set it in .env"
    );
  }
  return key || "";
}

// ── Generic Fetch Helper ───────────────────────────────────

async function tmdbFetch<T>(
  endpoint: string,
  params: Record<string, string> = {}
): Promise<T | null> {
  const apiKey = getApiKey();
  if (!apiKey) return null;

  const url = new URL(`${TMDB_BASE_URL}${endpoint}`);
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("language", "ar");

  // Apply additional params
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });

  try {
    const res = await fetch(url.toString(), { next: { revalidate: 3600 } });
    if (!res.ok) {
      console.error(`[TMDB] API Error ${res.status}: ${endpoint}`);
      return null;
    }
    return (await res.json()) as T;
  } catch (error) {
    console.error(`[TMDB] Fetch Error: ${endpoint}`, error);
    return null;
  }
}

// ============================================================
// TRENDING
// ============================================================

interface TmdbTrendingResponse {
  page: number;
  results: TmdbSearchResult[];
  total_pages: number;
  total_results: number;
}

/**
 * جلب المحتوى الرائج (Trending)
 * @param timeWindow - 'day' أو 'week'
 * @param page - رقم الصفحة
 */
export async function getTrending(
  timeWindow: "day" | "week" = "week",
  page = 1
): Promise<TmdbMediaListItem[]> {
  const data = await tmdbFetch<TmdbTrendingResponse>(
    `/trending/all/${timeWindow}`,
    { page: String(page) }
  );
  if (!data) return [];

  return data.results
    .filter((item) => item.media_type === "movie" || item.media_type === "tv")
    .map(normalizeListItem);
}

// ============================================================
// POPULAR
// ============================================================

interface TmdbPaginatedResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

/**
 * جلب الأفلام الشائعة
 */
export async function getPopularMovies(
  page = 1
): Promise<TmdbMediaListItem[]> {
  const data = await tmdbFetch<TmdbPaginatedResponse<TmdbMovie>>(
    "/movie/popular",
    { page: String(page) }
  );
  if (!data) return [];

  return data.results.map((item) =>
    normalizeListItem({ ...item, media_type: "movie" } as TmdbSearchResult)
  );
}

/**
 * جلب المسلسلات الشائعة
 */
export async function getPopularTvShows(
  page = 1
): Promise<TmdbMediaListItem[]> {
  const data = await tmdbFetch<TmdbPaginatedResponse<TmdbTvShow>>(
    "/tv/popular",
    { page: String(page) }
  );
  if (!data) return [];

  return data.results.map((item) =>
    normalizeListItem({ ...item, media_type: "tv" } as TmdbSearchResult)
  );
}

/**
 * جلب الأفلام الأعلى تقييماً
 */
export async function getTopRatedMovies(
  page = 1
): Promise<TmdbMediaListItem[]> {
  const data = await tmdbFetch<TmdbPaginatedResponse<TmdbMovie>>(
    "/movie/top_rated",
    { page: String(page) }
  );
  if (!data) return [];

  return data.results.map((item) =>
    normalizeListItem({ ...item, media_type: "movie" } as TmdbSearchResult)
  );
}

/**
 * جلب المسلسلات الأعلى تقييماً
 */
export async function getTopRatedTvShows(
  page = 1
): Promise<TmdbMediaListItem[]> {
  const data = await tmdbFetch<TmdbPaginatedResponse<TmdbTvShow>>(
    "/tv/top_rated",
    { page: String(page) }
  );
  if (!data) return [];

  return data.results.map((item) =>
    normalizeListItem({ ...item, media_type: "tv" } as TmdbSearchResult)
  );
}

/**
 * جلب الأفلام المعروضة حالياً في السينما
 */
export async function getNowPlayingMovies(
  page = 1
): Promise<TmdbMediaListItem[]> {
  const data = await tmdbFetch<TmdbPaginatedResponse<TmdbMovie>>(
    "/movie/now_playing",
    { page: String(page) }
  );
  if (!data) return [];

  return data.results.map((item) =>
    normalizeListItem({ ...item, media_type: "movie" } as TmdbSearchResult)
  );
}

/**
 * جلب المسلسلات التي تعرض حالياً
 */
export async function getAiringTodayTv(
  page = 1
): Promise<TmdbMediaListItem[]> {
  const data = await tmdbFetch<TmdbPaginatedResponse<TmdbTvShow>>(
    "/tv/airing_today",
    { page: String(page) }
  );
  if (!data) return [];

  return data.results.map((item) =>
    normalizeListItem({ ...item, media_type: "tv" } as TmdbSearchResult)
  );
}

/**
 * جلب الأفلام القادمة
 */
export async function getUpcomingMovies(
  page = 1
): Promise<TmdbMediaListItem[]> {
  const data = await tmdbFetch<TmdbPaginatedResponse<TmdbMovie>>(
    "/movie/upcoming",
    { page: String(page) }
  );
  if (!data) return [];

  return data.results.map((item) =>
    normalizeListItem({ ...item, media_type: "movie" } as TmdbSearchResult)
  );
}

// ============================================================
// SEARCH
// ============================================================

/**
 * بحث شامل في الأفلام والمسلسلات
 */
export async function searchMulti(
  query: string,
  page = 1
): Promise<TmdbMediaListItem[]> {
  if (!query.trim()) return [];

  const data = await tmdbFetch<TmdbPaginatedResponse<TmdbSearchResult>>(
    "/search/multi",
    { query, page: String(page) }
  );
  if (!data) return [];

  return data.results
    .filter((item) => item.media_type === "movie" || item.media_type === "tv")
    .map(normalizeListItem);
}

/**
 * بحث في الأفلام فقط
 */
export async function searchMovies(
  query: string,
  page = 1
): Promise<TmdbMediaListItem[]> {
  if (!query.trim()) return [];

  const data = await tmdbFetch<TmdbPaginatedResponse<TmdbMovie>>(
    "/search/movie",
    { query, page: String(page) }
  );
  if (!data) return [];

  return data.results.map((item) =>
    normalizeListItem({ ...item, media_type: "movie" } as TmdbSearchResult)
  );
}

/**
 * بحث في المسلسلات فقط
 */
export async function searchTvShows(
  query: string,
  page = 1
): Promise<TmdbMediaListItem[]> {
  if (!query.trim()) return [];

  const data = await tmdbFetch<TmdbPaginatedResponse<TmdbTvShow>>(
    "/search/tv",
    { query, page: String(page) }
  );
  if (!data) return [];

  return data.results.map((item) =>
    normalizeListItem({ ...item, media_type: "tv" } as TmdbSearchResult)
  );
}

// ============================================================
// DETAILS
// ============================================================

interface TmdbCreditsResponse {
  cast: TmdbPerson[];
  crew: TmdbPerson[];
}

interface TmdbVideosResponse {
  results: TmdbVideo[];
}

interface TmdbSimilarResponse<T> {
  results: T[];
}

/**
 * جلب تفاصيل فيلم كاملة
 */
export async function getMovieDetails(
  tmdbId: number
): Promise<TmdbMovieDetails | null> {
  const data = await tmdbFetch<TmdbMovieDetails>(`/movie/${tmdbId}`, {
    append_to_response: "credits,similar,videos",
  });
  return data;
}

/**
 * جلب تفاصيل مسلسل كاملة
 */
export async function getTvDetails(
  tmdbId: number
): Promise<TmdbTvDetails | null> {
  const data = await tmdbFetch<TmdbTvDetails>(`/tv/${tmdbId}`, {
    append_to_response: "credits,similar,videos",
  });
  return data;
}

/**
 * جلب تفاصيل موسم مسلسل
 */
export async function getSeasonDetails(
  tvId: number,
  seasonNumber: number
): Promise<TmdbSeasonDetails | null> {
  const data = await tmdbFetch<TmdbSeasonDetails>(
    `/tv/${tvId}/season/${seasonNumber}`
  );
  return data;
}

/**
 * جلب طاقم العمل لفيلم
 */
export async function getMovieCredits(
  tmdbId: number
): Promise<TmdbCreditsResponse | null> {
  return tmdbFetch<TmdbCreditsResponse>(`/movie/${tmdbId}/credits`);
}

/**
 * جلب طاقم العمل لمسلسل
 */
export async function getTvCredits(
  tmdbId: number
): Promise<TmdbCreditsResponse | null> {
  return tmdbFetch<TmdbCreditsResponse>(`/tv/${tmdbId}/credits`);
}

/**
 * جلب الأعمال المشابهة لفيلم
 */
export async function getMovieSimilar(
  tmdbId: number
): Promise<TmdbMediaListItem[]> {
  const data = await tmdbFetch<TmdbSimilarResponse<TmdbMovie>>(
    `/movie/${tmdbId}/similar`
  );
  if (!data) return [];

  return data.results.map((item) =>
    normalizeListItem({ ...item, media_type: "movie" } as TmdbSearchResult)
  );
}

/**
 * جلب الأعمال المشابهة لمسلسل
 */
export async function getTvSimilar(
  tmdbId: number
): Promise<TmdbMediaListItem[]> {
  const data = await tmdbFetch<TmdbSimilarResponse<TmdbTvShow>>(
    `/tv/${tmdbId}/similar`
  );
  if (!data) return [];

  return data.results.map((item) =>
    normalizeListItem({ ...item, media_type: "tv" } as TmdbSearchResult)
  );
}

/**
 * جلب فيديوهات (تريلر) لفيلم
 */
export async function getMovieVideos(
  tmdbId: number
): Promise<TmdbVideo[]> {
  const data = await tmdbFetch<TmdbVideosResponse>(`/movie/${tmdbId}/videos`);
  return data?.results || [];
}

/**
 * جلب فيديوهات (تريلر) لمسلسل
 */
export async function getTvVideos(tmdbId: number): Promise<TmdbVideo[]> {
  const data = await tmdbFetch<TmdbVideosResponse>(`/tv/${tmdbId}/videos`);
  return data?.results || [];
}

// ============================================================
// GENRES
// ============================================================

interface TmdbGenresResponse {
  genres: TmdbGenre[];
}

/**
 * جلب قائمة تصنيفات الأفلام
 */
export async function getMovieGenres(): Promise<TmdbGenre[]> {
  const data = await tmdbFetch<TmdbGenresResponse>("/genre/movie/list");
  return data?.genres || [];
}

/**
 * جلب قائمة تصنيفات المسلسلات
 */
export async function getTvGenres(): Promise<TmdbGenre[]> {
  const data = await tmdbFetch<TmdbGenresResponse>("/genre/tv/list");
  return data?.genres || [];
}

/**
 * جلب الأفلام حسب التصنيف
 */
export async function getMoviesByGenre(
  genreId: number,
  page = 1
): Promise<TmdbMediaListItem[]> {
  const data = await tmdbFetch<TmdbPaginatedResponse<TmdbMovie>>(
    "/discover/movie",
    {
      with_genres: String(genreId),
      page: String(page),
      sort_by: "popularity.desc",
    }
  );
  if (!data) return [];

  return data.results.map((item) =>
    normalizeListItem({ ...item, media_type: "movie" } as TmdbSearchResult)
  );
}

/**
 * جلب المسلسلات حسب التصنيف
 */
export async function getTvByGenre(
  genreId: number,
  page = 1
): Promise<TmdbMediaListItem[]> {
  const data = await tmdbFetch<TmdbPaginatedResponse<TmdbTvShow>>(
    "/discover/tv",
    {
      with_genres: String(genreId),
      page: String(page),
      sort_by: "popularity.desc",
    }
  );
  if (!data) return [];

  return data.results.map((item) =>
    normalizeListItem({ ...item, media_type: "tv" } as TmdbSearchResult)
  );
}

/**
 * اكتشاف المحتوى مع فلاتر متقدمة
 * @param mediaType - 'movie' أو 'tv'
 * @param options - خيارات الفلترة والترتيب
 */
export async function discoverMedia(
  mediaType: "movie" | "tv",
  options: {
    page?: number;
    sortBy?: string;
    genreId?: number;
    year?: number;
  } = {}
): Promise<{ results: TmdbMediaListItem[]; totalPages: number; totalResults: number }> {
  const { page = 1, sortBy = "popularity.desc", genreId, year } = options;
  const params: Record<string, string> = {
    page: String(page),
    sort_by: sortBy,
  };

  if (genreId) {
    params.with_genres = String(genreId);
  }

  if (year) {
    if (mediaType === "movie") {
      params.primary_release_year = String(year);
    } else {
      params.first_air_date_year = String(year);
    }
  }

  const endpoint = mediaType === "movie" ? "/discover/movie" : "/discover/tv";
  const data = await tmdbFetch<TmdbPaginatedResponse<TmdbMovie | TmdbTvShow>>(
    endpoint,
    params
  );

  if (!data) return { results: [], totalPages: 0, totalResults: 0 };

  return {
    results: data.results.map((item) =>
      normalizeListItem({ ...item, media_type: mediaType } as TmdbSearchResult)
    ),
    totalPages: data.total_pages,
    totalResults: data.total_results,
  };
}

// ============================================================
// NORMALIZATION HELPERS
// ============================================================

/**
 * تحويل بيانات TMDB الخام إلى تنسيق موحد
 */
function normalizeListItem(item: TmdbSearchResult): TmdbMediaListItem {
  const title = item.media_type === "tv" ? item.name : item.title;
  const originalTitle =
    item.media_type === "tv" ? item.original_name : item.original_title;
  const date = item.media_type === "tv" ? item.first_air_date : item.release_date;
  const year = date ? new Date(date).getFullYear() : 0;

  return {
    id: item.id,
    tmdbId: item.id,
    title: title || "بدون عنوان",
    originalTitle: originalTitle || "",
    year,
    rating: item.vote_average || 0,
    mediaType: item.media_type === "tv" ? "SERIES" : "MOVIE",
    posterPath: item.poster_path,
    backdropPath: item.backdrop_path,
    posterUrl: TMDB_IMAGE.poster(item.poster_path),
    backdropUrl: TMDB_IMAGE.backdrop(item.backdrop_path),
    overview: item.overview || "",
    genreIds: item.genre_ids || [],
  };
}

// ============================================================
// FETCH AND SAVE TO DATABASE
// ============================================================

/**
 * جلب فيلم من TMDB وتحويله لصيغة قابلة للحفظ في الداتا بيز
 */
export async function fetchMovieForDB(tmdbId: number) {
  const details = await getMovieDetails(tmdbId);
  if (!details) return null;

  return {
    tmdbId: details.id,
    title: details.title || "",
    titleAr: details.title || "",
    overview: details.overview || "",
    posterUrl: details.poster_path || "",
    backdropUrl: details.backdrop_path || "",
    mediaType: "MOVIE" as const,
    releaseDate: details.release_date || "",
    rating: details.vote_average || 0,
    voteCount: details.vote_count || 0,
    genres: JSON.stringify(
      details.genres?.map((g) => g.name) || []
    ),
    runtime: details.runtime || null,
    seasonsCount: 0,
    status: details.status || "RELEASED",
  };
}

/**
 * جلب مسلسل من TMDB وتحويله لصيغة قابلة للحفظ في الداتا بيز
 */
export async function fetchTvForDB(tmdbId: number) {
  const details = await getTvDetails(tmdbId);
  if (!details) return null;

  return {
    tmdbId: details.id,
    title: details.name || "",
    titleAr: details.name || "",
    overview: details.overview || "",
    posterUrl: details.poster_path || "",
    backdropUrl: details.backdrop_path || "",
    mediaType: "SERIES" as const,
    releaseDate: details.first_air_date || "",
    rating: details.vote_average || 0,
    voteCount: details.vote_count || 0,
    genres: JSON.stringify(
      details.genres?.map((g) => g.name) || []
    ),
    runtime: null,
    seasonsCount: details.number_of_seasons || 0,
    status: details.status || "RELEASED",
  };
}
