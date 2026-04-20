'use client';

import { useSyncExternalStore, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Trash2, Star, Film, Sparkles } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useStore } from '@/lib/store';

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

// Hydration-safe hook using useSyncExternalStore
function useHydrated() {
  return useSyncExternalStore(
    // Subscribe — client returns true immediately, server returns false
    (onStoreChange) => {
      // Trigger the subscription to update from server to client value
      onStoreChange();
      return () => {};
    },
    // getSnapshot (client)
    () => true,
    // getServerSnapshot
    () => false
  );
}

export default function WatchlistPage() {
  const { watchlist, removeFromWatchlist } = useStore();
  const isHydrated = useHydrated();

  const handleRemove = useCallback(
    (e: React.MouseEvent, itemId: number) => {
      e.preventDefault();
      e.stopPropagation();
      removeFromWatchlist(itemId);
    },
    [removeFromWatchlist]
  );

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-white">
        <Navbar />
        <main className="mx-auto max-w-7xl px-4 pb-20 pt-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-20">
            <div className="size-10 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 pb-20 pt-6 sm:px-6 lg:px-8">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-600/20">
              <Heart className="size-5 fill-emerald-500 text-emerald-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold sm:text-3xl">قائمتي</h1>
              <p className="text-sm text-gray-400">
                {watchlist.length > 0
                  ? `${watchlist.length} عنصر في قائمتك`
                  : 'قائمة المشاهدة المفضلة'}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Watchlist Content */}
        {watchlist.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center py-24"
          >
            <div className="mb-6 flex size-28 items-center justify-center rounded-full bg-[#12121a]">
              <Heart className="size-14 text-gray-600" />
            </div>
            <h2 className="mb-3 text-xl font-bold text-white">لم تضف أي محتوى لقائمتك بعد</h2>
            <p className="mb-8 max-w-md text-center text-sm text-gray-500">
              تصفح الأفلام والمسلسلات واضغط على أيقونة القلب لإضافتها إلى قائمتك المفضلة
            </p>
            <Link
              href="/"
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white transition-all duration-300 hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-600/25"
            >
              <Sparkles className="size-4" />
              استكشف المحتوى
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            <AnimatePresence>
              {watchlist.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: 10 }}
                  transition={{ duration: 0.3 }}
                  layout
                  className="group relative"
                >
                  <Link href={`/details/${item.id}`}>
                    <div className="overflow-hidden rounded-xl bg-[#12121a] transition-transform duration-300 group-hover:scale-[1.02]">
                      {/* Poster */}
                      <div className="relative aspect-[2/3] overflow-hidden">
                        <Image
                          src={item.poster}
                          alt={item.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#12121a] via-transparent to-transparent opacity-80" />

                        {/* Rating */}
                        <div className="absolute top-2 left-2 flex items-center gap-1 rounded-full bg-black/60 px-2 py-1 text-xs font-bold text-yellow-400 backdrop-blur-sm">
                          <Star className="size-3 fill-yellow-400" />
                          {item.rating}
                        </div>

                        {/* Quality */}
                        <div className="absolute top-2 right-2 rounded-full bg-emerald-600/90 px-2 py-0.5 text-[10px] font-bold text-white">
                          {item.quality}
                        </div>

                        {/* Type badge */}
                        <div className={`absolute bottom-2 right-2 rounded-full px-2 py-0.5 text-[10px] font-bold text-white ${typeBadgeColors[item.isSeries ? 'series' : 'movie'] || 'bg-gray-600/80'}`}>
                          {typeLabels[item.isSeries ? 'series' : 'movie']}
                        </div>
                      </div>

                      {/* Card Info */}
                      <div className="p-3">
                        <h3 className="truncate text-sm font-bold text-white">{item.title}</h3>
                        <p className="mt-1 text-xs text-gray-500">
                          {item.year} • {item.duration}
                        </p>
                      </div>
                    </div>
                  </Link>

                  {/* Remove Button */}
                  <motion.button
                    onClick={(e) => handleRemove(e, item.id)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="absolute -top-2 -left-2 z-10 flex size-8 items-center justify-center rounded-full bg-red-600 text-white shadow-lg opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  >
                    <Trash2 className="size-4" />
                  </motion.button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
