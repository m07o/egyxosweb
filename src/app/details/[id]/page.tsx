'use client';

import { useState, useEffect, useSyncExternalStore, useCallback } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  Play,
  Heart,
  Star,
  Calendar,
  Clock,
  Download,
  Monitor,
  Subtitles,
  AlertTriangle,
  ChevronLeft,
  Users,
  Film,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ReportDialog from '@/components/ReportDialog';
import { movieDetails, seriesDetails, type MediaItem } from '@/lib/dummy-data';
import { useStore } from '@/lib/store';
import { allMediaItems } from '@/lib/home-data';
import { Skeleton } from '@/components/ui/skeleton';

// ── API Response Types ───────────────────────────────────────

interface StreamServer {
  id: string;
  name: string;
  url: string;
  type: string;
}

interface TmdbCastMember {
  id: number;
  name: string;
  character: string;
  photo: string;
  order: number;
}

interface TmdbSimilarItem {
  id: number;
  tmdbId: number;
  title: string;
  originalTitle: string;
  year: number;
  rating: number;
  mediaType: 'MOVIE' | 'SERIES';
  posterUrl: string;
  posterPath: string | null;
  overview: string;
  genreIds: number[];
}

interface TmdbEpisode {
  id: number;
  episode_number: number;
  name: string;
  overview: string;
  still_path: string;
  air_date: string;
  runtime: number;
  vote_average: number;
}

interface TmdbSeason {
  id: number;
  season_number: number;
  name: string;
  episode_count: number;
  poster_path: string;
  air_date: string;
  episodes: TmdbEpisode[];
}

interface DetailsApiResponse {
  details: {
    id: number;
    title: string;
    originalTitle: string;
    overview: string;
    posterUrl: string;
    backdropUrl: string;
    vote_average: number;
    release_date?: string;
    first_air_date?: string;
    runtime?: number;
    episode_run_time?: number[];
    number_of_seasons?: number;
    number_of_episodes?: number;
    status: string;
    genres: Array<{ id: number; name: string }>;
    production_countries: string[];
    tagline: string;
    type: 'movie' | 'series';
  };
  director: { name: string; photo: string } | null;
  cast: TmdbCastMember[];
  similar: TmdbSimilarItem[];
  videos: Array<{ id: string; key: string; name: string; site: string; type: string }>;
  trailerUrl: string | null;
  seasons: TmdbSeason[];
}

// ── Mapping Functions ────────────────────────────────────────

function mapType(mediaType: string): 'movie' | 'series' {
  const t = mediaType.toUpperCase();
  return t === 'SERIES' || t === 'TV' ? 'series' : 'movie';
}

