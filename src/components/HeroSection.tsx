'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Info, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { heroSlides } from '@/lib/home-data';
import type { HeroSlide } from '@/lib/home-data';

interface HeroSectionProps {
  slides?: HeroSlide[];
}

export default function HeroSection({ slides: propSlides }: HeroSectionProps) {
  const activeSlides = propSlides && propSlides.length > 0 ? propSlides : heroSlides;
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);

  const goNext = useCallback(() => {
    setDirection(1);
    setCurrent((prev) => (prev + 1) % activeSlides.length);
  }, [activeSlides.length]);

  const goPrev = useCallback(() => {
    setDirection(-1);
    setCurrent((prev) => (prev - 1 + activeSlides.length) % activeSlides.length);
  }, [activeSlides.length]);

  const goTo = useCallback(
    (index: number) => {
      setDirection(index > current ? 1 : -1);
      setCurrent(index);
    },
    [current]
  );

  // Auto-rotate
  useEffect(() => {
    const timer = setInterval(goNext, 7000);
    return () => clearInterval(timer);
  }, [goNext]);

  const slide = activeSlides[current];
  if (!slide) return null;

  const variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? '100%' : '-100%',
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? '-100%' : '100%',
      opacity: 0,
    }),
  };

  return (
    <section className="relative w-full h-[70vh] min-h-[500px] max-h-[800px] overflow-hidden select-none">
      <AnimatePresence initial={false} custom={direction} mode="wait">
        <motion.div
          key={slide.id}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          className="absolute inset-0"
        >
          {/* Background image */}
          <div className="absolute inset-0">
            <Image
              src={slide.backdrop}
              alt={slide.title}
              fill
              className="object-cover"
              priority={current === 0}
              sizes="100vw"
            />
            {/* Gradient overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0f]/80 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#0a0a0f] to-transparent" />
          </div>

          {/* Content */}
          <div className="relative z-10 h-full flex items-end pb-16 sm:pb-20 md:pb-24">
            <div className="max-w-[1400px] mx-auto w-full px-4 sm:px-6 lg:px-8">
              <div className="max-w-2xl">
                {/* Tags */}
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  {slide.tags.map((tag) => (
                    <span
                      key={tag}
                      className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-lg border ${
                        tag === 'جديد'
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                          : tag === 'HD'
                          ? 'bg-sky-500/20 text-sky-400 border-sky-500/30'
                          : tag === 'حصري'
                          ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                          : 'bg-white/10 text-slate-300 border-white/10'
                      }`}
                    >
                      {tag}
                    </span>
                  ))}
                  <span className="inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-lg bg-sky-500/20 text-sky-400 border border-sky-500/30">
                    {slide.quality}
                  </span>
                </div>

                {/* Title */}
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight mb-2">
                  {slide.title}
                </h1>

                {/* Original title */}
                {slide.originalTitle && (
                  <p className="text-sm sm:text-base text-slate-400 mb-3">
                    {slide.originalTitle}
                  </p>
                )}

                {/* Meta row */}
                <div className="flex flex-wrap items-center gap-3 mb-4 text-sm">
                  {slide.rating > 0 && (
                    <span className="flex items-center gap-1 text-amber-400 font-semibold">
                      <Star className="w-4 h-4 fill-amber-400" />
                      {slide.rating.toFixed(1)}
                    </span>
                  )}
                  {slide.year > 0 && (
                    <>
                      <span className="text-slate-500">|</span>
                      <span className="text-slate-300">{slide.year}</span>
                    </>
                  )}
                  {slide.duration && (
                    <>
                      <span className="text-slate-500">|</span>
                      <span className="text-slate-300">{slide.duration}</span>
                    </>
                  )}
                  <span className="text-slate-500">|</span>
                  <span className="text-emerald-400 font-medium">
                    {slide.type === 'movie' ? 'فيلم' : 'مسلسل'}
                  </span>
                </div>

                {/* Genre tags */}
                {slide.genres.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-5">
                    {slide.genres.map((genre) => (
                      <span
                        key={genre}
                        className="px-3 py-1 text-xs text-slate-300 bg-white/[0.06] border border-white/[0.08] rounded-full"
                      >
                        {genre}
                      </span>
                    ))}
                  </div>
                )}

                {/* Story excerpt */}
                {slide.story && (
                  <p className="text-sm sm:text-base text-slate-400 leading-relaxed line-clamp-2 sm:line-clamp-3 mb-6 max-w-xl">
                    {slide.story}
                  </p>
                )}

                {/* Action buttons */}
                <div className="flex flex-wrap gap-3">
                  <Link
                    href={`/details/${slide.mediaId}`}
                    className="inline-flex items-center gap-2 h-11 px-6 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-emerald-900/40"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    مشاهدة الآن
                  </Link>
                  <Link
                    href={`/details/${slide.mediaId}`}
                    className="inline-flex items-center gap-2 h-11 px-6 bg-white/[0.08] hover:bg-white/[0.14] text-white text-sm font-bold rounded-xl border border-white/[0.1] transition-all duration-200 backdrop-blur-sm"
                  >
                    <Info className="w-4 h-4" />
                    تفاصيل
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation arrows */}
      <button
        onClick={goPrev}
        className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-sm flex items-center justify-center text-white transition-all duration-200 border border-white/[0.08]"
        aria-label="السابق"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={goNext}
        className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-sm flex items-center justify-center text-white transition-all duration-200 border border-white/[0.08]"
        aria-label="التالي"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Dots indicator */}
      <div className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        {activeSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => goTo(index)}
            className={`transition-all duration-300 rounded-full ${
              index === current
                ? 'w-8 h-2.5 bg-emerald-500'
                : 'w-2.5 h-2.5 bg-white/30 hover:bg-white/50'
            }`}
            aria-label={`الانتقال إلى الشريحة ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
