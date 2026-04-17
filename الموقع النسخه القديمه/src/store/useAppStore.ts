import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { PageView, WatchlistItem, ContinueWatchingItem, BrowseFilters, Movie } from '@/types'

interface AppState {
  // Navigation
  currentPage: PageView
  selectedMovieId: number | null
  selectedMediaType: 'movie' | 'tv'
  navigateTo: (page: PageView, id?: number, type?: 'movie' | 'tv') => void

  // Search
  isSearchOpen: boolean
  searchQuery: string
  searchResults: Movie[]
  isSearching: boolean
  setSearchOpen: (open: boolean) => void
  setSearchQuery: (query: string) => void
  setSearchResults: (results: Movie[]) => void
  setIsSearching: (searching: boolean) => void

  // Watchlist
  watchlist: WatchlistItem[]
  addToWatchlist: (item: WatchlistItem) => void
  removeFromWatchlist: (id: number) => void
  isInWatchlist: (id: number) => boolean

  // Continue Watching
  continueWatching: ContinueWatchingItem[]
  updateProgress: (item: ContinueWatchingItem) => void
  removeFromContinueWatching: (id: number) => void

  // Browse Filters
  filters: BrowseFilters
  setFilters: (filters: Partial<BrowseFilters>) => void
  resetFilters: () => void

  // Admin
  isAdminOpen: boolean
  setAdminOpen: (open: boolean) => void
}

const defaultFilters: BrowseFilters = {
  genre: null,
  year: null,
  quality: null,
  sortBy: 'popularity',
  mediaType: 'all',
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Navigation
      currentPage: 'home',
      selectedMovieId: null,
      selectedMediaType: 'movie',
      navigateTo: (page, id, type) => {
        set({
          currentPage: page,
          selectedMovieId: id ?? null,
          selectedMediaType: type ?? 'movie',
        })
        window.scrollTo({ top: 0, behavior: 'smooth' })
      },

      // Search
      isSearchOpen: false,
      searchQuery: '',
      searchResults: [],
      isSearching: false,
      setSearchOpen: (open) => set({ isSearchOpen: open, searchQuery: open ? get().searchQuery : '', searchResults: open ? get().searchResults : [] }),
      setSearchQuery: (query) => set({ searchQuery: query }),
      setSearchResults: (results) => set({ searchResults: results }),
      setIsSearching: (searching) => set({ isSearching: searching }),

      // Watchlist
      watchlist: [],
      addToWatchlist: (item) => {
        const exists = get().watchlist.some((w) => w.id === item.id)
        if (!exists) {
          set({ watchlist: [...get().watchlist, { ...item, addedAt: Date.now() }] })
        }
      },
      removeFromWatchlist: (id) => {
        set({ watchlist: get().watchlist.filter((w) => w.id !== id) })
      },
      isInWatchlist: (id) => {
        return get().watchlist.some((w) => w.id === id)
      },

      // Continue Watching
      continueWatching: [],
      updateProgress: (item) => {
        const exists = get().continueWatching.some((c) => c.id === item.id)
        if (exists) {
          set({
            continueWatching: get().continueWatching.map((c) =>
              c.id === item.id ? { ...item, lastWatched: Date.now() } : c
            ),
          })
        } else {
          set({
            continueWatching: [
              ...get().continueWatching,
              { ...item, lastWatched: Date.now() },
            ],
          })
        }
      },
      removeFromContinueWatching: (id) => {
        set({ continueWatching: get().continueWatching.filter((c) => c.id !== id) })
      },

      // Browse Filters
      filters: defaultFilters,
      setFilters: (newFilters) => {
        set({ filters: { ...get().filters, ...newFilters } })
      },
      resetFilters: () => set({ filters: defaultFilters }),

      // Admin
      isAdminOpen: false,
      setAdminOpen: (open) => set({ isAdminOpen: open }),
    }),
    {
      name: 'cinema-plus-storage',
      partialize: (state) => ({
        watchlist: state.watchlist,
        continueWatching: state.continueWatching,
      }),
    }
  )
)
