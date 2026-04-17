'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Search,
  Menu,
  Settings,
  Heart,
  Clapperboard,
  Film,
  Tv,
  Sparkles,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from '@/components/ui/sheet'
import { useAppStore } from '@/store/useAppStore'
import type { PageView } from '@/types'

const navLinks: { label: string; page: PageView; icon: typeof Film }[] = [
  { label: 'الرئيسية', page: 'home', icon: Sparkles },
  { label: 'أفلام', page: 'browse', icon: Film },
  { label: 'مسلسلات', page: 'browse', icon: Tv },
  { label: 'المفضلة', page: 'watchlist', icon: Heart },
]

export function Navbar() {
  const { currentPage, navigateTo, setSearchOpen, setAdminOpen, watchlist } = useAppStore()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleNavClick = (page: PageView) => {
    if (page === 'browse') {
      navigateTo('browse')
    } else {
      navigateTo(page)
    }
    setMobileOpen(false)
  }

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className={`fixed top-0 right-0 left-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'backdrop-blur-xl bg-black/85 border-b border-white/5 shadow-lg shadow-black/20'
          : 'bg-gradient-to-b from-black/80 to-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button
            onClick={() => navigateTo('home')}
            className="flex items-center gap-2 group"
          >
            <Clapperboard className="size-6 text-streaming-accent group-hover:scale-110 transition-transform" />
            <span className="text-xl font-bold text-white">
              سينما <span className="text-streaming-accent">بلس</span>
            </span>
          </button>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => handleNavClick(link.page)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                  currentPage === link.page
                    ? 'text-streaming-accent bg-streaming-accent/10'
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-1">
            {/* Watchlist count badge */}
            <button
              onClick={() => navigateTo('watchlist')}
              className="hidden md:flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-all"
            >
              <Heart className="size-4" />
              <span>المفضلة</span>
              {watchlist.length > 0 && (
                <span className="bg-streaming-accent text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                  {watchlist.length}
                </span>
              )}
            </button>

            {/* Search */}
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-300 hover:text-white hover:bg-white/10"
              onClick={() => setSearchOpen(true)}
            >
              <Search className="size-5" />
            </Button>

            {/* Admin */}
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-300 hover:text-white hover:bg-white/10"
              onClick={() => setAdminOpen(true)}
            >
              <Settings className="size-5" />
            </Button>

            {/* Mobile Menu */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden text-gray-300 hover:text-white hover:bg-white/10"
                onClick={() => setMobileOpen(true)}
              >
                <Menu className="size-5" />
              </Button>
              <SheetContent side="right" className="bg-[#0d0d18] border-white/10 w-72">
                <SheetHeader>
                  <SheetTitle className="text-white flex items-center gap-2">
                    <Clapperboard className="size-5 text-streaming-accent" />
                    سينما <span className="text-streaming-accent">بلس</span>
                  </SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-1 mt-6">
                  {navLinks.map((link) => {
                    const Icon = link.icon
                    return (
                      <button
                        key={link.label}
                        onClick={() => handleNavClick(link.page)}
                        className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all ${
                          currentPage === link.page
                            ? 'text-streaming-accent bg-streaming-accent/10'
                            : 'text-gray-300 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <Icon className="size-4" />
                        {link.label}
                        {link.page === 'watchlist' && watchlist.length > 0 && (
                          <span className="bg-streaming-accent text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 mr-auto">
                            {watchlist.length}
                          </span>
                        )}
                      </button>
                    )
                  })}
                  <div className="border-t border-white/5 my-2" />
                  <button
                    onClick={() => {
                      setMobileOpen(false)
                      setAdminOpen(true)
                    }}
                    className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                  >
                    <Settings className="size-4" />
                    إعدادات الموقع
                  </button>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </motion.nav>
  )
}
