import { NextRequest, NextResponse } from 'next/server';
import { fetchR2Episodes, checkR2Configuration } from '@/lib/r2-episodes';

export async function GET() {
  try {
    // Check if R2 is configured
    const isConfigured = await checkR2Configuration();
    
    if (!isConfigured) {
      return NextResponse.json({
        error: 'R2 not configured',
        message: 'R2 credentials not found or invalid',
        episodes: [],
        usingMockData: true,
        note: 'Configure R2_ENDPOINT, R2_ACCESS_KEY, and R2_SECRET_KEY in environment variables'
      }, { status: 503 });
    }

    // Fetch episodes from R2
    const episodes = await fetchR2Episodes();
    
    return NextResponse.json({
      success: true,
      episodes,
      count: episodes.length,
      source: 'r2-bucket',
      bucket: process.env.R2_BUCKET || 'v2u-assets',
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