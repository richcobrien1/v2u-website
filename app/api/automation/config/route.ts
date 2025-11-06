import { NextRequest, NextResponse } from 'next/server';
import { kvStorage } from '@/lib/kv-storage';

export const runtime = 'nodejs';

/**
 * GET /api/automation/config
 * Load Level 1 and Level 2 platform configurations
 */
export async function GET() {
  try {
    // Try to load from KV first, fallback to env vars
    const level1KV = await kvStorage.getLevel1Config();
    const level2KV = await kvStorage.getLevel2Config();
    
    const config = {
      level1: {
        youtube: level1KV.youtube || {
          configured: !!(process.env.YOUTUBE_API_KEY && process.env.YOUTUBE_CHANNEL_ID),
          credentials: {
            apiKey: process.env.YOUTUBE_API_KEY ? '***' : '',
            channelId: process.env.YOUTUBE_CHANNEL_ID || ''
          }
        },
        rumble: level1KV.rumble || {
          configured: !!(process.env.RUMBLE_API_KEY && process.env.RUMBLE_CHANNEL_ID),
          credentials: {
            apiKey: process.env.RUMBLE_API_KEY ? '***' : '',
            channelId: process.env.RUMBLE_CHANNEL_ID || ''
          }
        },
        spotify: level1KV.spotify || {
          configured: !!(process.env.SPOTIFY_CLIENT_ID && process.env.SPOTIFY_CLIENT_SECRET && process.env.SPOTIFY_SHOW_ID),
          credentials: {
            clientId: process.env.SPOTIFY_CLIENT_ID || '',
            clientSecret: process.env.SPOTIFY_CLIENT_SECRET ? '***' : '',
            showId: process.env.SPOTIFY_SHOW_ID || ''
          }
        }
      },
      level2: {
        twitter: level2KV.twitter || {
          configured: !!(process.env.TWITTER_APP_KEY),
          enabled: true,
          credentials: {
            appKey: process.env.TWITTER_APP_KEY || '',
            appSecret: process.env.TWITTER_APP_SECRET ? '***' : '',
            accessToken: process.env.TWITTER_ACCESS_TOKEN || '',
            accessSecret: process.env.TWITTER_ACCESS_SECRET ? '***' : ''
          }
        },
        facebook: level2KV.facebook || {
          configured: !!(process.env.FACEBOOK_PAGE_ID),
          enabled: true,
          credentials: {
            pageId: process.env.FACEBOOK_PAGE_ID || '',
            pageAccessToken: process.env.FACEBOOK_PAGE_ACCESS_TOKEN ? '***' : ''
          }
        },
        linkedin: level2KV.linkedin || {
          configured: !!(process.env.LINKEDIN_CLIENT_ID),
          enabled: true,
          credentials: {
            clientId: process.env.LINKEDIN_CLIENT_ID || '',
            clientSecret: process.env.LINKEDIN_CLIENT_SECRET ? '***' : '',
            accessToken: process.env.LINKEDIN_ACCESS_TOKEN || ''
          }
        },
        instagram: level2KV.instagram || {
          configured: !!process.env.INSTAGRAM_ACCESS_TOKEN,
          enabled: false,
          credentials: {
            accessToken: process.env.INSTAGRAM_ACCESS_TOKEN || ''
          }
        },
        threads: level2KV.threads || {
          configured: !!process.env.THREADS_ACCESS_TOKEN,
          enabled: false,
          credentials: {
            accessToken: process.env.THREADS_ACCESS_TOKEN || ''
          }
        },
        tiktok: level2KV.tiktok || {
          configured: !!process.env.TIKTOK_ACCESS_TOKEN,
          enabled: false,
          credentials: {
            accessToken: process.env.TIKTOK_ACCESS_TOKEN || ''
          }
        }
      }
    };

    return NextResponse.json(config);
  } catch (error) {
    console.error('Error loading config:', error);
    return NextResponse.json(
      { error: 'Failed to load configuration' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/automation/config
 * Save platform credentials to Cloudflare KV and local .env
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json() as {
      level: 1 | 2;
      platformId: string;
      credentials: Record<string, string>;
      enabled?: boolean;
    };

    const { level, platformId, credentials, enabled = true } = body;

    // Save to Cloudflare KV with encryption
    await kvStorage.saveCredentials(level, platformId, credentials, enabled);

    console.log(`Saved ${platformId} config to KV:`, {
      level,
      credentialKeys: Object.keys(credentials),
      enabled
    });

    return NextResponse.json({
      success: true,
      message: `${platformId} configuration saved`,
      platformId,
      level
    });
  } catch (error) {
    console.error('Error saving config:', error);
    return NextResponse.json(
      { error: 'Failed to save configuration' },
      { status: 500 }
    );
  }
}
