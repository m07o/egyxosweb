import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// ============================================================
// GET /api/stream/resolve?slug=interstellar-2014
// Resolves a movie slug to TMDB ID, mediaType, and title
// ============================================================

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug');

  if (!slug) {
    return NextResponse.json(
      { error: 'الرابط (slug) مطلوب' },
      { status: 400 }
    );
  }

  try {
    const movie = await db.movie.findUnique({
      where: { slug },
      select: {
        id: true,
        title: true,
        originalTitle: true,
        mediaType: true,
      },
    });

    if (!movie) {
      return NextResponse.json(
        { error: 'لم يتم العثور على المحتوى' },
        { status: 404 }
      );
    }

    // Extract numeric TMDB ID from string ID like "tmdb-157336"
    let tmdbId: number | null = null;
    const match = movie.id.match(/tmdb-(\d+)/);
    if (match) {
      tmdbId = parseInt(match[1], 10);
    }

    return NextResponse.json({
      tmdbId,
      mediaType: movie.mediaType,
      title: movie.title,
      originalTitle: movie.originalTitle,
    });
  } catch (error) {
    console.error('Error resolving slug:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء البحث' },
      { status: 500 }
    );
  }
}
