'use client';

import { useState, useEffect, useCallback, useRef, useSyncExternalStore, Suspense } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Monitor,
  Play,
  Star,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import ReportDialog from '@/components/ReportDialog';

// ── Types ──

interface StreamServer {
  id: string;
  name: string;
  url: string;
  type: string;
}

// ── Animation variants ──

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

// ── Check if string is a pure numeric ID ──
function isNumericId(str: string): boolean {
  return /^\d+$/.test(str);
}

function WatchContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // URL param `id` can be a numeric TMDB ID or a slug
  const rawId = params.id as string;

  // Read URL search params
  const initialServer = searchParams.get('server') || 'server1';
  const initialSeason = Number(searchParams.get('season')) || 1;
  const initialEpisode = Number(searchParams.get('episode')) || 1;
  const mediaTypeParam = searchParams.get('mediaType') || 'movie';

  // State
  const [tmdbId, setTmdbId] = useState<number | null>(null);
  const [mediaType, setMediaType] = useState<string>(mediaTypeParam);
  const [movieTitle, setMovieTitle] = useState<string>('');
  const [servers, setServers] = useState<StreamServer[]>([]);
  const [selectedServer, setSelectedServer] = useState(initialServer);
  const [selectedSeason, setSelectedSeason] = useState(initialSeason);
  const [selectedEpisode, setSelectedEpisode] = useState(initialEpisode);
  const [isLoadingIframe, setIsLoadingIframe] = useState(true);
  const [resolveError, setResolveError] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);
  const [isResolving, setIsResolving] = useState(true);

  // Hydration-safe
  const isHydrated = useSyncExternalStore(
    (onStoreChange) => { onStoreChange(); return () => {}; },
    () => true,
    () => false
  );

  // Current server URL
  const currentServer = servers.find((s) => s.id === selectedServer);
  const serverUrl = currentServer?.url || '';

  // Resolve: if numeric ID, use directly; if slug, call resolve API
  useEffect(() => {
    if (!rawId) return;
    let cancelled = false;

    void (async () => {
      setIsResolving(true);

      if (isNumericId(rawId)) {
        // Numeric ID → use directly as TMDB ID
        if (!cancelled) {
          setTmdbId(parseInt(rawId, 10));
          setMediaType(mediaTypeParam);
          setMovieTitle('');
          setIsResolving(false);
        }
      } else {
        // Slug → call resolve API
        try {
          const res = await fetch(`/api/stream/resolve?slug=${encodeURIComponent(rawId)}`);
          if (!res.ok) {
            if (!cancelled) {
              setResolveError(true);
              setIsResolving(false);
            }
            return;
          }
          const data = await res.json();
          if (cancelled) return;

          if (!data.tmdbId) {
            setResolveError(true);
            setIsResolving(false);
            return;
          }

          setTmdbId(data.tmdbId);
          setMediaType(data.mediaType);
          setMovieTitle(data.title);
          setIsResolving(false);
        } catch {
          if (!cancelled) {
            setResolveError(true);
            setIsResolving(false);
          }
        }
      }
    })();

    return () => { cancelled = true; };
  }, [rawId, mediaTypeParam]);

  // Fetch servers once we have tmdbId
  useEffect(() => {
    if (!tmdbId) return;
    let cancelled = false;

    void (async () => {
      try {
        const p = new URLSearchParams({
          tmdbId: String(tmdbId),
          mediaType,
          season: String(selectedSeason),
          episode: String(selectedEpisode),
        });
        const res = await fetch(`/api/stream?${p}`);
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled) return;

        const serverList: StreamServer[] = data.servers || [];
        setServers(serverList);

        // Ensure selectedServer is valid
        if (serverList.length > 0 && !serverList.find(s => s.id === selectedServer)) {
          setSelectedServer(serverList[0].id);
        }
      } catch {
        // Servers fetch failed
      }
    })();

    return () => { cancelled = true; };
  }, [tmdbId, mediaType, selectedSeason, selectedEpisode]);

  // Update URL when params change
  const updateWatchUrl = useCallback((
    server: string,
    season: number,
    episode: number
  ) => {
    const p = new URLSearchParams();
    p.set('server', server);
    if (mediaType === 'series') {
      p.set('season', String(season));
      p.set('episode', String(episode));
    }
    if (!isNumericId(rawId)) {
      p.set('mediaType', mediaType);
    }
    router.push(`/watch/${rawId}?${p.toString()}`);
  }, [router, rawId, mediaType]);

  const handleServerChange = useCallback((serverId: string) => {
    setSelectedServer(serverId);
    setIsLoadingIframe(true);
    setIframeKey(prev => prev + 1);
    updateWatchUrl(serverId, selectedSeason, selectedEpisode);
  }, [updateWatchUrl, selectedSeason, selectedEpisode]);

  const handleSeasonChange = useCallback((seasonNum: number) => {
    setSelectedSeason(seasonNum);
    setSelectedEpisode(1);
    setIsLoadingIframe(true);
    setIframeKey(prev => prev + 1);
    updateWatchUrl(selectedServer, seasonNum, 1);
  }, [updateWatchUrl, selectedServer]);

  const handleEpisodeClick = useCallback((seasonNum: number, epNum: number) => {
    setSelectedEpisode(epNum);
    setIsLoadingIframe(true);
    setIframeKey(prev => prev + 1);
    updateWatchUrl(selectedServer, seasonNum, epNum);
  }, [updateWatchUrl, selectedServer]);

  const handleIframeLoad = useCallback(() => {
    setIsLoadingIframe(false);
  }, []);

  // ── Loading state ──
  if (!isHydrated || isResolving) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-white">
        <Navbar />
        <div className="flex flex-col items-center justify-center gap-3 py-40">
          <div className="size-10 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
          <p className="text-sm text-gray-400">جاري تحميل المشغل...</p>
        </div>
      </div>
    );
  }

  // ── Error state ──
  if (resolveError) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-white">
        <Navbar />
        <div className="flex flex-col items-center justify-center gap-4 py-40">
          <AlertCircle className="size-12 text-red-500" />
          <p className="text-lg font-bold">لم يتم العثور على المحتوى</p>
          <p className="text-sm text-gray-400">تأكد من صحة الرابط</p>
          <Link
            href="/"
            className="mt-2 rounded-lg bg-emerald-600 px-6 py-2 text-sm font-bold text-white transition-colors hover:bg-emerald-700"
          >
            العودة للرئيسية
          </Link>
        </div>
      </div>
    );
  }

  const isSeries = mediaType === 'series';

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 pb-20 pt-4 sm:px-6 lg:px-8">
        {/* Back Link */}
        <motion.div
          {...fadeInUp}
          transition={{ duration: 0.4 }}
          className="mb-4"
        >
          <Link
            href={`/details/${rawId}`}
            className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-400 transition-colors hover:bg-white/5 hover:text-white"
          >
            <ArrowRight className="size-4" />
            العودة للتفاصيل
          </Link>
        </motion.div>

        {/* Title */}
        <motion.div
          {...fadeInUp}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="mb-4 flex items-center gap-3"
        >
          <h1 className="text-xl font-bold sm:text-2xl">
            {movieTitle || rawId}
            {isSeries && (
              <span className="mr-2 text-gray-400">
                — الموسم {selectedSeason} الحلقة {selectedEpisode}
              </span>
            )}
          </h1>
        </motion.div>

        {/* Video Player */}
        <motion.div
          {...fadeInUp}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-6"
        >
          <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black border border-white/5">
            {/* Loading Overlay */}
            {isLoadingIframe && serverUrl && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#0a0a0f]">
                <Loader2 className="mb-3 size-10 animate-spin text-emerald-500" />
                <p className="text-sm text-gray-400">جاري تحميل السيرفر...</p>
              </div>
            )}

            {/* No servers message */}
            {servers.length === 0 && !resolveError && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#0a0a0f]">
                <Loader2 className="mb-3 size-8 animate-spin text-emerald-500" />
                <p className="text-sm text-gray-400">جاري تحميل السيرفرات...</p>
              </div>
            )}

            {/* Iframe Player */}
            {serverUrl && (
              <iframe
                key={iframeKey}
                ref={iframeRef}
                src={serverUrl}
                className="h-full w-full"
                allowFullScreen
                allow="autoplay; encrypted-media; picture-in-picture"
                sandbox="allow-forms allow-scripts allow-same-origin allow-popups"
                onLoad={handleIframeLoad}
              />
            )}
          </div>
        </motion.div>

        {/* Controls Section */}
        <motion.div
          {...fadeInUp}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="space-y-6"
        >
          {/* Server Tabs */}
          <div>
            <h3 className="mb-2 flex items-center gap-2 text-sm font-bold text-gray-300">
              <Monitor className="size-4 text-emerald-500" />
              السيرفرات
            </h3>
            <div className="flex flex-wrap gap-2">
              {servers.map((server) => (
                <button
                  key={server.id}
                  onClick={() => handleServerChange(server.id)}
                  className={`rounded-lg px-4 py-2.5 text-sm font-bold transition-all duration-300 ${
                    selectedServer === server.id
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                      : 'bg-[#12121a] text-gray-400 hover:bg-[#1a1a2e] hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Play className="size-3 fill-current" />
                    {server.name}
                  </span>
                </button>
              ))}
              {servers.length === 0 && (
                <span className="text-sm text-gray-500">لا تتوفر سيرفرات حالياً</span>
              )}
            </div>
          </div>

          {/* Report broken link */}
          <div className="flex items-center gap-4">
            <ReportDialog>
              <button className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-gray-500 transition-colors hover:bg-white/5 hover:text-amber-400">
                إبلاغ عن رابط معطل
              </button>
            </ReportDialog>
          </div>

          {/* Season & Episode Picker (Series Only) */}
          {isSeries && (
            <div>
              <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-gray-300">
                <Monitor className="size-4 text-emerald-500" />
                الموسم والحلقة
              </h3>

              {/* Season Picker */}
              <div className="mb-4 flex flex-wrap gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((sNum) => (
                  <button
                    key={sNum}
                    onClick={() => handleSeasonChange(sNum)}
                    className={`rounded-lg px-4 py-2 text-sm font-bold transition-all duration-300 ${
                      selectedSeason === sNum
                        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                        : 'bg-[#12121a] text-gray-400 hover:bg-[#1a1a2e] hover:text-white'
                    }`}
                  >
                    الموسم {sNum}
                  </button>
                ))}
              </div>

              {/* Episode Picker */}
              <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10">
                {Array.from({ length: 20 }, (_, i) => i + 1).map((epNum) => (
                  <button
                    key={epNum}
                    onClick={() => handleEpisodeClick(selectedSeason, epNum)}
                    className={`flex items-center justify-center rounded-lg border px-2 py-2.5 text-sm font-bold transition-all duration-300 ${
                      selectedEpisode === epNum
                        ? 'border-emerald-500 bg-emerald-600/20 text-emerald-400'
                        : 'border-white/5 bg-[#12121a] text-gray-400 hover:border-white/10 hover:bg-[#1a1a2e] hover:text-white'
                    }`}
                  >
                    {epNum}
                  </button>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}

export default function WatchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0a0a0f] text-white">
          <Navbar />
          <div className="flex items-center justify-center py-40">
            <div className="size-10 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
          </div>
        </div>
      }
    >
      <WatchContent />
    </Suspense>
  );
}
