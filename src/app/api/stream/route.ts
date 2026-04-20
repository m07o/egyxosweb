import { NextRequest, NextResponse } from 'next/server';

// ============================================================
// GET /api/stream?tmdbId=157336&mediaType=movie&season=1&episode=1
// Returns embed streaming URLs from multiple free servers
// ============================================================

interface StreamServer {
  id: string;
  name: string;
  url: string;
  type: string;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tmdbId = searchParams.get('tmdbId');
  const mediaType = searchParams.get('mediaType') || 'movie';
  const season = searchParams.get('season') || '1';
  const episode = searchParams.get('episode') || '1';

  if (!tmdbId) {
    return NextResponse.json(
      { error: 'معرّف TMDB مطلوب' },
      { status: 400 }
    );
  }

  const servers: StreamServer[] = [];

  // Server 1: vidsrc.xyz
  if (mediaType === 'movie') {
    servers.push({
      id: 'server1',
      name: 'سيرفر 1',
      url: `https://vidsrc.xyz/embed/movie/${tmdbId}`,
      type: 'embed',
    });
  } else {
    servers.push({
      id: 'server1',
      name: 'سيرفر 1',
      url: `https://vidsrc.xyz/embed/tv/${tmdbId}/${season}/${episode}`,
      type: 'embed',
    });
  }

  // Server 2: vidsrc.to
  if (mediaType === 'movie') {
    servers.push({
      id: 'server2',
      name: 'سيرفر 2',
      url: `https://vidsrc.to/embed/movie/${tmdbId}`,
      type: 'embed',
    });
  } else {
    servers.push({
      id: 'server2',
      name: 'سيرفر 2',
      url: `https://vidsrc.to/embed/tv/${tmdbId}/${season}/${episode}`,
      type: 'embed',
    });
  }

  // Server 3: multiembed.mov (works for both)
  servers.push({
    id: 'server3',
    name: 'سيرفر 3',
    url: `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1`,
    type: 'embed',
  });

  // Server 4: moviesapi.club (movies only)
  if (mediaType === 'movie') {
    servers.push({
      id: 'server4',
      name: 'سيرفر 4',
      url: `https://moviesapi.club/movie/${tmdbId}`,
      type: 'embed',
    });
  }

  // Server 5: embed.su
  if (mediaType === 'movie') {
    servers.push({
      id: 'server5',
      name: 'سيرفر 5',
      url: `https://embed.su/embed/movie/${tmdbId}`,
      type: 'embed',
    });
  } else {
    servers.push({
      id: 'server5',
      name: 'سيرفر 5',
      url: `https://embed.su/embed/tv/${tmdbId}/${season}/${episode}`,
      type: 'embed',
    });
  }

  return NextResponse.json({ servers });
}
