import { NextResponse } from 'next/server';
import { fetchR2Episodes, checkR2Configuration } from '@/lib/r2-episodes';
import { readFile } from 'fs/promises';
import path from 'path';

export const runtime = 'nodejs';

interface PlatformUrls {
  youtubeUrl?: string;
  rumbleUrl?: string;
  spotifyUrl?: string;
}

export async function GET() {
  try {
    // Check if R2 is configured
    const isConfigured = await checkR2Configuration();

    // If R2 isn't configured we still return a 200 with fallback/mock episodes
    // to keep the public dashboard/pages resilient. fetchR2Episodes() already
    // returns sensible fallback data when the client is not available.
    const episodes = await fetchR2Episodes();
    
    // Load platform URLs from file
    let platformsData: Record<string, PlatformUrls> = {};
    try {
      const dataPath = path.join(process.cwd(), 'data', 'episode-platforms.json');
      const fileContent = await readFile(dataPath, 'utf-8');
      platformsData = JSON.parse(fileContent);
    } catch (error) {
      // File doesn't exist, that's okay
      console.log('No episode-platforms.json found, episodes will have no platform URLs');
    }

    // Merge platform URLs into episodes
    const episodesWithPlatforms = episodes.map((episode: any) => ({
      ...episode,
      youtubeUrl: platformsData[episode.id]?.youtubeUrl,
      rumbleUrl: platformsData[episode.id]?.rumbleUrl,
      spotifyUrl: platformsData[episode.id]?.spotifyUrl,
    }));

    const usingMockData = !isConfigured;
    const source = isConfigured ? 'r2-bucket' : 'mock-fallback';

    return NextResponse.json({
      success: true,
      episodes: episodesWithPlatforms,
      count: episodesWithPlatforms.length,
      source,
      bucket: process.env.R2_BUCKET || 'public',
      usingMockData,
      note: usingMockData
        ? 'R2 not configured - returning fallback/mock episodes. Set R2_ENDPOINT, R2_ACCESS_KEY and R2_SECRET_KEY to enable real R2 data.'
        : undefined,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('API Error fetching episodes:', error);

    return NextResponse.json({
      error: 'Failed to fetch episodes',
      message: error instanceof Error ? error.message : 'Unknown error',
      episodes: [],
      usingMockData: true
    }, { status: 500 });
  }
}