'use client'

import { motion } from 'framer-motion'
import { Heart, Trash2, Film } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/store/useAppStore'

export function WatchlistView() {
  const { watchlist, removeFromWatchlist, navigateTo } = useAppStore()

  if (watchlist.length === 0) {
    return (
      <div className="min-h-screen pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6">
              <Heart className="size-10 text-gray-500" />
            </div>
            <h2 className="text-xl text-gray-300 mb-2">قائمة المفضلة فارغة</h2>
            <p className="text-gray-500 mb-6">لم تقم بإضافة أي أفلام أو مسلسلات بعد</p>
            <Button
              onClick={() => navigateTo('home')}
              className="bg-streaming-accent hover:bg-streaming-accent/90 text-white gap-2"
            >
              <Film className="size-4" />
              استكشف المحتوى
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Heart className="size-6 text-streaming-accent fill-streaming-accent" />
            قائمة المفضلة
          </h1>
          <p className="text-gray-400 text-sm">
            {watchlist.length} عنصر في القائمة
          </p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          {watchlist.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="relative group"
            >
              {/* Remove button */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  removeFromWatchlist(item.id)
                }}
                className="absolute top-2 left-2 z-10 w-8 h-8 rounded-full bg-black/70 hover:bg-red-600/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all border border-white/10"
              >
                <Trash2 className="size-3.5" />
              </button>

              {/* Card */}
              <motion.button
                whileHover={{ y: -4 }}
                onClick={() => navigateTo('details', item.id, item.mediaType)}
                className="w-full text-right"
              >
                <div className="relative aspect-[2/3] rounded-xl overflow-hidden border border-white/5 bg-white/5">
                  <img
                    src={item.posterPath}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-sm font-medium text-white mt-2 line-clamp-1 group-hover:text-streaming-accent transition-colors">
                  {item.title}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {item.mediaType === 'tv' ? 'مسلسل' : 'فيلم'}
                </p>
              </motion.button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
