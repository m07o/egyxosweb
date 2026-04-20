'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Play, Star } from 'lucide-react';
import type { MediaCard as MediaCardType } from '@/lib/home-data';

interface MediaCardProps {
  id: number;
  title: string;
  year: number;
  rating: number;
  poster: string;
  quality: string;
  type: 'movie' | 'series' | 'anime';
  tags?: string[];
}

function getTagStyle(tag: string): string {
  switch (tag) {
    case 'جديد':
      return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    case 'HD':
      return 'bg-sky-500/20 text-sky-400 border-sky-500/30';
    case 'حصري':
      return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    case 'مستمر':
    case 'مسلسل مستمر':
      return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
    default:
      return 'bg-white/10 text-slate-300 border-white/10';
  }
}

function getQualityColor(quality: string): string {
  if (quality.includes('4K')) return 'bg-rose-500/90 text-white';
  if (quality.includes('1080')) return 'bg-sky-500/90 text-white';
  if (quality.includes('720')) return 'bg-amber-500/90 text-white';
  if (quality.includes('480')) return 'bg-slate-500/90 text-white';
  return 'bg-sky-500/90 text-white';
}

export default function MediaCardComponent({
  id,
  title,
  year,
  rating,
  poster,
  quality,
  type,
  tags = [],
}: MediaCardProps) {
  const [imgError, setImgError] = useState(false);
  const posterSrc = imgError ? '/placeholder-poster.svg' : poster;

  return (
    <Link href={`/details/${id}`} className="group block">
      <motion.div
        whileHover={{ scale: 1.03 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="relative rounded-xl overflow-hidden bg-[#161920] shadow-lg"
      >
        {/* Poster */}
        <div className="relative aspect-[2/3] w-full overflow-hidden">
          <Image
            src={posterSrc}
            alt={title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-110"
            sizes="(max-width: 640px) 140px, (max-width: 1024px) 180px, 220px"
            onError={() => setImgError(true)}
          />

          {/* Top-left quality badge */}
          <div className="absolute top-2 right-2 z-10">
            <span
              className={`inline-flex items-center px-2 py-0.5 text-[10px] font-bold rounded-md ${getQualityColor(quality)}`}
            >
              {quality}
            </span>
          </div>

          {/* Type badge - top area */}
          <div className="absolute top-2 left-2 z-10">
            <span
              className={`inline-flex items-center px-2 py-0.5 text-[10px] font-bold rounded-md ${
                type === 'anime'
                  ? 'bg-pink-500/80 text-white'
                  : type === 'series'
                  ? 'bg-violet-500/80 text-white'
                  : 'bg-orange-500/80 text-white'
              }`}
            >
              {type === 'anime' ? 'أنمي' : type === 'series' ? 'مسلسل' : 'فيلم'}
            </span>
          </div>

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100 z-10">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              whileHover={{ scale: 1, opacity: 1 }}
              className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-900/40"
            >
              <Play className="w-5 h-5 text-white fill-white mr-[-2px]" />
            </motion.div>
          </div>

          {/* Bottom gradient overlay */}
          <div className="absolute bottom-0 left-0 right-0 h-3/4 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />

          {/* Bottom info */}
          <div className="absolute bottom-0 left-0 right-0 p-3 z-[5]">
            {/* Tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className={`inline-flex items-center px-1.5 py-0.5 text-[9px] font-semibold rounded border ${getTagStyle(tag)}`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Title */}
            <h3 className="text-sm font-bold text-white leading-tight line-clamp-2 mb-1.5">
              {title}
            </h3>

            {/* Year & Rating */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400">{year}</span>
              <span className="flex items-center gap-1 text-amber-400">
                <Star className="w-3 h-3 fill-amber-400" />
                <span className="font-semibold">{rating.toFixed(1)}</span>
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
