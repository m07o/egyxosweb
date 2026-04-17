'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, Loader2, Tv, Film, Star } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useAppStore } from '@/store/useAppStore'
import { searchContent } from '@/lib/tmdb'

const filterTabs = [
  { label: 'الكل', value: 'all' },
  { label: 'أفلام', value: 'movie' },
  { label: 'مسلسلات', value: 'tv' },
  { label: 'أنمي', value: 'anime' },
]

export function SearchOverlay() {
  const {
    isSearchOpen,
    searchQuery,
    searchResults,
    isSearching,
    setSearchOpen,
    setSearchQuery,
    setSearchResults,
    setIsSearching,
    navigateTo,
  } = useAppStore()

  const [activeFilter, setActiveFilter] = useState('all')
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isSearchOpen])

  // ESC to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isSearchOpen) {
        setSearchOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isSearchOpen, setSearchOpen])

  const doSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }
    setIsSearching(true)
    try {
      const results = await searchContent(query)
      setSearchResults(results)
    } catch {
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }, [setSearchResults, setIsSearching])

  const handleInputChange = (value: string) => {
    setSearchQuery(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => doSearch(value), 500)
  }

  const handleSelect = (id: number, mediaType: 'movie' | 'tv') => {
    navigateTo('details', id, mediaType)
    setSearchOpen(false)
  }

  const filteredResults = activeFilter === 'all'
    ? searchResults
    : activeFilter === 'anime'
      ? searchResults.filter((r) => r.genreIds.includes(16))
      : searchResults.filter((r) => r.mediaType === activeFilter)

  return (
    <AnimatePresence>
      {isSearchOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-lg flex flex-col"
        >
          {/* Header */}
          <div className="pt-20 pb-4 px-4 sm:px-6 max-w-4xl mx-auto w-full">
            <div className="relative">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
              <Input
                ref={inputRef}
                value={searchQuery}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder="ابحث عن أفلام، مسلسلات، أنمي..."
                className="h-14 text-lg bg-white/5 border-white/10 rounded-xl pr-12 pl-12 text-white placeholder:text-gray-500 focus:border-streaming-accent/50"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('')
                    setSearchResults([])
                    inputRef.current?.focus()
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  <X className="size-5" />
                </button>
              )}
              {isSearching && (
                <Loader2 className="absolute left-12 top-1/2 -translate-y-1/2 size-5 text-streaming-accent animate-spin" />
              )}
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 mt-4">
              {filterTabs.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setActiveFilter(tab.value)}
                  className={`px-4 py-2 text-sm rounded-lg transition-all ${
                    activeFilter === tab.value
                      ? 'bg-streaming-accent text-white'
                      : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Results */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 pb-8 max-w-7xl mx-auto w-full">
            {searchQuery && !isSearching && filteredResults.length === 0 && (
              <div className="text-center py-20">
                <Search className="size-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">لا توجد نتائج لـ &quot;{searchQuery}&quot;</p>
              </div>
            )}

            {filteredResults.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {filteredResults.map((item) => (
                  <motion.button
                    key={`${item.mediaType}-${item.id}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ y: -4 }}
                    onClick={() => handleSelect(item.id, item.mediaType)}
                    className="text-right group"
                  >
                    <div className="relative aspect-[2/3] rounded-xl overflow-hidden border border-white/5 bg-white/5">
                      <img
                        src={item.posterPath}
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="absolute top-2 right-2">
                        <Badge className="bg-black/75 text-yellow-500 text-[10px] gap-1 border-0">
                          <Star className="size-2.5 fill-yellow-500" />
                          {item.voteAverage.toFixed(1)}
                        </Badge>
                      </div>
                      <div className="absolute bottom-2 left-2">
                        <Badge className={`text-[9px] border-0 ${item.mediaType === 'tv' ? 'bg-purple-600/80' : 'bg-blue-600/80'} text-white`}>
                          {item.mediaType === 'tv' ? (
                            <><Tv className="size-2.5 ml-0.5" />مسلسل</>
                          ) : (
                            <><Film className="size-2.5 ml-0.5" />فيلم</>
                          )}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm font-medium text-white mt-2 line-clamp-1 group-hover:text-streaming-accent transition-colors">
                      {item.title}
                    </p>
                    {item.releaseDate && (
                      <p className="text-xs text-gray-500">{item.releaseDate.split('-')[0]}</p>
                    )}
                  </motion.button>
                ))}
              </div>
            )}

            {!searchQuery && (
              <div className="text-center py-20">
                <Search className="size-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">ابدأ بالبحث عن فيلم أو مسلسل</p>
              </div>
            )}
          </div>

          {/* Close */}
          <button
            onClick={() => setSearchOpen(false)}
            className="absolute top-5 left-5 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all"
          >
            <X className="size-5" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