function mapTmdbDetailsToMediaItem(data: DetailsApiResponse, id: number): MediaItem {
  const d = data.details;
  const isSeries = d.type === 'series';

  const year = d.release_date
    ? parseInt(d.release_date.substring(0, 4))
    : d.first_air_date
    ? parseInt(d.first_air_date.substring(0, 4))
    : 0;

  const duration = isSeries
    ? d.episode_run_time && d.episode_run_time.length > 0
      ? `${d.episode_run_time[0]} دقيقة لكل حلقة`
      : `${d.number_of_seasons || ''} مواسم`
    : d.runtime
    ? `${Math.floor(d.runtime / 60)}س ${d.runtime % 60}د`
    : '';

  // Map cast
  const cast = data.cast.slice(0, 16).map((c) => ({
    id: c.id,
    name: c.name,
    character: c.character || '',
    photo: c.photo,
  }));

  // Map similar
  const similar = data.similar.slice(0, 12).map((item) => ({
    id: item.id,
    title: item.title,
    year: item.year,
    rating: item.rating,
    type: mapType(item.mediaType) as 'movie' | 'series' | 'anime',
    poster: item.posterUrl || '/poster1.jpg',
    quality: '1080p',
  }));

  // Map seasons
  const seasons = data.seasons
    .filter((s) => s.season_number > 0)
    .map((s) => ({
      id: s.id,
      seasonNumber: s.season_number,
      title: s.name || `الموسم ${s.season_number}`,
      episodeCount: s.episode_count || s.episodes.length,
      episodes: (s.episodes || []).map((ep, idx) => ({
        id: ep.id || idx + 1,
        episodeNumber: ep.episode_number,
        title: ep.name || `الحلقة ${ep.episode_number}`,
        thumbnail: ep.still_path || '/poster1.jpg',
        duration: ep.runtime > 0 ? `${ep.runtime} دقيقة` : '—',
        hasSubtitle: true,
      })),
    }));

  // Map genres
  const genres = d.genres.map((g) => g.name);

  // Map tags
  const tags: string[] = ['HD'];
  if (d.status === 'Released' || d.status === 'Ended' || d.status === 'Returning Series') {
    // status-based tags
  }
  if (d.production_countries && d.production_countries.length > 0) {
    // country info available
  }

  // Build default servers
  const servers = [
    {
      id: 1,
      name: 'سيرفر 1',
      provider: 'VidSrc',
      qualities: [
        { label: '1080p', value: '1080', size: '' },
        { label: '720p', value: '720', size: '' },
      ],
    },
    {
      id: 2,
      name: 'سيرفر 2',
      provider: 'VidSrc',
      qualities: [
        { label: '1080p', value: '1080', size: '' },
        { label: '720p', value: '720', size: '' },
      ],
    },
  ];

  return {
    id,
    tmdbId: d.id,
    title: d.title,
    originalTitle: d.originalTitle || '',
    year,
    rating: Math.round(d.vote_average * 10) / 10,
    duration,
    quality: '1080p',
    genres,
    countries: d.production_countries || [],
    story: d.overview || '',
    director: data.director?.name || '',
    directorPhoto: data.director?.photo || '',
    cast,
    backdrop: d.backdropUrl || '/backdrop.jpg',
    poster: d.posterUrl || '/poster1.jpg',
    trailerUrl: data.trailerUrl || '',
    servers,
    downloadLinks: [],
    similar,
    tags,
    isSeries,
    seasons,
    totalSeasons: d.number_of_seasons || seasons.length || undefined,
    status: isSeries
      ? d.status === 'Returning Series'
        ? 'مستمر'
        : d.status === 'Ended'
        ? 'مكتمل'
        : ''
      : undefined,
    airDate: d.first_air_date
      ? `${year}`
      : d.release_date
      ? `${year}`
      : undefined,
  };
}

// ── Fallback Helper ──────────────────────────────────────────

function generateFallbackDetails(id: number): MediaItem {
  const homeItem = allMediaItems.find((m) => m.id === id);
  const isSeries = homeItem?.isSeries ?? id % 2 === 0;
  const base = isSeries ? seriesDetails : movieDetails;
  return {
    ...base,
    id,
    title: homeItem?.title || base.title,
    originalTitle: homeItem?.originalTitle || base.originalTitle,
    year: homeItem?.year || base.year,
    rating: homeItem?.rating || base.rating,
    poster: homeItem?.poster || base.poster,
    backdrop: homeItem?.backdrop || base.backdrop,
    quality: homeItem?.quality || base.quality,
    genres: homeItem?.genres || base.genres,
    isSeries,
  };
}

function getMediaDetails(id: number): MediaItem {
  if (id === 1) return movieDetails;
  if (id === 2) return seriesDetails;
  return generateFallbackDetails(id);
}

// ── Tag color mapping ────────────────────────────────────────

const tagColors: Record<string, string> = {
  'جديد': 'bg-emerald-600',
  'حصري': 'bg-amber-600',
  'HD': 'bg-blue-600',
  'مميز': 'bg-purple-600',
  'كامل': 'bg-teal-600',
};

// ── Animation variants ───────────────────────────────────────

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.06 } },
};

// ── Skeleton Component ───────────────────────────────────────

