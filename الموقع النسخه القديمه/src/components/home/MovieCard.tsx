'use client'

import { motion } from 'framer-motion'
import { Play, Star, Tv, Film } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useAppStore } from '@/store/useAppStore'
import type { Movie } from '@/types'

interface MovieCardProps {
  movie: Movie
}

export function MovieCard({ movie }: MovieCardProps) {
  const { navigateTo } = useAppStore()

  const handleClick = () => {
    navigateTo('details', movie.id, movie.mediaType)
  }

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.25 }}
      className="relative flex-shrink-0 w-[150px] sm:w-[170px] md:w-[180px] group cursor-pointer"
      onClick={handleClick}
    >
      {/* Poster */}
      <div className="relative aspect-[2/3] rounded-xl overflow-hidden border border-white/5 bg-white/5">
        <img
          src={movie.posterPath}
          alt={movie.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-3">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            whileHover={{ scale: 1, opacity: 1 }}
            className="w-12 h-12 rounded-full bg-streaming-accent/90 flex items-center justify-center shadow-lg shadow-red-900/40"
          >
            <Play className="size-5 fill-white text-white mr-[-2px]" />
          </motion.div>
          <p className="text-xs text-white font-medium text-center px-2 line-clamp-2">
            {movie.title}
          </p>
        </div>

        {/* Quality Badge (top-right) */}
        {movie.quality && (
          <div className="absolute top-2 left-2">
            <Badge className="bg-streaming-accent/90 text-white text-[10px] font-bold px-1.5 py-0 border-0">
              {movie.quality}
            </Badge>
          </div>
        )}

        {/* Rating Badge (top-right in RTL = top-left visually) */}
        <div className="absolute top-2 right-2">
          <Badge className="bg-black/75 text-yellow-500 text-[10px] gap-1 border-0 backdrop-blur-sm">
            <Star className="size-2.5 fill-yellow-500" />
            {movie.voteAverage.toFixed(1)}
          </Badge>
        </div>

        {/* Tags */}
        {movie.tags && movie.tags.length > 0 && (
          <div className="absolute bottom-2 right-2 left-2 flex gap-1 flex-wrap justify-center">
            {movie.tags.slice(0, 2).map((tag) => (
              <Badge
                key={tag}
                className="bg-black/75 text-gray-200 text-[9px] border-0 backdrop-blur-sm"
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Media Type */}
        <div className="absolute bottom-2 left-2">
          {movie.mediaType === 'tv' ? (
            <Badge className="bg-purple-600/80 text-white text-[9px] border-0">
              <Tv className="size-2.5 ml-0.5" />
              مسلسل
            </Badge>
          ) : (
            <Badge className="bg-blue-600/80 text-white text-[9px] border-0">
              <Film className="size-2.5 ml-0.5" />
              فيلم
            </Badge>
          )}
        </div>
      </div>

      {/* Title */}
      <div className="mt-2 px-0.5">
        <p className="text-xs sm:text-sm font-medium text-white truncate group-hover:text-streaming-accent transition-colors">
          {movie.title}
        </p>
        <p className="text-[11px] text-gray-500 truncate mt-0.5">
          {movie.originalTitle}
        </p>
        {movie.releaseDate && (
          <p className="text-[11px] text-gray-500 mt-0.5">
            {movie.releaseDate.split('-')[0]}
          </p>
        )}
      </div>
    </motion.div>
  )
}
