'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import ContentSlider from '@/components/ContentSlider';
import Footer from '@/components/Footer';
import { homeSections, heroSlides, type MediaCard, type HomeSection, type HeroSlide } from '@/lib/home-data';
import { useStore } from '@/lib/store';
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

interface HomeApiResponse {
  hero?: TmdbListItem[];
  trending?: TmdbListItem[];
  nowPlaying?: TmdbListItem[];
  popularMovies?: TmdbListItem[];
  popularTv?: TmdbListItem[];
  topRatedMovies?: TmdbListItem[];
  topRatedTv?: TmdbListItem[];
  upcoming?: TmdbListItem[];
}

// ── Helpers ──────────────────────────────────────────────────

function mapType(mediaType: string): 'movie' | 'series' {
  const t = mediaType.toUpperCase();
  return t === 'SERIES' || t === 'TV' ? 'series' : 'movie';
}

function toHeroSlide(item: TmdbListItem): HeroSlide {
  return {
    id: item.id,
    title: item.title,
    originalTitle: item.originalTitle || '',
    story: item.overview || '',
    backdrop: item.backdropUrl || '/backdrop.jpg',
    poster: item.posterUrl || '/poster1.jpg',
    year: item.year,
    rating: item.rating,
    quality: '1080p',
    genres: item.genreNames || [],
    tags: ['HD'],
    type: mapType(item.mediaType),
    duration: '',
    mediaId: item.id,
  };
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

const SECTION_CONFIG: { key: keyof HomeApiResponse; title: string; slug: string }[] = [
  { key: 'trending', title: 'الأكثر رواجاً', slug: 'trending' },
  { key: 'nowPlaying', title: 'يعرض حالياً', slug: 'now-playing' },
  { key: 'popularMovies', title: 'أفلام شائعة', slug: 'popular-movies' },
  { key: 'popularTv', title: 'مسلسلات شائعة', slug: 'popular-tv' },
  { key: 'topRatedMovies', title: 'أعلى الأفلام تقييماً', slug: 'top-rated-movies' },
  { key: 'topRatedTv', title: 'أعلى المسلسلات تقييماً', slug: 'top-rated-tv' },
  { key: 'upcoming', title: 'قادمة قريباً', slug: 'upcoming' },
];

// ── Skeleton Components ──────────────────────────────────────

function HeroSkeleton() {
  return (
    <div className="relative w-full h-[70vh] min-h-[500px] max-h-[800px] bg-[#12141a]">
      <Skeleton className="absolute inset-0 rounded-none bg-[#1a1d25]" />
      <div className="absolute bottom-16 sm:bottom-20 md:bottom-24 right-0 left-0 px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto">
        <div className="max-w-2xl space-y-4">
          <div className="flex gap-2">
            <Skeleton className="h-6 w-14 rounded-lg bg-white/10" />
            <Skeleton className="h-6 w-10 rounded-lg bg-white/10" />
          </div>
          <Skeleton className="h-12 w-3/4 rounded-lg bg-white/10" />
          <Skeleton className="h-4 w-1/2 rounded bg-white/10" />
          <div className="flex gap-3">
            <Skeleton className="h-4 w-16 rounded bg-white/10" />
            <Skeleton className="h-4 w-12 rounded bg-white/10" />
            <Skeleton className="h-4 w-20 rounded bg-white/10" />
          </div>
          <Skeleton className="h-4 w-full rounded bg-white/10" />
          <Skeleton className="h-4 w-2/3 rounded bg-white/10" />
          <div className="flex gap-3 pt-2">
            <Skeleton className="h-11 w-36 rounded-xl bg-white/10" />
            <Skeleton className="h-11 w-28 rounded-xl bg-white/10" />
          </div>
        </div>
      </div>
    </div>
  );
}

function SlidersSkeleton() {
  return (
    <div className="relative z-10 -mt-10 pb-8 space-y-8">
      {Array.from({ length: 4 }).map((_, i) => (
        <section key={i} className="py-4 sm:py-6">
          <div className="px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto mb-4">
            <Skeleton className="h-6 w-40 rounded bg-white/10" />
          </div>
          <div className="flex gap-3 sm:gap-4 overflow-hidden px-4 sm:px-6 lg:px-8">
            {Array.from({ length: 7 }).map((_, j) => (
              <Skeleton
                key={j}
                className="shrink-0 w-[140px] sm:w-[170px] md:w-[190px] lg:w-[210px] aspect-[2/3] rounded-xl bg-white/[0.08]"
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────

export default function HomePage() {
  const { continueWatching } = useStore();

  const [hydrated, setHydrated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [apiHero, setApiHero] = useState<HeroSlide[] | null>(null);
  const [apiSections, setApiSections] = useState<HomeSection[] | null>(null);

  // Hydrate zustand from localStorage on client
  useEffect(() => {
    useStore.persist.rehydrate();
    queueMicrotask(() => setHydrated(true));
  }, []);

  // Fetch home data from API
  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const res = await fetch('/api/tmdb/home');
        if (!res.ok) throw new Error('API failed');
        const data: HomeApiResponse = await res.json();

        if (cancelled) return;
        if (!data || typeof data !== 'object') throw new Error('Invalid response');

        // Map hero slides
        if (data.hero && data.hero.length > 0) {
          setApiHero(data.hero.map(toHeroSlide));
        }

        // Map content sections
        const sections: HomeSection[] = [];
        for (const config of SECTION_CONFIG) {
          const items = data[config.key];
          if (items && items.length > 0) {
            sections.push({
              id: config.slug,
              title: config.title,
              slug: config.slug,
              items: items.map(toMediaCard),
            });
          }
        }
        if (sections.length > 0) {
          setApiSections(sections);
        }
      } catch {
        // Silently fall back to dummy data
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // Use API data or fallback to dummy data
  const activeHeroSlides = apiHero || heroSlides;
  const activeSections = apiSections || homeSections;

  // Convert continueWatching items to MediaCard format
  const continueWatchingItems: MediaCard[] = continueWatching.map((item) => ({
    id: item.id,
    title: item.title,
    year: 0,
    rating: 0,
    poster: item.poster,
    quality: item.quality,
    type: item.type,
    tags: [],
  }));

  return (
    <div className="min-h-screen bg-[#0a0a0f]" dir="rtl">
      <Navbar />

      {/* Hero Section */}
      {loading ? (
        <HeroSkeleton />
      ) : (
        <HeroSection slides={activeHeroSlides} />
      )}

      {/* Content sections */}
      <main className="relative z-10 -mt-10 pb-8">
        {loading ? (
          <SlidersSkeleton />
        ) : (
          <>
            {/* Continue Watching */}
            {hydrated && continueWatchingItems.length > 0 && (
              <ContentSlider
                title="استكمال المشاهدة"
                items={continueWatchingItems}
              />
            )}

            {/* All sections */}
            {activeSections.map((section) => (
              <ContentSlider
                key={section.id}
                title={section.title}
                items={section.items}
                seeAllLink={`/browse?s=${section.slug}`}
              />
            ))}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
