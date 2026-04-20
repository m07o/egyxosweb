import { NextRequest, NextResponse } from "next/server";
import { getSeasonDetails, TMDB_IMAGE } from "@/lib/tmdb";

export const dynamic = 'force-dynamic';

const CACHE_HEADERS = {
  "Cache-Control": "s-maxage=3600, stale-while-revalidate=86400",
};

function isTmdbConfigured(): boolean {
  const key = process.env.TMDB_API_KEY;
  return !!key && key !== 'your_tmdb_api_key_here';
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const tvId = parseInt(id, 10);
    if (isNaN(tvId)) {
      return NextResponse.json(
        { error: "Invalid TV show ID" },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const seasonNumber = parseInt(searchParams.get("season") || "1", 10);

    if (seasonNumber < 0) {
      return NextResponse.json(
        { error: "Season number must be positive" },
        { status: 400 }
      );
    }

    // ── DB Fallback when TMDB is not configured ──
    if (!isTmdbConfigured()) {
      const episodes = Array.from({ length: 10 }, (_, i) => ({
        id: `ep-${tvId}-${seasonNumber}-${i + 1}`,
        name: `الحلقة ${i + 1}`,
        overview: "",
        episodeNumber: i + 1,
        seasonNumber,
        airDate: null,
        runtime: 45,
        voteAverage: 0,
        voteCount: 0,
        stillUrl: "/poster1.jpg",
        stillPath: null,
      }));

      return NextResponse.json(
        {
          id: "season-placeholder",
          name: `الموسم ${seasonNumber}`,
          seasonNumber,
          overview: "",
          posterUrl: "/poster1.jpg",
          airDate: null,
          episodes,
        },
        { headers: CACHE_HEADERS }
      );
    }

    // ── Original TMDB logic ──
    const seasonDetails = await getSeasonDetails(tvId, seasonNumber);
    if (!seasonDetails) {
      return NextResponse.json(
        { error: "Season not found" },
        { status: 404 }
      );
    }

    // Format episodes with full image URLs
    const episodes = (seasonDetails.episodes || []).map((ep) => ({
      id: ep.id,
      name: ep.name,
      overview: ep.overview,
      episodeNumber: ep.episode_number,
      seasonNumber: ep.season_number,
      airDate: ep.air_date,
      runtime: ep.runtime,
      voteAverage: ep.vote_average,
      voteCount: ep.vote_count,
      stillUrl: TMDB_IMAGE.still(ep.still_path),
      stillPath: ep.still_path,
    }));

    return NextResponse.json(
      {
        id: seasonDetails.id,
        name: seasonDetails.name,
        seasonNumber: seasonDetails.season_number,
        overview: seasonDetails.overview,
        posterUrl: TMDB_IMAGE.poster(seasonDetails.poster_path),
        airDate: seasonDetails.air_date,
        episodes,
      },
      { headers: CACHE_HEADERS }
    );
  } catch (error: unknown) {
    const err = error as { message?: string };
    console.error("[API /tmdb/season] Error:", err.message);
    return NextResponse.json(
      { error: "Failed to fetch season details" },
      { status: 500 }
    );
  }
}
