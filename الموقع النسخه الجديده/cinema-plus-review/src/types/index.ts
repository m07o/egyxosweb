export interface Movie {
  id: number
  title: string
  originalTitle?: string
  overview: string
  posterPath: string
  backdropPath: string
  releaseDate?: string
  voteAverage: number
  voteCount: number
  genreIds: number[]
  genres?: Genre[]
  mediaType: 'movie' | 'tv'
  popularity: number
  adult: boolean
  originalLanguage?: string
  quality?: string
  tags?: string[]
  runtime?: number
  seasons?: Season[]
  credits?: { cast: CastMember[]; crew: CrewMember[] }
  similar?: Movie[]
  downloadLinks?: DownloadLink[]
}

export interface Genre {
  id: number
  name: string
}

export interface CastMember {
  id: number
  name: string
  character: string
  profilePath: string | null
}

export interface CrewMember {
  id: number
  name: string
  job: string
  department: string
  profilePath: string | null
}

export interface Season {
  id: number
  seasonNumber: number
  name: string
  episodeCount: number
  airDate: string
  overview: string
  posterPath: string
  episodes?: Episode[]
}

export interface Episode {
  id: number
  seasonNumber: number
  episodeNumber: number
  name: string
  overview: string
  stillPath: string | null
  airDate: string
  runtime: number
}

export interface DownloadLink {
  quality: string
  size: string
  server: string
  url: string
}

export interface StreamingServer {
  id: string
  name: string
  url: string
  isActive: boolean
  order: number
  createdAt: string
}

export interface WatchlistItem {
  id: number
  mediaType: 'movie' | 'tv'
  title: string
  posterPath: string
  addedAt: number
}

export interface ContinueWatchingItem {
  id: number
  mediaType: 'movie' | 'tv'
  title: string
  posterPath: string
  progress: number
  lastWatched: number
}

export type PageView = 'home' | 'browse' | 'details' | 'watchlist' | 'admin'

export interface BrowseFilters {
  genre: number | null
  year: string | null
  quality: string | null
  sortBy: 'popularity' | 'rating' | 'date' | 'title'
  mediaType: 'movie' | 'tv' | 'anime' | 'all'
}
