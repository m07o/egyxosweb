// ============================================================
// CinemaPlus - TMDB API Types
// ============================================================

// ── Base Media Types ───────────────────────────────────────

export interface TmdbGenre {
  id: number;
  name: string;
}

// ── Movie Types ────────────────────────────────────────────

export interface TmdbMovie {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  popularity: number;
  genre_ids: number[];
  adult: boolean;
  original_language: string;
  video: boolean;
}

export interface TmdbMovieDetails extends TmdbMovie {
  budget: number;
  revenue: number;
  runtime: number;
  status: string;
  tagline: string;
  genres: TmdbGenre[];
  production_companies: Array<{
    id: number;
    name: string;
    logo_path: string | null;
  }>;
  production_countries: Array<{
    iso_3166_1: string;
    name: string;
  }>;
  spoken_languages: Array<{
    english_name: string;
    iso_639_1: string;
    name: string;
  }>;
  credits?: TmdbCredits;
  similar?: { results: TmdbMovie[] };
  videos?: { results: TmdbVideo[] };
}

// ── TV Types ───────────────────────────────────────────────

export interface TmdbTvShow {
  id: number;
  name: string;
  original_name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date: string;
  vote_average: number;
  vote_count: number;
  popularity: number;
  genre_ids: number[];
  origin_country: string[];
  original_language: string;
}

export interface TmdbTvDetails extends TmdbTvShow {
  created_by: Array<{
    id: number;
    name: string;
    profile_path: string | null;
  }>;
  episode_run_time: number[];
  genres: TmdbGenre[];
  homepage: string;
  in_production: boolean;
  languages: string[];
  last_air_date: string;
  last_episode_to_air: TmdbEpisode | null;
  next_episode_to_air: TmdbEpisode | null;
  networks: Array<{
    id: number;
    name: string;
    logo_path: string | null;
    origin_country: string;
  }>;
  number_of_episodes: number;
  number_of_seasons: number;
  production_companies: Array<{
    id: number;
    name: string;
    logo_path: string | null;
  }>;
  seasons: TmdbSeason[];
  status: string;
  type: string;
  credits?: TmdbCredits;
  similar?: { results: TmdbTvShow[] };
  videos?: { results: TmdbVideo[] };
}

// ── Season & Episode Types ─────────────────────────────────

export interface TmdbSeason {
  id: number;
  name: string;
  season_number: number;
  episode_count: number;
  overview: string;
  poster_path: string | null;
  air_date: string | null;
}

export interface TmdbEpisode {
  id: number;
  name: string;
  overview: string;
  episode_number: number;
  season_number: number;
  still_path: string | null;
  air_date: string | null;
  vote_average: number;
  vote_count: number;
  runtime: number;
}

export interface TmdbSeasonDetails {
  id: number;
  name: string;
  season_number: number;
  episodes: TmdbEpisode[];
  overview: string;
  poster_path: string | null;
  air_date: string | null;
}

// ── Person / Credits Types ─────────────────────────────────

export interface TmdbPerson {
  id: number;
  name: string;
  character?: string;
  profile_path: string | null;
  order?: number;
  department?: string;
  job?: string;
  known_for_department?: string;
}

export interface TmdbCredits {
  cast: TmdbPerson[];
  crew: TmdbPerson[];
}

// ── Video Types ────────────────────────────────────────────

export interface TmdbVideo {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
  official: boolean;
  published_at: string;
}

// ── Search Result (Multi) ──────────────────────────────────

export interface TmdbSearchResult {
  id: number;
  media_type: "movie" | "tv" | "person";
  title?: string;
  original_title?: string;
  name?: string;
  original_name?: string;
  overview?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average?: number;
  vote_count?: number;
  popularity?: number;
  genre_ids?: number[];
  adult?: boolean;
  original_language?: string;
  profile_path?: string | null;
  known_for?: Array<{
    id: number;
    media_type: "movie" | "tv";
    title?: string;
    name?: string;
    poster_path?: string | null;
  }>;
}

// ── Normalized Types (App-Level) ───────────────────────────

export interface TmdbMediaListItem {
  id: number;
  tmdbId: number;
  title: string;
  originalTitle: string;
  year: number;
  rating: number;
  mediaType: "MOVIE" | "SERIES";
  posterPath: string | null;
  backdropPath: string | null;
  posterUrl: string;
  backdropUrl: string;
  overview: string;
  genreIds: number[];
}
