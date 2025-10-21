import { NextResponse } from 'next/server';
import { fetchR2Episodes, checkR2Configuration } from '@/lib/r2-episodes';

export const runtime = 'nodejs';

export async function GET() {
  try {
    // Check if R2 is configured
    const isConfigured = await checkR2Configuration();

    // If R2 isn't configured we still return a 200 with fallback/mock episodes
    // to keep the public dashboard/pages resilient. fetchR2Episodes() already
    // returns sensible fallback data when the client is not available.
    const episodes = await fetchR2Episodes();
    const usingMockData = !isConfigured;
    const source = isConfigured ? 'r2-bucket' : 'mock-fallback';

    return NextResponse.json({
      success: true,
      episodes,
      count: episodes.length,
      source,
      bucket: process.env.R2_BUCKET || 'private',
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