function DetailsSkeleton() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Hero skeleton */}
      <div className="relative h-[50vh] min-h-[400px] w-full bg-[#12141a]">
        <Skeleton className="absolute inset-0 rounded-none bg-[#1a1d25]" />
      </div>
      <div className="relative -mt-40 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:gap-8">
          {/* Poster skeleton */}
          <Skeleton className="mx-auto md:mx-0 shrink-0 h-[300px] w-[200px] sm:h-[380px] sm:w-[250px] rounded-2xl bg-white/[0.08]" />
          {/* Info skeleton */}
          <div className="flex-1 space-y-4 text-center md:text-right">
            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
              <Skeleton className="h-6 w-16 rounded-full bg-white/[0.08]" />
              <Skeleton className="h-6 w-12 rounded-full bg-white/[0.08]" />
              <Skeleton className="h-6 w-20 rounded-full bg-white/[0.08]" />
            </div>
            <Skeleton className="h-10 w-3/4 rounded-lg bg-white/[0.08] mx-auto md:mx-0" />
            <Skeleton className="h-5 w-1/2 rounded bg-white/[0.08] mx-auto md:mx-0" />
            <div className="flex gap-4 justify-center md:justify-start">
              <Skeleton className="h-4 w-20 rounded bg-white/[0.08]" />
              <Skeleton className="h-4 w-24 rounded bg-white/[0.08]" />
              <Skeleton className="h-4 w-16 rounded bg-white/[0.08]" />
            </div>
            <div className="flex gap-2 justify-center md:justify-start">
              <Skeleton className="h-7 w-16 rounded-lg bg-white/[0.08]" />
              <Skeleton className="h-7 w-20 rounded-lg bg-white/[0.08]" />
              <Skeleton className="h-7 w-14 rounded-lg bg-white/[0.08]" />
            </div>
            <Skeleton className="h-4 w-full rounded bg-white/[0.08] mx-auto md:mx-0 max-w-2xl" />
            <Skeleton className="h-4 w-5/6 rounded bg-white/[0.08] mx-auto md:mx-0 max-w-2xl" />
            <div className="flex gap-3 justify-center md:justify-start pt-2">
              <Skeleton className="h-11 w-36 rounded-xl bg-white/[0.08]" />
              <Skeleton className="h-11 w-28 rounded-xl bg-white/[0.08]" />
            </div>
          </div>
        </div>
      </div>

      {/* Server skeleton */}
      <div className="mx-auto mt-12 max-w-7xl px-4 sm:px-6 lg:px-8">
        <Skeleton className="h-7 w-40 rounded bg-white/[0.08] mb-4" />
        <div className="flex gap-2 mb-4">
          <Skeleton className="h-10 w-24 rounded-lg bg-white/[0.08]" />
          <Skeleton className="h-10 w-24 rounded-lg bg-white/[0.08]" />
          <Skeleton className="h-10 w-24 rounded-lg bg-white/[0.08]" />
        </div>
        <Skeleton className="aspect-video w-full rounded-2xl bg-white/[0.06]" />
      </div>

      {/* Cast skeleton */}
      <div className="mx-auto mt-12 max-w-7xl px-4 sm:px-6 lg:px-8">
        <Skeleton className="h-7 w-40 rounded bg-white/[0.08] mb-4" />
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex shrink-0 flex-col items-center gap-2">
              <Skeleton className="h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-white/[0.08]" />
              <Skeleton className="h-4 w-16 rounded bg-white/[0.06]" />
              <Skeleton className="h-3 w-12 rounded bg-white/[0.06]" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────

