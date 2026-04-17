'use client'

import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronRight, ChevronLeft } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { MovieCard } from './MovieCard'
import { useAppStore } from '@/store/useAppStore'
import type { Movie } from '@/types'

interface CategoryRowProps {
  title: string
  icon: LucideIcon
  movies: Movie[]
  showSeeAll?: boolean
  browseFilter?: 'movie' | 'tv' | 'anime' | 'all'
}

export function CategoryRow({ title, icon: Icon, movies, showSeeAll = true, browseFilter }: CategoryRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [showLeft, setShowLeft] = useState(false)
  const [showRight, setShowRight] = useState(true)
  const { navigateTo, setFilters } = useAppStore()

  if (!movies || movies.length === 0) return null

  const handleScroll = () => {
    if (!scrollRef.current) return
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
    setShowLeft(scrollLeft > 20)
    setShowRight(scrollLeft < scrollWidth - clientWidth - 20)
  }

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return
    const amount = dir === 'right' ? -400 : 400
    scrollRef.current.scrollBy({ left: amount, behavior: 'smooth' })
  }

  const handleSeeAll = () => {
    if (browseFilter) {
      setFilters({ mediaType: browseFilter })
    }
    navigateTo('browse')
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5 }}
      className="py-6 md:py-10"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-streaming-accent/15 flex items-center justify-center">
              <Icon className="size-4 text-streaming-accent" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white">{title}</h2>
            <span className="text-xs text-gray-500 bg-white/5 px-2 py-0.5 rounded-full">
              {movies.length}
            </span>
          </div>
          {showSeeAll && (
            <button
              onClick={handleSeeAll}
              className="text-sm text-streaming-accent hover:text-streaming-accent/80 font-medium transition-colors"
            >
              عرض الكل
            </button>
          )}
        </div>

        {/* Scrollable Row */}
        <div className="relative group/row">
          {/* Left Arrow */}
          {showLeft && (
            <button
              onClick={() => scroll('left')}
              className="absolute right-0 top-0 bottom-0 z-10 w-12 bg-gradient-to-l from-[#0a0a0f] to-transparent flex items-center justify-start pl-2 opacity-0 group-hover/row:opacity-100 transition-opacity"
            >
              <div className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white">
                <ChevronRight className="size-4" />
              </div>
            </button>
          )}

          {/* Right Arrow */}
          {showRight && (
            <button
              onClick={() => scroll('right')}
              className="absolute left-0 top-0 bottom-0 z-10 w-12 bg-gradient-to-r from-[#0a0a0f] to-transparent flex items-center justify-end pr-2 opacity-0 group-hover/row:opacity-100 transition-opacity"
            >
              <div className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white">
                <ChevronLeft className="size-4" />
              </div>
            </button>
          )}

          {/* Cards */}
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex gap-3 md:gap-4 overflow-x-auto pb-4 scrollbar-thin"
            style={{ direction: 'rtl' }}
          >
            {movies.map((movie) => (
              <MovieCard key={`${movie.mediaType}-${movie.id}`} movie={movie} />
            ))}
          </div>
        </div>
      </div>
    </motion.section>
  )
}
