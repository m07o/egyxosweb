'use client';

import { useCallback, useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, TrendingUp, Star, Film, Tv, Sparkles, X } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { allMediaItems, type MediaCard } from '@/lib/home-data';
import { Skeleton } from '@/components/ui/skeleton';

// ── Types ────────────────────────────────────────────────────

interface TmdbListItem {
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

interface SearchResponse {
  results: TmdbListItem[];
  page: number;
  totalPages: number;
  totalResults: number;
}

// ── Config ───────────────────────────────────────────────────

const filterTabs = [
  { key: 'all', label: 'الكل', icon: Sparkles },
  { key: 'movie', label: 'أفلام', icon: Film },
  { key: 'series', label: 'مسلسلات', icon: Tv },
] as const;

type FilterKey = (typeof filterTabs)[number]['key'];

const typeLabels: Record<string, string> = {
  movie: 'فيلم',
  series: 'مسلسل',
  anime: 'أنمي',
};

const typeBadgeColors: Record<string, string> = {
  movie: 'bg-blue-600/80',
  series: 'bg-purple-600/80',
  anime: 'bg-rose-600/80',
};

// ── Helpers ──────────────────────────────────────────────────

function mapType(mediaType: string): 'movie' | 'series' {
  const t = mediaType.toUpperCase();
  return t === 'SERIES' || t === 'TV' ? 'series' : 'movie';
}

function tmdbToMediaCard(item: TmdbListItem): MediaCard {
  return {
    id: item.id,
    title: item.title,
    originalTitle: item.originalTitle,
    year: item.year,
    rating: item.rating,
    poster: item.posterUrl || '/poster1.jpg',
    quality: '1080p',
    type: mapType(item.mediaType),
    tags: [],
  };
}

// ── Poster Card ──────────────────────────────────────────────

function PosterCard({ item }: { item: MediaCard }) {
  return (
    <Link href={`/details/${item.id}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        whileHover={{ scale: 1.05, y: -8 }}
        transition={{ duration: 0.3 }}
        className="group relative cursor-pointer overflow-hidden rounded-xl bg-[#12121a]"
      >
        <div className="relative aspect-[2/3] overflow-hidden">
          <Image
            src={item.poster}
            alt={item.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#12121a] via-transparent to-transparent opacity-80" />

          {item.rating > 0 && (
            <div className="absolute top-2 left-2 flex items-center gap-1 rounded-full bg-black/60 px-2 py-1 text-xs font-bold text-yellow-400 backdrop-blur-sm">
              <Star className="size-3 fill-yellow-400" />
              {item.rating.toFixed(1)}
            </div>
          )}

          <div className="absolute top-2 right-2 rounded-full bg-emerald-600/90 px-2 py-0.5 text-[10px] font-bold text-white">
            {item.quality}
          </div>

          <div className={`absolute bottom-2 right-2 rounded-full px-2 py-0.5 text-[10px] font-bold text-white ${typeBadgeColors[item.type] || 'bg-gray-600/80'}`}>
            {typeLabels[item.type] || typeLabels[item.type]}
          </div>
        </div>

        <div className="p-3">
          <h3 className="truncate text-sm font-bold text-white">{item.title}</h3>
          {item.originalTitle && (
            <p className="truncate text-xs text-gray-400">{item.originalTitle}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">{item.year}</p>
        </div>
      </motion.div>
    </Link>
  );
}

// ── Grid Skeleton ────────────────────────────────────────────

function SearchGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="aspect-[2/3] w-full rounded-xl bg-white/[0.08]" />
          <Skeleton className="h-4 w-3/4 rounded bg-white/[0.06]" />
          <Skeleton className="h-3 w-1/2 rounded bg-white/[0.06]" />
        </div>
      ))}
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // API search state
  const [apiResults, setApiResults] = useState<MediaCard[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [totalResults, setTotalResults] = useState(0);
  const [apiFailed, setApiFailed] = useState(false);

  // Auto-focus input on mount
  const autoFocusRef = useCallback((node: HTMLInputElement | null) => {
    if (node) node.focus();
  }, []);

  // API search when debounced query or filter changes
  useEffect(() => {
    if (!debouncedQuery) {
      void (async () => {
        setApiResults([]);
        setApiFailed(false);
      })();
      return;
    }

    let cancelled = false;

    void (async () => {
      setSearchLoading(true);
      setApiFailed(false);

      try {
        const params = new URLSearchParams();
        params.set('q', debouncedQuery);
        params.set('type', activeFilter);
        params.set('page', '1');

        const res = await fetch(`/api/tmdb/search?${params.toString()}`);
        if (!res.ok) throw new Error('Search API failed');
        const data: SearchResponse = await res.json();

        if (cancelled) return;

        if (data.results && data.results.length > 0) {
          setApiResults(data.results.map(tmdbToMediaCard));
          setTotalResults(data.totalResults || data.results.length);
        } else {
          setApiResults([]);
          setTotalResults(0);
        }
      } catch {
        if (!cancelled) {
          setApiFailed(true);
        }
      } finally {
        if (!cancelled) setSearchLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [debouncedQuery, activeFilter]);

  // Fallback search from dummy data
  const fallbackResults = apiFailed && debouncedQuery
    ? allMediaItems.filter((item) => {
        const lowerQuery = debouncedQuery.toLowerCase();
        return (
          item.title.toLowerCase().includes(lowerQuery) ||
          (item.originalTitle && item.originalTitle.toLowerCase().includes(lowerQuery))
        );
      }).filter((item) => {
        if (activeFilter === 'all') return true;
        return item.type === activeFilter;
      })
    : [];

  // Determine which results to show
  const displayResults = apiFailed && debouncedQuery ? fallbackResults : apiResults;
  const displayTotal = apiFailed && debouncedQuery ? fallbackResults.length : totalResults;

  // Trending suggestions (top rated items)
  const trendingSuggestions = allMediaItems
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 12);

  const handleClearSearch = useCallback(() => {
    setQuery('');
    setDebouncedQuery('');
    setApiResults([]);
    setApiFailed(false);
    inputRef.current?.focus();
  }, []);

  const isSearching = debouncedQuery.length > 0;
  const showLoading = searchLoading && isSearching;
  const showResults = !showLoading && isSearching && displayResults.length > 0;
  const showEmpty = !showLoading && isSearching && displayResults.length === 0;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 pb-20 pt-6 sm:px-6 lg:px-8">
        {/* Search Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 text-center"
        >
          <h1 className="mb-2 text-3xl font-bold sm:text-4xl">
            <span className="bg-gradient-to-l from-emerald-400 to-emerald-600 bg-clip-text text-transparent">
              ابحث
            </span>
          </h1>
          <p className="text-sm text-gray-400">ابحث عن أفلامك ومسلسلاتك المفضلة</p>
        </motion.div>

        {/* Search Input */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="relative mx-auto mb-6 max-w-2xl"
        >
          <div className="relative">
            <Search className="pointer-events-none absolute right-4 top-1/2 size-5 -translate-y-1/2 text-gray-500" />
            <input
              ref={inputRef}
              autoFocus
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                if (debounceTimer.current) clearTimeout(debounceTimer.current);
                debounceTimer.current = setTimeout(() => {
                  setDebouncedQuery(e.target.value.trim());
                }, 300);
              }}
              placeholder="اكتب اسم الفيلم أو المسلسل..."
              className="w-full rounded-xl border border-white/10 bg-[#12121a] py-4 pr-12 pl-12 text-base text-white placeholder-gray-500 outline-none transition-all duration-300 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20"
            />
            {query && (
              <button
                onClick={handleClearSearch}
                className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full p-1 text-gray-500 transition-colors hover:bg-white/10 hover:text-white"
              >
                <X className="size-5" />
              </button>
            )}
          </div>
        </motion.div>

        {/* Filter Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="mb-8 flex flex-wrap items-center justify-center gap-3"
        >
          {filterTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeFilter === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveFilter(tab.key)}
                className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-300 ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/25'
                    : 'bg-[#12121a] text-gray-400 hover:bg-[#1a1a2e] hover:text-white'
                }`}
              >
                <Icon className="size-4" />
                {tab.label}
              </button>
            );
          })}
        </motion.div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {showLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mb-4 flex items-center gap-2 text-sm text-gray-400">
                <Search className="size-4 animate-pulse" />
                <span>جارٍ البحث عن &quot;{debouncedQuery}&quot;...</span>
              </div>
              <SearchGridSkeleton />
            </motion.div>
          ) : showResults ? (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mb-4 flex items-center gap-2 text-sm text-gray-400">
                <Search className="size-4" />
                <span>
                  نتائج البحث عن &quot;{debouncedQuery}&quot; — {displayTotal} نتيجة
                </span>
                {apiFailed && (
                  <span className="text-xs text-amber-500">(نتائج محلية)</span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {displayResults.map((item) => (
                  <PosterCard key={item.id} item={item} />
                ))}
              </div>
            </motion.div>
          ) : showEmpty ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-20"
            >
              <div className="mb-4 flex size-20 items-center justify-center rounded-full bg-[#12121a]">
                <Search className="size-10 text-gray-600" />
              </div>
              <h3 className="mb-2 text-xl font-bold text-white">لا توجد نتائج</h3>
              <p className="text-sm text-gray-500">
                لم نتمكن من العثور على &quot;{debouncedQuery}&quot;. جرّب البحث بكلمات أخرى.
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="trending"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mb-4 flex items-center gap-2 text-sm text-gray-400">
                <TrendingUp className="size-4 text-emerald-500" />
                <span>الأكثر رواجاً</span>
              </div>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {trendingSuggestions.map((item) => (
                  <PosterCard key={item.id} item={item} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
}
