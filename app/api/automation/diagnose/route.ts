import { NextResponse } from 'next/server';
import { kvStorage } from '@/lib/kv-storage';

export const runtime = 'nodejs';

/**
 * GET /api/automation/diagnose
 * Check Level 2 platform configurations and credentials
 */
export async function GET() {
  try {
    const level2Config = await kvStorage.getLevel2Config();
    const latestEpisode = await kvStorage.getLatestEpisode();

    const diagnostics = {
      timestamp: new Date().toISOString(),
      episode: latestEpisode ? {
        title: latestEpisode.title,
        hasYouTube: !!latestEpisode.youtubeUrl,
        hasSpotify: !!latestEpisode.spotifyUrl,
        hasRumble: !!latestEpisode.rumbleUrl,
        publishedAt: latestEpisode.publishedAt
      } : null,
      platforms: {} as Record<string, unknown>
    };

    for (const [platformId, config] of Object.entries(level2Config)) {
      const creds = config.credentials || {};
      
      diagnostics.platforms[platformId] = {
        configured: config.configured,
        validated: config.validated,
        enabled: config.enabled,
        validatedAt: config.validatedAt,
        credentials: Object.keys(creds).reduce((acc, key) => {
          const value = creds[key];
          if (typeof value === 'string') {
            acc[key] = {
              present: !!value,
              length: value.length,
              preview: value.substring(0, 10) + '...' + value.substring(value.length - 4)
            };
          } else {
            acc[key] = { present: !!value };
          }
          return acc;
        }, {} as Record<string, unknown>)
      };
    }

    return NextResponse.json(diagnostics, { status: 200 });

  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Failed to run diagnostics',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
