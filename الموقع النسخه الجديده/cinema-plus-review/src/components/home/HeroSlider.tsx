'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Heart, Star, ChevronRight, ChevronLeft, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAppStore } from '@/store/useAppStore'
import { getHeroSlides } from '@/lib/tmdb'
import type { Movie } from '@/types'

export function HeroSlider() {
  const { navigateTo, addToWatchlist, isInWatchlist } = useAppStore()
  const [slides, setSlides] = useState<Movie[]>([])
  const [current, setCurrent] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [direction, setDirection] = useState(0)

  useEffect(() => {
    getHeroSlides().then(setSlides)
  }, [])

  const goTo = useCallback(
    (index: number) => {
      setDirection(index > current ? 1 : -1)
      setCurrent(index)
    },
    [current]
  )

  const next = useCallback(() => {
    setDirection(1)
    setCurrent((prev) => (prev + 1) % slides.length)
  }, [slides.length])

  const prev = useCallback(() => {
    setDirection(-1)
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length)
  }, [slides.length])

  // Auto-play
  useEffect(() => {
    if (isPaused || slides.length === 0) return
    const timer = setInterval(next, 7000)
    return () => clearInterval(timer)
  }, [isPaused, next, slides.length])

  if (slides.length === 0) return null

  const slide = slides[current]
  const inWatchlist = isInWatchlist(slide.id)

  const handleWatchNow = () => {
    navigateTo('details', slide.id, slide.mediaType)
  }

  const handleAddToList = () => {
    if (inWatchlist) return
    addToWatchlist({
      id: slide.id,
      mediaType: slide.mediaType,
      title: slide.title,
      posterPath: slide.posterPath,
      addedAt: Date.now(),
    })
  }

  const year = slide.releaseDate?.split('-')[0]

  return (
    <section
      className="relative"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="relative w-full h-[55vh] min-h-[380px] md:h-[70vh] md:min-h-[500px] lg:h-[80vh] lg:min-h-[600px] overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={current}
            custom={direction}
            initial={{ opacity: 0, x: direction > 0 ? 100 : -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction > 0 ? -100 : 100 }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
            className="absolute inset-0"
          >
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url('${slide.backdropPath}')` }}
            />

            {/* Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/50 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0f]/90 via-[#0a0a0f]/30 to-transparent" />
          </motion.div>
        </AnimatePresence>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 h-full flex items-end pb-12 md:pb-20">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="max-w-2xl"
            >
              {/* Tags */}
              {slide.tags && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {slide.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="destructive"
                      className="bg-streaming-accent/90 hover:bg-streaming-accent text-white text-xs"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Title */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-2 leading-tight">
                {slide.title}
              </h1>

              {/* Meta */}
              <div className="flex flex-wrap items-center gap-3 mb-4 text-sm text-gray-300">
                <span className="flex items-center gap-1">
                  <Star className="size-4 text-yellow-500 fill-yellow-500" />
                  <span className="font-semibold text-white">{slide.voteAverage.toFixed(1)}</span>
                  <span className="text-gray-400">/10</span>
                </span>
                {year && <span>{year}</span>}
                {slide.runtime && (
                  <span className="flex items-center gap-1">
                    <Clock className="size-3.5" />
                    {slide.runtime} دقيقة
                  </span>
                )}
                {slide.genres && slide.genres.length > 0 && (
                  <div className="flex gap-1.5 flex-wrap">
                    {slide.genres.slice(0, 3).map((genre) => (
                      <Badge key={genre.id} variant="secondary" className="bg-white/10 text-gray-200 text-xs border-0">
                        {genre.name}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Overview */}
              <p className="text-gray-300 text-sm sm:text-base leading-relaxed mb-6 line-clamp-3">
                {slide.overview}
              </p>

              {/* Buttons */}
              <div className="flex flex-wrap gap-3">
                <Button
                  size="lg"
                  className="bg-streaming-accent hover:bg-streaming-accent/90 text-white font-semibold px-8 h-12 rounded-lg gap-2 text-base shadow-lg shadow-red-900/30"
                  onClick={handleWatchNow}
                >
                  <Play className="size-5 fill-white" />
                  مشاهدة الآن
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className={`border-white/20 bg-white/5 hover:bg-white/10 text-white font-semibold px-8 h-12 rounded-lg gap-2 text-base ${
                    inWatchlist ? 'border-streaming-accent text-streaming-accent' : ''
                  }`}
                  onClick={handleAddToList}
                >
                  <Heart className={`size-5 ${inWatchlist ? 'fill-streaming-accent text-streaming-accent' : ''}`} />
                  {inWatchlist ? 'في المفضلة' : 'أضف للمفضلة'}
                </Button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Nav Arrows */}
        <button
          onClick={prev}
          className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 items-center justify-center rounded-full bg-black/50 hover:bg-black/70 text-white transition-all border border-white/10"
        >
          <ChevronRight className="size-5" />
        </button>
        <button
          onClick={next}
          className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 items-center justify-center rounded-full bg-black/50 hover:bg-black/70 text-white transition-all border border-white/10"
        >
          <ChevronLeft className="size-5" />
        </button>

        {/* Dot Indicators */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === current ? 'bg-streaming-accent w-8' : 'bg-white/30 w-1.5 hover:bg-white/50'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
