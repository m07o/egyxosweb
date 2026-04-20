import { NextResponse } from 'next/server';
import { getMovieGenres, getTvGenres } from '@/lib/tmdb';

export const dynamic = 'force-dynamic';
export const revalidate = 86400; // 24 hours - genres rarely change

function isTmdbConfigured(): boolean {
  const key = process.env.TMDB_API_KEY;
  return !!key && key !== 'your_tmdb_api_key_here';
}

export async function GET() {
  try {
    // ── DB Fallback when TMDB is not configured ──
    if (!isTmdbConfigured()) {
      return NextResponse.json({
        movieGenres: [
          { id: 28, name: 'أكشن' },
          { id: 12, name: 'مغامرة' },
          { id: 16, name: 'أنيميشن' },
          { id: 35, name: 'كوميدي' },
          { id: 80, name: 'جريمة' },
          { id: 99, name: 'وثائقي' },
          { id: 18, name: 'دراما' },
          { id: 10751, name: 'عائلي' },
          { id: 14, name: 'فانتازيا' },
          { id: 36, name: 'تاريخ' },
          { id: 27, name: 'رعب' },
          { id: 10402, name: 'موسيقى' },
          { id: 9648, name: 'غموض' },
          { id: 10749, name: 'رومانسي' },
          { id: 878, name: 'خيال علمي' },
          { id: 10770, name: 'مسلسل قصير' },
          { id: 53, name: 'إثارة' },
          { id: 10752, name: 'حرب' },
        ],
        tvGenres: [
          { id: 10759, name: 'أكشن ومغامرة' },
          { id: 16, name: 'أنيميشن' },
          { id: 35, name: 'كوميدي' },
          { id: 80, name: 'جريمة' },
          { id: 99, name: 'وثائقي' },
          { id: 18, name: 'دراما' },
          { id: 10751, name: 'عائلي' },
          { id: 10762, name: 'أطفال' },
          { id: 9648, name: 'غموض' },
          { id: 10763, name: 'أخبار' },
          { id: 10764, name: 'واقعي' },
          { id: 10765, name: 'خيال علمي وفانتازيا' },
          { id: 10766, name: 'صاب أوبرا' },
          { id: 10767, name: 'حديث' },
          { id: 10768, name: 'حرب وسياسة' },
          { id: 37, name: 'غربي' },
        ],
      });
    }

    // ── Original TMDB logic ──
    const [movieGenres, tvGenres] = await Promise.all([
      getMovieGenres(),
      getTvGenres(),
    ]);

    return NextResponse.json({
      movieGenres,
      tvGenres,
    });
  } catch (error) {
    console.error('[API /tmdb/genres] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch genres' },
      { status: 500 }
    );
  }
}
