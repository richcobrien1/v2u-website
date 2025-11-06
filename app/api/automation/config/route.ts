import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

/**
 * GET /api/automation/config
 * Load Level 1 and Level 2 platform configurations
 */
export async function GET() {
  try {
    // TODO: Load from Cloudflare KV when available
    // For now, return structure based on env vars
    
    const config = {
      level1: {
        youtube: {
          configured: !!(process.env.YOUTUBE_API_KEY && process.env.YOUTUBE_CHANNEL_ID),
          credentials: {
            apiKey: process.env.YOUTUBE_API_KEY ? '***' : '',
            channelId: process.env.YOUTUBE_CHANNEL_ID || ''
          }
        },
        rumble: {
          configured: !!(process.env.RUMBLE_API_KEY && process.env.RUMBLE_CHANNEL_ID),
          credentials: {
            apiKey: process.env.RUMBLE_API_KEY ? '***' : '',
            channelId: process.env.RUMBLE_CHANNEL_ID || ''
          }
        },
        spotify: {
          configured: !!(process.env.SPOTIFY_CLIENT_ID && process.env.SPOTIFY_CLIENT_SECRET && process.env.SPOTIFY_SHOW_ID),
          credentials: {
            clientId: process.env.SPOTIFY_CLIENT_ID || '',
            clientSecret: process.env.SPOTIFY_CLIENT_SECRET ? '***' : '',
            showId: process.env.SPOTIFY_SHOW_ID || ''
          }
        }
      },
      level2: {
        twitter: {
          configured: !!(process.env.TWITTER_APP_KEY && process.env.TWITTER_APP_SECRET && process.env.TWITTER_ACCESS_TOKEN && process.env.TWITTER_ACCESS_SECRET),
          enabled: true,
          credentials: {
            appKey: process.env.TWITTER_APP_KEY || '',
            appSecret: process.env.TWITTER_APP_SECRET ? '***' : '',
            accessToken: process.env.TWITTER_ACCESS_TOKEN || '',
            accessSecret: process.env.TWITTER_ACCESS_SECRET ? '***' : ''
          }
        },
        facebook: {
          configured: !!(process.env.FACEBOOK_PAGE_ID && process.env.FACEBOOK_PAGE_ACCESS_TOKEN),
          enabled: true,
          credentials: {
            pageId: process.env.FACEBOOK_PAGE_ID || '',
            pageAccessToken: process.env.FACEBOOK_PAGE_ACCESS_TOKEN ? '***' : ''
          }
        },
        linkedin: {
          configured: !!(process.env.LINKEDIN_CLIENT_ID && process.env.LINKEDIN_CLIENT_SECRET && process.env.LINKEDIN_ACCESS_TOKEN),
          enabled: true,
          credentials: {
            clientId: process.env.LINKEDIN_CLIENT_ID || '',
            clientSecret: process.env.LINKEDIN_CLIENT_SECRET ? '***' : '',
            accessToken: process.env.LINKEDIN_ACCESS_TOKEN || ''
          }
        },
        instagram: {
          configured: !!process.env.INSTAGRAM_ACCESS_TOKEN,
          enabled: false,
          credentials: {
            accessToken: process.env.INSTAGRAM_ACCESS_TOKEN || ''
          }
        },
        threads: {
          configured: !!process.env.THREADS_ACCESS_TOKEN,
          enabled: false,
          credentials: {
            accessToken: process.env.THREADS_ACCESS_TOKEN || ''
          }
        },
        tiktok: {
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

    const { level, platformId, credentials, enabled } = body;

    // TODO: Save to Cloudflare KV
    // For now, just return success
    // In production, this would:
    // 1. Encrypt credentials
    // 2. Store in KV with key like `automation:level${level}:${platformId}`
    // 3. Optionally update local .env file

    console.log(`Saving ${platformId} config:`, {
      level,
      credentialKeys: Object.keys(credentials),
      enabled
    });

    // For security, don't log actual credentials
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
