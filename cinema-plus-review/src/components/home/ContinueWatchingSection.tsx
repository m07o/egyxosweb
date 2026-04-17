'use client'

import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronRight, ChevronLeft, Clock, X, Play } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { useAppStore } from '@/store/useAppStore'
import type { ContinueWatchingItem } from '@/types'

export function ContinueWatchingSection() {
  const { continueWatching, removeFromContinueWatching, navigateTo, updateProgress } = useAppStore()
  const scrollRef = useRef<HTMLDivElement>(null)

  if (continueWatching.length === 0) return null

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="py-6 md:py-10"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 rounded-lg bg-streaming-accent/15 flex items-center justify-center">
            <Clock className="size-4 text-streaming-accent" />
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-white">متابعة المشاهدة</h2>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin" style={{ direction: 'rtl' }}>
          {continueWatching.map((item) => (
            <div
              key={item.id}
              className="flex-shrink-0 w-[200px] sm:w-[220px] group cursor-pointer"
              onClick={() => navigateTo('details', item.id, item.mediaType)}
            >
              <div className="relative aspect-video rounded-lg overflow-hidden border border-white/5 bg-white/5">
                <img
                  src={item.posterPath}
                  alt={item.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-streaming-accent/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play className="size-4 fill-white text-white mr-[-2px]" />
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0">
                  <Progress value={item.progress} className="h-1 rounded-none bg-black/50 [&>div]:bg-streaming-accent" />
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    removeFromContinueWatching(item.id)
                  }}
                  className="absolute top-2 left-2 w-6 h-6 rounded-full bg-black/70 flex items-center justify-center text-gray-300 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="size-3" />
                </button>
              </div>
              <p className="text-sm font-medium text-white mt-2 line-clamp-1 group-hover:text-streaming-accent transition-colors">
                {item.title}
              </p>
              <p className="text-xs text-gray-500">
                {item.progress}% مكتمل
              </p>
            </div>
          ))}
        </div>
      </div>
    </motion.section>
  )
}
