'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Film, Tv, Sparkles, SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAppStore } from '@/store/useAppStore'
import { MovieCard } from '@/components/home/MovieCard'
import {
  dummyAllMovies,
  dummyAllSeries,
  dummyAnime,
  genres,
} from '@/lib/dummy-data'
import type { Movie, BrowseFilters } from '@/types'

const mediaTabs: { label: string; value: BrowseFilters['mediaType'] }[] = [
  { label: 'الكل', value: 'all' },
  { label: 'أفلام', value: 'movie' },
  { label: 'مسلسلات', value: 'tv' },
  { label: 'أنمي', value: 'anime' },
]

const sortOptions: { label: string; value: BrowseFilters['sortBy'] }[] = [
  { label: 'الأشهر', value: 'popularity' },
  { label: 'الأعلى تقييماً', value: 'rating' },
  { label: 'الأحدث', value: 'date' },
  { label: 'حسب العنوان', value: 'title' },
]

const years = ['2025', '2024', '2023', '2022', '2020']

export function BrowseView() {
  const { filters, setFilters, resetFilters } = useAppStore()
  const [page, setPage] = useState(1)
  const perPage = 20

  // Build source list based on media type
  const allItems = useMemo(() => {
    switch (filters.mediaType) {
      case 'movie':
        return dummyAllMovies
      case 'tv':
        return dummyAllSeries
      case 'anime':
        return dummyAnime
      default:
        return [...dummyAllMovies, ...dummyAllSeries, ...dummyAnime]
    }
  }, [filters.mediaType])

  // Filter and sort
  const filtered = useMemo(() => {
    let items = [...allItems]

    // Genre filter
    if (filters.genre) {
      items = items.filter((m) => m.genreIds.includes(filters.genre!))
    }

    // Year filter
    if (filters.year) {
      items = items.filter((m) => m.releaseDate?.startsWith(filters.year!))
    }

    // Sort
    switch (filters.sortBy) {
      case 'popularity':
        items.sort((a, b) => b.popularity - a.popularity)
        break
      case 'rating':
        items.sort((a, b) => b.voteAverage - a.voteAverage)
        break
      case 'date':
        items.sort((a, b) => (b.releaseDate || '').localeCompare(a.releaseDate || ''))
        break
      case 'title':
        items.sort((a, b) => a.title.localeCompare(b.title, 'ar'))
        break
    }

    return items
  }, [allItems, filters])

  const displayed = filtered.slice(0, page * perPage)
  const hasMore = displayed.length < filtered.length

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-6 flex items-center gap-3">
            <SlidersHorizontal className="size-6 text-streaming-accent" />
            تصفح المحتوى
          </h1>

          {/* Media Type Tabs */}
          <div className="flex flex-wrap gap-2 mb-6">
            {mediaTabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => {
                  setFilters({ mediaType: tab.value })
                  setPage(1)
                }}
                className={`px-5 py-2.5 text-sm font-medium rounded-lg transition-all ${
                  filters.mediaType === tab.value
                    ? 'bg-streaming-accent text-white shadow-lg shadow-red-900/20'
                    : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 border border-white/5'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Sort & Filter Row */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">ترتيب:</span>
              <Select
                value={filters.sortBy}
                onValueChange={(v) => setFilters({ sortBy: v as BrowseFilters['sortBy'] })}
              >
                <SelectTrigger className="w-44 bg-white/5 border-white/10 text-gray-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a2e] border-white/10">
                  {sortOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value} className="text-gray-300 focus:text-white focus:bg-white/5">
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">السنة:</span>
              <Select
                value={filters.year || 'all'}
                onValueChange={(v) => {
                  setFilters({ year: v === 'all' ? null : v })
                  setPage(1)
                }}
              >
                <SelectTrigger className="w-32 bg-white/5 border-white/10 text-gray-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a2e] border-white/10">
                  <SelectItem value="all" className="text-gray-300">الكل</SelectItem>
                  {years.map((y) => (
                    <SelectItem key={y} value={y} className="text-gray-300">{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              variant="ghost"
              className="text-gray-400 hover:text-white sm:mr-auto"
              onClick={() => {
                resetFilters()
                setPage(1)
              }}
            >
              إعادة تعيين
            </Button>
          </div>

          {/* Genre Pills */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
            <button
              onClick={() => {
                setFilters({ genre: null })
                setPage(1)
              }}
              className={`px-4 py-1.5 text-xs rounded-full whitespace-nowrap transition-all ${
                !filters.genre
                  ? 'bg-streaming-accent text-white'
                  : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 border border-white/5'
              }`}
            >
              جميع التصنيفات
            </button>
            {genres.map((genre) => (
              <button
                key={genre.id}
                onClick={() => {
                  setFilters({ genre: genre.id })
                  setPage(1)
                }}
                className={`px-4 py-1.5 text-xs rounded-full whitespace-nowrap transition-all ${
                  filters.genre === genre.id
                    ? 'bg-streaming-accent text-white'
                    : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 border border-white/5'
                }`}
              >
                {genre.name}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Results Count */}
        <div className="flex items-center gap-2 mb-6">
          <span className="text-sm text-gray-400">
            تم العثور على <span className="text-white font-semibold">{filtered.length}</span> عنصر
          </span>
        </div>

        {/* Grid */}
        {displayed.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {displayed.map((movie) => (
              <MovieCard key={`${movie.mediaType}-${movie.id}`} movie={movie} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Film className="size-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg mb-2">لا توجد نتائج</p>
            <p className="text-gray-500 text-sm">جرب تغيير معايير البحث</p>
          </div>
        )}

        {/* Load More */}
        {hasMore && (
          <div className="flex justify-center mt-10">
            <Button
              variant="outline"
              className="border-white/10 bg-white/5 hover:bg-white/10 text-white px-8"
              onClick={() => setPage((p) => p + 1)}
            >
              تحميل المزيد
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
