import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { MediaItem } from "@/lib/dummy-data";

// ── Types ───────────────────────────────────────────────────────────────────

export interface ContinueWatchingItem {
  id: number;
  tmdbId: number;
  title: string;
  poster: string;
  type: "movie" | "series" | "anime";
  progress: number; // 0-100 percentage
  currentSeason?: number;
  currentEpisode?: number;
  duration?: string;
  updatedAt: string; // ISO date string
  quality: string;
}

export interface HistoryItem {
  id: number;
  tmdbId: number;
  title: string;
  poster: string;
  type: "movie" | "series" | "anime";
  watchedAt: string; // ISO date string
}

// ── Store shape ─────────────────────────────────────────────────────────────

interface CimaPlusStore {
  // Watchlist (المفضلة)
  watchlist: MediaItem[];
  addToWatchlist: (item: MediaItem) => void;
  removeFromWatchlist: (id: number) => void;
  isInWatchlist: (id: number) => boolean;

  // Continue Watching (استكمال المشاهدة)
  continueWatching: ContinueWatchingItem[];
  updateContinueWatching: (item: ContinueWatchingItem) => void;
  removeContinueWatching: (id: number) => void;
  clearContinueWatching: () => void;

  // History
  watchHistory: HistoryItem[];
  addToHistory: (item: HistoryItem) => void;
}

// ── Store ───────────────────────────────────────────────────────────────────

export const useStore = create<CimaPlusStore>()(
  persist(
    (set, get) => ({
      // ── Watchlist ───────────────────────────────────────────────────────

      watchlist: [],

      addToWatchlist: (item: MediaItem) => {
        const { watchlist } = get();
        if (watchlist.some((w) => w.id === item.id)) return;
        set({ watchlist: [...watchlist, item] });
      },

      removeFromWatchlist: (id: number) => {
        set({ watchlist: get().watchlist.filter((w) => w.id !== id) });
      },

      isInWatchlist: (id: number) => {
        return get().watchlist.some((w) => w.id === id);
      },

      // ── Continue Watching ───────────────────────────────────────────────

      continueWatching: [],

      updateContinueWatching: (item: ContinueWatchingItem) => {
        const { continueWatching } = get();
        const existingIndex = continueWatching.findIndex(
          (c) => c.id === item.id
        );

        if (existingIndex !== -1) {
          // Update existing entry
          const updated = [...continueWatching];
          updated[existingIndex] = {
            ...item,
            updatedAt: new Date().toISOString(),
          };
          // Sort by most recently updated
          updated.sort(
            (a, b) =>
              new Date(b.updatedAt).getTime() -
              new Date(a.updatedAt).getTime()
          );
          set({ continueWatching: updated });
        } else {
          // Add new entry
          const newEntry = {
            ...item,
            updatedAt: new Date().toISOString(),
          };
          set({
            continueWatching: [newEntry, ...continueWatching],
          });
        }
      },

      removeContinueWatching: (id: number) => {
        set({
          continueWatching: get().continueWatching.filter(
            (c) => c.id !== id
          ),
        });
      },

      clearContinueWatching: () => {
        set({ continueWatching: [] });
      },

      // ── History ─────────────────────────────────────────────────────────

      watchHistory: [],

      addToHistory: (item: HistoryItem) => {
        const { watchHistory } = get();
        // Remove duplicate if it exists, then prepend the new entry
        const filtered = watchHistory.filter((h) => h.id !== item.id);
        const newHistory = [item, ...filtered].slice(0, 100); // Keep last 100
        set({ watchHistory: newHistory });
      },
    }),
    {
      name: "cima-plus-store",
      // Only persist these keys to localStorage
      partialize: (state) => ({
        watchlist: state.watchlist,
        continueWatching: state.continueWatching,
        watchHistory: state.watchHistory,
      }),
      // Gracefully handle SSR — only hydrate on the client
      skipHydration: true,
    }
  )
);
