'use client';

import { useState, useEffect, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import MediaCardComponent from '@/components/MediaCard';
import Footer from '@/components/Footer';
import { allMediaItems, type MediaCard } from '@/lib/home-data';
import { Skeleton } from '@/components/ui/skeleton';

// ── Types ────────────────────────────────────────────────────

interface TmdbGenre {
  id: number;
  name: string;
}

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

interface GenresResponse {
  movieGenres: TmdbGenre[];
  tvGenres: TmdbGenre[];
}

interface DiscoverResponse {
  results: TmdbListItem[];
  page: number;
  totalPages: number;
  totalResults: number;
}

// ── Filter Configs ───────────────────────────────────────────

const typeFilters = [
  { value: 'all', label: 'الكل' },
  { value: 'movie', label: 'أفلام' },
  { value: 'series', label: 'مسلسلات' },
];

const yearFilters = [
  'الكل',
  ...Array.from({ length: 16 }, (_, i) => String(2025 - i)),
];

const sortOptions = [
  { value: 'popularity.desc', label: 'الأكثر شعبية' },
  { value: 'newest', label: 'الأحدث' },
  { value: 'vote_average.desc', label: 'الأعلى تقييماً' },
  { value: 'revenue.desc', label: 'الأكثر إيرادات' },
];

// ── Helpers ──────────────────────────────────────────────────

function mapType(mediaType: string): 'movie' | 'series' {
  const t = mediaType.toUpperCase();
  return t === 'SERIES' || t === 'TV' ? 'series' : 'movie';
}

function toMediaCard(item: TmdbListItem): MediaCard {
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

// ── Skeleton Components ──────────────────────────────────────

function GridSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-5">
      {Array.from({ length: 15 }).map((_, i) => (
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

export default function BrowsePage() {
  const [type, setType] = useState<string>('all');
  const [genre, setGenre] = useState<string>('الكل');
  const [year, setYear] = useState<string>('الكل');
  const [sort, setSort] = useState<string>('popularity.desc');

  const [genres, setGenres] = useState<TmdbGenre[]>([]);
  const [genresLoading, setGenresLoading] = useState(true);
  const [results, setResults] = useState<MediaCard[]>([]);
  const [resultsLoading, setResultsLoading] = useState(true);
  const [totalResults, setTotalResults] = useState(0);
  const [useFallback, setUseFallback] = useState(false);

  // Fetch genres on mount
  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch('/api/tmdb/genres');
        if (!res.ok) throw new Error('Genres API failed');
        const data: GenresResponse = await res.json();

        // Merge movie and TV genres, deduplicate by id
        const genreMap = new Map<number, TmdbGenre>();
        for (const g of [...(data.movieGenres || []), ...(data.tvGenres || [])]) {
          if (!genreMap.has(g.id)) genreMap.set(g.id, g);
        }
        setGenres(Array.from(genreMap.values()).sort((a, b) => a.name.localeCompare(b.name, 'ar')));
      } catch {
        // Will use fallback
      } finally {
        setGenresLoading(false);
      }
    })();
  }, []);

  // Fetch discover results when filters change
  useEffect(() => {
    let cancelled = false;

    void (async () => {
      setResultsLoading(true);
      setUseFallback(false);
      try {
        const params = new URLSearchParams();
        params.set('type', type === 'all' ? 'movie' : type);
        params.set('sort', sort);
        params.set('page', '1');

        if (genre !== 'الكل') params.set('genreId', genre);
        if (year !== 'الكل') params.set('year', year);

        const res = await fetch(`/api/tmdb/discover?${params.toString()}`);
        if (!res.ok) throw new Error('Discover API failed');
        const data: DiscoverResponse = await res.json();

        if (cancelled) return;

        if (data.results && data.results.length > 0) {
          setResults(data.results.map(toMediaCard));
          setTotalResults(data.totalResults || data.results.length);
        } else {
          throw new Error('Empty results');
        }
      } catch {
        if (!cancelled) {
          setUseFallback(true);
          // Use dummy data as fallback
          let filtered = [...allMediaItems];
          if (type !== 'all') {
            filtered = filtered.filter((item) => item.type === type);
          }
          if (year !== 'الكل') {
            filtered = filtered.filter((item) => item.year === parseInt(year));
          }
          setResults(filtered);
          setTotalResults(filtered.length);
        }
      } finally {
        if (!cancelled) setResultsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [type, genre, year, sort]);

  const genreOptions = genres.length > 0 ? genres : [];

  return (
    <div className="min-h-screen bg-[#0a0a0f]" dir="rtl">
      <Navbar />

      <main className="pt-24 pb-12">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page title */}
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              تصفح المحتوى
            </h1>
            <p className="text-sm text-slate-500">
              اكتشف مجموعة واسعة من الأفلام والمسلسلات
            </p>
          </div>

          {/* Filter bar */}
          <div className="bg-[#12141a] border border-white/[0.06] rounded-2xl p-4 sm:p-5 mb-8 space-y-4">
            {/* Type filter */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                النوع
              </label>
              <div className="flex flex-wrap gap-2">
                {typeFilters.map((filter) => (
                  <button
                    key={filter.value}
                    onClick={() => setType(filter.value)}
                    className={`px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 ${
                      type === filter.value
                        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/30'
                        : 'bg-white/[0.05] text-slate-300 hover:bg-white/[0.1] border border-white/[0.06]'
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Filters row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Genre */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  التصنيف
                </label>
                {genresLoading ? (
                  <Skeleton className="h-10 w-full rounded-xl bg-white/[0.08]" />
                ) : genreOptions.length > 0 ? (
                  <select
                    value={genre}
                    onChange={(e) => setGenre(e.target.value)}
                    className="w-full h-10 px-3 bg-[#1a1d25] border border-white/[0.08] rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-colors appearance-none cursor-pointer"
                  >
                    <option value="الكل">الكل</option>
                    {genreOptions.map((g) => (
                      <option key={g.id} value={String(g.id)}>
                        {g.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="h-10 px-3 bg-[#1a1d25] border border-white/[0.08] rounded-xl flex items-center text-sm text-slate-500">
                    غير متوفر
                  </div>
                )}
              </div>

              {/* Year */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  السنة
                </label>
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full h-10 px-3 bg-[#1a1d25] border border-white/[0.08] rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-colors appearance-none cursor-pointer"
                >
                  {yearFilters.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  ترتيب حسب
                </label>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="w-full h-10 px-3 bg-[#1a1d25] border border-white/[0.08] rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-colors appearance-none cursor-pointer"
                >
                  {sortOptions.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Results count */}
          <div className="mb-6">
            <p className="text-sm text-slate-400">
              <span className="text-emerald-400 font-semibold">
                {resultsLoading ? '...' : totalResults}
              </span>{' '}
              نتيجة
            </p>
          </div>

          {/* Results grid */}
          {resultsLoading ? (
            <GridSkeleton />
          ) : results.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-5">
              {results.map((item) => (
                <MediaCardComponent
                  key={item.id}
                  id={item.id}
                  title={item.title}
                  year={item.year}
                  rating={item.rating}
                  poster={item.poster}
                  quality={item.quality}
                  type={item.type}
                  tags={item.tags}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mb-4">
                <svg
                  className="w-7 h-7 text-slate-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-300 mb-1">
                لا توجد نتائج
              </h3>
              <p className="text-sm text-slate-500 max-w-sm">
                لم يتم العثور على محتوى مطابق للفلاتر المحددة. جرب تغيير المعايير.
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
