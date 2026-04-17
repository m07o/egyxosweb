'use client'

import { AnimatePresence, motion } from 'framer-motion'
import {
  Sparkles,
  Film,
  Tv,
  Globe,
  Clapperboard,
  Clock,
  PlayCircle,
} from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { HeroSlider } from '@/components/home/HeroSlider'
import { CategoryRow } from '@/components/home/CategoryRow'
import { DetailsView } from '@/components/details/DetailsView'
import { BrowseView } from '@/components/browse/BrowseView'
import { WatchlistView } from '@/components/watchlist/WatchlistView'
import { SearchOverlay } from '@/components/search/SearchOverlay'
import { AdminPanel } from '@/components/admin/AdminPanel'
import { useAppStore } from '@/store/useAppStore'
import {
  dummyNewMovies,
  dummyForeignMovies,
  dummyForeignSeries,
  dummyAnime,
  dummyAsianMovies,
  dummyArabicMovies,
} from '@/lib/dummy-data'
import { ContinueWatchingSection } from '@/components/home/ContinueWatchingSection'

const pageTransition = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: 0.3 },
}

export default function HomePage() {
  const { currentPage } = useAppStore()

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col">
      <Navbar />
      <SearchOverlay />
      <AdminPanel />

      <main className="flex-1 pt-16">
        <AnimatePresence mode="wait">
          {currentPage === 'home' && (
            <motion.div key="home" {...pageTransition}>
              <HeroSlider />
              <ContinueWatchingSection />
              <CategoryRow
                title="المضاف حديثاً"
                icon={Sparkles}
                movies={dummyNewMovies}
                browseFilter="movie"
              />
              <CategoryRow
                title="أفلام أجنبية"
                icon={Film}
                movies={dummyForeignMovies}
                browseFilter="movie"
              />
              <CategoryRow
                title="مسلسلات أجنبية"
                icon={Tv}
                movies={dummyForeignSeries}
                browseFilter="tv"
              />
              <CategoryRow
                title="أنمي"
                icon={PlayCircle}
                movies={dummyAnime}
                browseFilter="anime"
              />
              <CategoryRow
                title="أفلام آسيوية"
                icon={Globe}
                movies={dummyAsianMovies}
              />
              <CategoryRow
                title="أفلام عربية"
                icon={Clapperboard}
                movies={dummyArabicMovies}
              />
            </motion.div>
          )}

          {currentPage === 'browse' && (
            <motion.div key="browse" {...pageTransition}>
              <BrowseView />
            </motion.div>
          )}

          {currentPage === 'details' && (
            <motion.div key="details" {...pageTransition}>
              <DetailsView />
            </motion.div>
          )}

          {currentPage === 'watchlist' && (
            <motion.div key="watchlist" {...pageTransition}>
              <WatchlistView />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  )
}
