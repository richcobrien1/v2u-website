import { NextResponse } from 'next/server';
import { kvStorage } from '@/lib/kv-storage';

export const runtime = 'nodejs';

/**
 * GET /api/automation/logs
 * Get recent automation activity logs
 */
export async function GET() {
  try {
    // Get the last 10 posted videos to see activity
    const recentPosts = [];
    
    // Try to get status to see if there's useful info
    const status = await kvStorage.getStatus();
    
    // Get YouTube config
    const level1Config = await kvStorage.getLevel1Config();
    const level2Config = await kvStorage.getLevel2Config();

    return NextResponse.json({
      status,
      youtubeConfigured: level1Config?.youtube?.configured || false,
      twitterConfigured: level2Config?.twitter?.configured || false,
      twitterEnabled: level2Config?.twitter?.enabled || false,
      recentPosts,
      note: "Check Vercel logs for detailed execution logs"
    });
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to get logs',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
