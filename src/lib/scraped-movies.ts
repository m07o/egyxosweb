import type { Movie } from '@/types'

export interface ScrapedMovie {
  id: string
  title: string
  url: string
  imageUrl: string
  quality: string
  type: 'movie' | 'series' | 'anime'
}

interface MoviesData {
  timestamp: string
  source: string
  totalMovies: number
  movies: ScrapedMovie[]
  errors: string[]
}

let cachedMovies: MoviesData | null = null
let lastFetch = 0

export async function getScrapedMovies(): Promise<ScrapedMovie[]> {
  try {
    // Cache لمدة 5 دقائق
    if (cachedMovies && Date.now() - lastFetch < 5 * 60 * 1000) {
      return cachedMovies.movies
    }

    const response = await fetch('/movies.json', { cache: 'no-store' })
    if (!response.ok) {
      console.warn('Failed to fetch movies.json')
      return []
    }

    cachedMovies = await response.json()
    lastFetch = Date.now()
    return cachedMovies.movies || []
  } catch (error) {
    console.error('Error loading scraped movies:', error)
    return []
  }
}

export async function searchScraped(query: string): Promise<ScrapedMovie[]> {
  const scraped = await getScrapedMovies()
  return scraped.filter((movie) =>
    movie.title.toLowerCase().includes(query.toLowerCase())
  )
}
