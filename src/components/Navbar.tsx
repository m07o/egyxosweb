'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clapperboard,
  Search,
  Menu,
  X,
  User,
  LogOut,
  ChevronDown,
} from 'lucide-react';

const navLinks = [
  { href: '/', label: 'الرئيسية' },
  { href: '/browse', label: 'تصفح' },
  { href: '/watchlist', label: 'قائمتي' },
];

export default function Navbar() {
  const { data: session } = useSession();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close profile dropdown on outside click
  useEffect(() => {
    if (!profileOpen) return;
    const handleClick = () => setProfileOpen(false);
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [profileOpen]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#0a0a0f]/95 backdrop-blur-xl shadow-lg shadow-black/20'
          : 'bg-gradient-to-b from-black/70 to-transparent backdrop-blur-sm'
      }`}
    >
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-18">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
              <Clapperboard className="w-5 h-5 text-emerald-400" />
            </div>
            <span className="text-white font-bold text-lg hidden sm:inline">
              سينما <span className="text-emerald-400">بلس</span>
            </span>
          </Link>

          {/* Desktop nav links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white rounded-lg hover:bg-white/5 transition-all duration-200"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center gap-2">
            {/* Search */}
            <Link
              href="/search"
              className="flex items-center justify-center w-10 h-10 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 transition-all duration-200"
              aria-label="البحث"
            >
              <Search className="w-5 h-5" />
            </Link>

            {/* Auth section - desktop */}
            <div className="hidden md:flex items-center gap-2">
              {session ? (
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setProfileOpen(!profileOpen);
                    }}
                    className="flex items-center gap-2 h-10 px-3 bg-white/[0.06] hover:bg-white/[0.1] text-white text-sm font-medium rounded-xl transition-all duration-200 border border-white/[0.06]"
                  >
                    <div className="w-7 h-7 rounded-full bg-emerald-500/20 flex items-center justify-center">
                      <User className="w-4 h-4 text-emerald-400" />
                    </div>
                    <span className="max-w-[100px] truncate">
                      {session.user?.name}
                    </span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                        profileOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  <AnimatePresence>
                    {profileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.96 }}
                        transition={{ duration: 0.15 }}
                        className="absolute left-0 top-full mt-2 w-48 bg-[#1a1d25] border border-white/[0.08] rounded-xl shadow-xl shadow-black/30 overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="p-3 border-b border-white/[0.06]">
                          <p className="text-sm font-medium text-white truncate">
                            {session.user?.name}
                          </p>
                          <p className="text-xs text-slate-500 truncate mt-0.5">
                            {session.user?.email}
                          </p>
                        </div>
                        <div className="p-1.5">
                          <Link
                            href="/profile"
                            className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/[0.06] rounded-lg transition-colors"
                          >
                            <User className="w-4 h-4" />
                            حسابي
                          </Link>
                          <button
                            onClick={() => signOut({ callbackUrl: '/' })}
                            className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-300 hover:text-red-400 hover:bg-white/[0.06] rounded-lg transition-colors w-full"
                          >
                            <LogOut className="w-4 h-4" />
                            تسجيل الخروج
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="flex items-center gap-2 h-10 px-5 text-sm font-medium text-slate-300 hover:text-white rounded-xl hover:bg-white/5 transition-all duration-200"
                  >
                    دخول
                  </Link>
                  <Link
                    href="/signup"
                    className="flex items-center gap-2 h-10 px-5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-emerald-900/30"
                  >
                    تسجيل جديد
                  </Link>
                </>
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden flex items-center justify-center w-10 h-10 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 transition-all duration-200"
              aria-label="القائمة"
            >
              {mobileOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-[#0a0a0f]/98 backdrop-blur-xl border-t border-white/[0.06] overflow-hidden"
          >
            <div className="max-w-[1400px] mx-auto px-4 py-4 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center px-4 py-3 text-sm font-medium text-slate-300 hover:text-white rounded-xl hover:bg-white/5 transition-all duration-200"
                >
                  {link.label}
                </Link>
              ))}

              <div className="border-t border-white/[0.06] my-2" />

              {session ? (
                <div className="space-y-1">
                  <Link
                    href="/profile"
                    className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-300 hover:text-white rounded-xl hover:bg-white/5 transition-all duration-200"
                  >
                    <User className="w-4 h-4" />
                    حسابي
                  </Link>
                  <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-300 hover:text-red-400 rounded-xl hover:bg-white/5 transition-all duration-200 w-full"
                  >
                    <LogOut className="w-4 h-4" />
                    تسجيل الخروج
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2 pt-2">
                  <Link
                    href="/login"
                    className="flex items-center justify-center h-11 text-sm font-medium text-slate-300 hover:text-white rounded-xl border border-white/[0.08] hover:bg-white/5 transition-all duration-200"
                  >
                    دخول
                  </Link>
                  <Link
                    href="/signup"
                    className="flex items-center justify-center h-11 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-xl transition-all duration-200"
                  >
                    تسجيل جديد
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
