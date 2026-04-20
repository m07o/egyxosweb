'use client';

import { useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import MediaCardComponent from './MediaCard';
import type { MediaCard } from '@/lib/home-data';

interface ContentSliderProps {
  title: string;
  items: MediaCard[];
  seeAllLink?: string;
}

export default function ContentSlider({ title, items, seeAllLink }: ContentSliderProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 5);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 5);
  }, []);

  const scroll = useCallback((direction: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const scrollAmount = el.clientWidth * 0.75;
    el.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
    // Update after scroll animation
    setTimeout(updateScrollState, 350);
  }, [updateScrollState]);

  if (!items || items.length === 0) return null;

  return (
    <section className="relative py-4 sm:py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto">
        <h2 className="text-lg sm:text-xl font-bold text-white">{title}</h2>
        {seeAllLink && (
          <Link
            href={seeAllLink}
            className="flex items-center gap-1 text-sm font-medium text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            عرض الكل
            <ChevronLeft className="w-4 h-4" />
          </Link>
        )}
      </div>

      {/* Scroll container wrapper */}
      <div className="relative group/slider">
        {/* Right arrow */}
        {canScrollRight && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-0 bottom-0 z-10 w-12 bg-gradient-to-l from-[#0a0a0f] to-transparent flex items-center justify-start pl-1 opacity-0 group-hover/slider:opacity-100 transition-opacity duration-200"
            aria-label="التالي"
          >
            <div className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center text-white border border-white/[0.08]">
              <ChevronRight className="w-5 h-5" />
            </div>
          </button>
        )}

        {/* Left arrow */}
        {canScrollLeft && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-0 bottom-0 z-10 w-12 bg-gradient-to-r from-[#0a0a0f] to-transparent flex items-center justify-end pr-1 opacity-0 group-hover/slider:opacity-100 transition-opacity duration-200"
            aria-label="السابق"
          >
            <div className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center text-white border border-white/[0.08]">
              <ChevronLeft className="w-5 h-5" />
            </div>
          </button>
        )}

        {/* Scrollable row */}
        <div
          ref={scrollRef}
          onScroll={updateScrollState}
          className="flex gap-3 sm:gap-4 overflow-x-auto px-4 sm:px-6 lg:px-8 pb-2 scroll-smooth"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          <style jsx>{`
            div::-webkit-scrollbar {
              display: none;
            }
          `}</style>
          {items.map((item) => (
            <div
              key={item.id}
              className="shrink-0 w-[140px] sm:w-[170px] md:w-[190px] lg:w-[210px]"
            >
              <MediaCardComponent
                id={item.id}
                title={item.title}
                year={item.year}
                rating={item.rating}
                poster={item.poster}
                quality={item.quality}
                type={item.type}
                tags={item.tags}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