export default function DetailsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = Number(params.id) || 1;

  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useStore();

  // States
  const [details, setDetails] = useState<MediaItem | null>(null);
  const [loading, setLoading] = useState(true);
  // UI States
  const [selectedServer, setSelectedServer] = useState('server1');
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [streamingServers, setStreamingServers] = useState<StreamServer[]>([]);

  // Hydration-safe using useSyncExternalStore
  const isHydrated = useSyncExternalStore(
    (onStoreChange) => { onStoreChange(); return () => {}; },
    () => true,
    () => false
  );

  const inWatchlist = isHydrated ? isInWatchlist(id) : false;

  // Fetch details from API
  useEffect(() => {
    let cancelled = false;

    void (async () => {
      setLoading(true);
      let fetched = false;

      // Determine type from search params or try both
      const typeParam = searchParams.get('type');
      const typesToTry = typeParam
        ? [typeParam.toLowerCase()]
        : ['movie', 'tv'];

      for (const type of typesToTry) {
        if (cancelled) return;
        try {
          const res = await fetch(`/api/tmdb/details/${id}?type=${type}`);
          if (!res.ok) continue;
          const data: DetailsApiResponse = await res.json();

          if (cancelled) return;
          if (!data || !data.details) continue;

          const mediaItem = mapTmdbDetailsToMediaItem(data, id);
          setDetails(mediaItem);
          setSelectedSeason(mediaItem.seasons[0]?.seasonNumber || 1);
          fetched = true;
          break;
        } catch {
          continue;
        }
      }

      // Fallback to dummy data
      if (!fetched && !cancelled) {
        const fallback = getMediaDetails(id);
        setDetails(fallback);
        setSelectedSeason(fallback.seasons[0]?.seasonNumber || 1);
      }

      if (!cancelled) setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [id, searchParams]);

  // Fetch streaming servers from API
  useEffect(() => {
    if (!details) return;
    let cancelled = false;

    void (async () => {
      try {
        const mediaTypeVal = details.isSeries ? 'tv' : 'movie';
 const res = await fetch(`/api/stream?tmdbId=${id}&mediaType=${mediaTypeVal}`);
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled) return;

        const serverList: StreamServer[] = data.servers || [];
        setStreamingServers(serverList);
        if (serverList.length > 0) {
          setSelectedServer(serverList[0].id);
        }
      } catch {
        // Streaming servers not available
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id, details?.isSeries]);

  const toggleWatchlist = useCallback(() => {
    if (!details) return;
    if (inWatchlist) {
      removeFromWatchlist(id);
    } else {
      addToWatchlist(details);
    }
  }, [inWatchlist, id, removeFromWatchlist, addToWatchlist, details]);

  const currentSeasonData = details?.seasons.find(
    (s) => s.seasonNumber === selectedSeason
  );

  const watchUrl = `/watch/${id}?server=${selectedServer}`;
  const episodeWatchUrl = (seasonNum: number, epNum: number) =>
    `/watch/${id}?season=${seasonNum}&episode=${epNum}&server=${selectedServer}`;

  // ── Loading state ──
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-white">
        <Navbar />
        <DetailsSkeleton />
        <Footer />
      </div>
    );
  }

  if (!details) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-white">
        <Navbar />
        <div className="flex items-center justify-center py-40">
          <p className="text-slate-400">لم يتم العثور على المحتوى</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <Navbar />

      {/* ── Hero / Backdrop Section ── */}
      <section className="relative">
        <div className="relative h-[50vh] min-h-[400px] w-full overflow-hidden sm:h-[60vh]">
          <Image
            src={details.backdrop}
            alt={details.title}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0f]/60 via-[#0a0a0f]/80 to-[#0a0a0f]" />
          <div className="absolute inset-0 bg-gradient-to-l from-transparent to-[#0a0a0f]/50" />
        </div>

        <div className="relative -mt-40 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:gap-8">
            {/* Poster */}
            <motion.div
              {...fadeInUp}
              transition={{ duration: 0.6 }}
              className="mx-auto shrink-0 md:mx-0"
            >
              <div className="relative h-[300px] w-[200px] overflow-hidden rounded-2xl shadow-2xl shadow-black/50 sm:h-[380px] sm:w-[250px]">
                <Image
                  src={details.poster}
                  alt={details.title}
                  fill
                  className="object-cover"
                  sizes="250px"
                  priority
                />
              </div>
            </motion.div>

            {/* Info */}
            <motion.div
              {...fadeInUp}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="flex-1 text-center md:text-right"
            >
              {/* Tags */}
              {details.tags.length > 0 && (
                <div className="mb-3 flex flex-wrap items-center justify-center gap-2 md:justify-start">
                  {details.tags.map((tag) => (
                    <span
                      key={tag}
                      className={`rounded-full px-3 py-1 text-xs font-bold text-white ${tagColors[tag] || 'bg-gray-600'}`}
                    >
                      {tag}
                    </span>
                  ))}
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white">
                    {details.quality}
                  </span>
                </div>
              )}

              {/* Title */}
              <h1 className="mb-1 text-3xl font-extrabold sm:text-4xl lg:text-5xl">
                {details.title}
              </h1>
              {details.originalTitle && (
                <p className="mb-4 text-base text-gray-400 sm:text-lg">{details.originalTitle}</p>
              )}

              {/* Meta */}
              <div className="mb-4 flex flex-wrap items-center justify-center gap-4 text-sm text-gray-300 md:justify-start">
                {details.year > 0 && (
                  <span className="flex items-center gap-1.5">
                    <Calendar className="size-4 text-emerald-500" />
                    {details.year}
                  </span>
                )}
                {details.duration && (
                  <span className="flex items-center gap-1.5">
                    <Clock className="size-4 text-emerald-500" />
                    {details.duration}
                  </span>
                )}
                {details.rating > 0 && (
                  <span className="flex items-center gap-1.5">
                    <Star className="size-4 fill-yellow-400 text-yellow-400" />
                    {details.rating.toFixed(1)}
                  </span>
                )}
                {details.isSeries && details.status && (
                  <span className="flex items-center gap-1.5">
                    <Film className="size-4 text-emerald-500" />
                    {details.status}
                  </span>
                )}
              </div>

              {/* Genres */}
              <div className="mb-5 flex flex-wrap items-center justify-center gap-2 md:justify-start">
                {details.genres.map((genre) => (
                  <span
                    key={genre}
                    className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-gray-300"
                  >
                    {genre}
                  </span>
                ))}
              </div>

              {/* Story */}
              <p className="mx-auto max-w-2xl text-sm leading-relaxed text-gray-400 md:mx-0 md:text-base">
                {details.story}
              </p>

              {/* Action Buttons */}
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3 md:justify-start">
                <Link
                  href={watchUrl}
                  className="flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white transition-all duration-300 hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-600/30"
                >
                  <Play className="size-5 fill-white" />
                  مشاهدة الآن
                </Link>
                <button
                  onClick={toggleWatchlist}
                  className={`flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition-all duration-300 ${
                    inWatchlist
                      ? 'bg-rose-600/20 text-rose-400 hover:bg-rose-600/30'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  <Heart className={`size-5 ${inWatchlist ? 'fill-rose-400' : ''}`} />
                  {inWatchlist ? 'في قائمتك' : 'أضف للمفضلة'}
                </button>
                <ReportDialog>
                  <button className="flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-medium text-gray-400 transition-colors hover:text-amber-400">
                    <AlertTriangle className="size-4" />
                    إبلاغ عن رابط معطل
                  </button>
                </ReportDialog>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Servers Section ── */}
      <section className="mx-auto mt-12 max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div {...fadeInUp} transition={{ duration: 0.5 }}>
          <h2 className="mb-4 flex items-center gap-2 text-xl font-bold">
            <Monitor className="size-5 text-emerald-500" />
            سيرفرات المشاهدة
          </h2>

          {/* Server Tabs */}
          <div className="mb-4 flex flex-wrap gap-2">
            {streamingServers.map((server) => (
              <Link
                key={server.id}
                href={`/watch/${id}?server=${server.id}`}
                className={`rounded-lg px-4 py-2.5 text-sm font-bold transition-all duration-300 ${
                  selectedServer === server.id
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                    : 'bg-[#12121a] text-gray-400 hover:bg-[#1a1a2e] hover:text-white'
                }`}
              >
                {server.name}
              </Link>
            ))}
            {streamingServers.length === 0 && (
              <span className="text-sm text-gray-500">جاري تحميل السيرفرات...</span>
            )}
          </div>

          {/* Player Placeholder */}
          <Link href={watchUrl}>
            <div className="group relative flex aspect-video items-center justify-center overflow-hidden rounded-2xl bg-[#0d0d15] border border-white/5 transition-all duration-300 hover:border-emerald-500/30">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/20 to-transparent" />
              <div className="flex flex-col items-center gap-3">
                <div className="flex size-16 items-center justify-center rounded-full bg-emerald-600/20 transition-all duration-300 group-hover:scale-110 group-hover:bg-emerald-600/30">
                  <Play className="size-8 fill-emerald-500 text-emerald-500" />
                </div>
                <span className="text-sm text-gray-400">اضغط لمشاهدة</span>
              </div>
            </div>
          </Link>
        </motion.div>
      </section>

      {/* ── Seasons & Episodes (Series Only) ── */}
      {details.isSeries && details.seasons.length > 0 && (
        <section className="mx-auto mt-12 max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeInUp} transition={{ duration: 0.5 }}>
            <h2 className="mb-4 flex items-center gap-2 text-xl font-bold">
              <Film className="size-5 text-emerald-500" />
              المواسم — {details.totalSeasons || details.seasons.length} موسم
            </h2>

            {/* Season Tabs */}
            <div className="mb-6 flex flex-wrap gap-2">
              {details.seasons.map((season) => (
                <button
                  key={season.id}
                  onClick={() => setSelectedSeason(season.seasonNumber)}
                  className={`rounded-lg px-4 py-2.5 text-sm font-bold transition-all duration-300 ${
                    selectedSeason === season.seasonNumber
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                      : 'bg-[#12121a] text-gray-400 hover:bg-[#1a1a2e] hover:text-white'
                  }`}
                >
                  {season.title}
                </button>
              ))}
            </div>

            {/* Episodes Grid */}
            {currentSeasonData && currentSeasonData.episodes.length > 0 ? (
              <motion.div
                variants={stagger}
                initial="initial"
                animate="animate"
                className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
              >
                {currentSeasonData.episodes.map((episode) => (
                  <motion.div key={episode.id} variants={fadeInUp}>
                    <Link href={episodeWatchUrl(selectedSeason, episode.episodeNumber)}>
                      <div className="group flex gap-3 overflow-hidden rounded-xl bg-[#12121a] p-3 transition-all duration-300 hover:bg-[#1a1a2e] hover:shadow-lg">
                        {/* Thumbnail */}
                        <div className="relative h-16 w-28 shrink-0 overflow-hidden rounded-lg">
                          <Image
                            src={episode.thumbnail}
                            alt={episode.title}
                            fill
                            className="object-cover"
                            sizes="112px"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity group-hover:opacity-100">
                            <Play className="size-5 fill-white text-white" />
                          </div>
                          {episode.duration && episode.duration !== '—' && (
                            <div className="absolute bottom-1 left-1 rounded bg-black/70 px-1.5 py-0.5 text-[10px] text-white">
                              {episode.duration}
                            </div>
                          )}
                        </div>
                        {/* Info */}
                        <div className="flex flex-col justify-center overflow-hidden">
                          <span className="text-xs font-bold text-emerald-400">
                            الحلقة {episode.episodeNumber}
                          </span>
                          <h4 className="truncate text-sm font-bold text-white">{episode.title}</h4>
                          <div className="mt-1 flex items-center gap-1">
                            {episode.hasSubtitle && (
                              <Subtitles className="size-3 text-gray-500" />
                            )}
                            <span className="text-xs text-gray-500">{episode.duration}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <div className="rounded-xl bg-[#12121a] p-8 text-center">
                <p className="text-sm text-gray-500">
                  لا تتوفر معلومات عن حلقات هذا الموسم حالياً
                </p>
              </div>
            )}
          </motion.div>
        </section>
      )}

      {/* ── Download Links Table ── */}
      {details.downloadLinks.length > 0 && (
        <section className="mx-auto mt-12 max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeInUp} transition={{ duration: 0.5 }}>
            <h2 className="mb-4 flex items-center gap-2 text-xl font-bold">
              <Download className="size-5 text-emerald-500" />
              روابط التحميل
            </h2>
            <div className="overflow-x-auto rounded-xl border border-white/5">
              <table className="w-full min-w-[500px]">
                <thead>
                  <tr className="border-b border-white/5 bg-[#12121a]">
                    <th className="px-4 py-3 text-right text-sm font-bold text-gray-300">الجودة</th>
                    <th className="px-4 py-3 text-right text-sm font-bold text-gray-300">الحجم</th>
                    <th className="px-4 py-3 text-right text-sm font-bold text-gray-300">السيرفر</th>
                    <th className="px-4 py-3 text-right text-sm font-bold text-gray-300">تحميل</th>
                  </tr>
                </thead>
                <tbody>
                  {details.downloadLinks.map((link, idx) => (
                    <tr
                      key={idx}
                      className="border-b border-white/5 transition-colors hover:bg-[#0f0f18]"
                    >
                      <td className="px-4 py-3 text-sm text-white">{link.quality}</td>
                      <td className="px-4 py-3 text-sm text-gray-400">{link.size}</td>
                      <td className="px-4 py-3 text-sm text-gray-400">{link.serverName}</td>
                      <td className="px-4 py-3">
                        <a
                          href={link.url}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600/20 px-4 py-2 text-xs font-bold text-emerald-400 transition-colors hover:bg-emerald-600/30"
                        >
                          <Download className="size-3.5" />
                          تحميل
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </section>
      )}

      {/* ── Cast Section ── */}
      {details.cast.length > 0 && (
        <section className="mx-auto mt-12 max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeInUp} transition={{ duration: 0.5 }}>
            <h2 className="mb-4 flex items-center gap-2 text-xl font-bold">
              <Users className="size-5 text-emerald-500" />
              طاقم التمثيل
            </h2>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
              {details.cast.map((member) => (
                <motion.div
                  key={member.id}
                  whileHover={{ y: -4 }}
                  className="flex shrink-0 flex-col items-center gap-2"
                >
                  <div className="relative h-20 w-20 overflow-hidden rounded-full border-2 border-white/10 sm:h-24 sm:w-24">
                    <Image
                      src={member.photo}
                      alt={member.name}
                      fill
                      className="object-cover"
                      sizes="96px"
                    />
                  </div>
                  <div className="w-20 text-center sm:w-24">
                    <p className="truncate text-xs font-bold text-white">{member.name}</p>
                    <p className="truncate text-[10px] text-gray-500">{member.character}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>
      )}

      {/* ── Similar Works ── */}
      {details.similar.length > 0 && (
        <section className="mx-auto mt-12 max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeInUp} transition={{ duration: 0.5 }}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-xl font-bold">
                <Film className="size-5 text-emerald-500" />
                أعمال مشابهة
              </h2>
              <Link
                href="/search"
                className="text-sm text-emerald-400 transition-colors hover:text-emerald-300"
              >
                عرض الكل
              </Link>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
              {details.similar.map((item) => (
                <Link key={item.id} href={`/details/${item.id}`}>
                  <motion.div
                    whileHover={{ y: -6, scale: 1.03 }}
                    className="shrink-0 cursor-pointer"
                  >
                    <div className="relative h-[220px] w-[150px] overflow-hidden rounded-xl sm:h-[260px] sm:w-[175px]">
                      <Image
                        src={item.poster}
                        alt={item.title}
                        fill
                        className="object-cover"
                        sizes="175px"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                      {item.rating > 0 && (
                        <div className="absolute top-2 left-2 flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-bold text-yellow-400 backdrop-blur-sm">
                          <Star className="size-3 fill-yellow-400" />
                          {item.rating.toFixed(1)}
                        </div>
                      )}
                      <div className="absolute bottom-0 right-0 left-0 p-3">
                        <p className="truncate text-xs font-bold text-white">{item.title}</p>
                        <p className="text-[10px] text-gray-400">{item.year}</p>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          </motion.div>
        </section>
      )}

      {/* ── Trailer Section ── */}
      {details.trailerUrl && (
        <section className="mx-auto mt-12 max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
          <motion.div {...fadeInUp} transition={{ duration: 0.5 }}>
            <h2 className="mb-4 flex items-center gap-2 text-xl font-bold">
              <Play className="size-5 text-emerald-500" />
              العارض
            </h2>
            <div className="relative aspect-video overflow-hidden rounded-2xl border border-white/5">
              <iframe
                src={details.trailerUrl}
                title={`عارض ${details.title}`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 h-full w-full"
              />
            </div>
          </motion.div>
        </section>
      )}

      <Footer />
    </div>
  );
}
