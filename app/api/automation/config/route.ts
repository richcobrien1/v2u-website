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
        youtube: {
          configured: !!(
            (level1KV.youtube?.credentials?.apiKey || process.env.YOUTUBE_API_KEY) &&
            (level1KV.youtube?.credentials?.channelId || process.env.YOUTUBE_CHANNEL_ID)
          ),
          credentials: {
            apiKey: (level1KV.youtube?.credentials?.apiKey || process.env.YOUTUBE_API_KEY) ? '(configured)' : '',
            channelId: level1KV.youtube?.credentials?.channelId || process.env.YOUTUBE_CHANNEL_ID || ''
          }
        },
        rumble: {
          configured: !!(
            (level1KV.rumble?.credentials?.apiKey || process.env.RUMBLE_API_KEY) &&
            (level1KV.rumble?.credentials?.channelId || process.env.RUMBLE_CHANNEL_ID)
          ),
          credentials: {
            apiKey: (level1KV.rumble?.credentials?.apiKey || process.env.RUMBLE_API_KEY) ? '(configured)' : '',
            channelId: level1KV.rumble?.credentials?.channelId || process.env.RUMBLE_CHANNEL_ID || ''
          }
        },
        spotify: {
          configured: !!(
            (level1KV.spotify?.credentials?.clientId || process.env.SPOTIFY_CLIENT_ID) &&
            (level1KV.spotify?.credentials?.clientSecret || process.env.SPOTIFY_CLIENT_SECRET) &&
            (level1KV.spotify?.credentials?.showId || process.env.SPOTIFY_SHOW_ID)
          ),
          credentials: {
            clientId: level1KV.spotify?.credentials?.clientId || process.env.SPOTIFY_CLIENT_ID || '',
            clientSecret: (level1KV.spotify?.credentials?.clientSecret || process.env.SPOTIFY_CLIENT_SECRET) ? '(configured)' : '',
            showId: level1KV.spotify?.credentials?.showId || process.env.SPOTIFY_SHOW_ID || ''
          }
        }
      },
      level2: {
        twitter: {
          configured: !!(
            (level2KV.twitter?.credentials?.appKey || process.env.TWITTER_APP_KEY) &&
            (level2KV.twitter?.credentials?.appSecret || process.env.TWITTER_APP_SECRET) &&
            (level2KV.twitter?.credentials?.accessToken || process.env.TWITTER_ACCESS_TOKEN) &&
            (level2KV.twitter?.credentials?.accessSecret || process.env.TWITTER_ACCESS_SECRET)
          ),
          enabled: level2KV.twitter?.enabled !== false,
          credentials: {
            appKey: level2KV.twitter?.credentials?.appKey || process.env.TWITTER_APP_KEY || '',
            appSecret: (level2KV.twitter?.credentials?.appSecret || process.env.TWITTER_APP_SECRET) ? '(configured)' : '',
            accessToken: level2KV.twitter?.credentials?.accessToken || process.env.TWITTER_ACCESS_TOKEN || '',
            accessSecret: (level2KV.twitter?.credentials?.accessSecret || process.env.TWITTER_ACCESS_SECRET) ? '(configured)' : ''
          }
        },
        'twitter-ainow': {
          configured: !!(
            (level2KV['twitter-ainow']?.credentials?.appKey || process.env.TWITTER_AINOW_APP_KEY) &&
            (level2KV['twitter-ainow']?.credentials?.appSecret || process.env.TWITTER_AINOW_APP_SECRET) &&
            (level2KV['twitter-ainow']?.credentials?.accessToken || process.env.TWITTER_AINOW_ACCESS_TOKEN) &&
            (level2KV['twitter-ainow']?.credentials?.accessSecret || process.env.TWITTER_AINOW_ACCESS_SECRET)
          ),
          enabled: level2KV['twitter-ainow']?.enabled !== false,
          credentials: {
            appKey: level2KV['twitter-ainow']?.credentials?.appKey || process.env.TWITTER_AINOW_APP_KEY || '',
            appSecret: (level2KV['twitter-ainow']?.credentials?.appSecret || process.env.TWITTER_AINOW_APP_SECRET) ? '(configured)' : '',
            accessToken: level2KV['twitter-ainow']?.credentials?.accessToken || process.env.TWITTER_AINOW_ACCESS_TOKEN || '',
            accessSecret: (level2KV['twitter-ainow']?.credentials?.accessSecret || process.env.TWITTER_AINOW_ACCESS_SECRET) ? '(configured)' : ''
          }
        },
        facebook: {
          configured: !!(
            (level2KV.facebook?.credentials?.pageId || process.env.FACEBOOK_PAGE_ID) &&
            (level2KV.facebook?.credentials?.pageAccessToken || process.env.FACEBOOK_PAGE_ACCESS_TOKEN)
          ),
          enabled: level2KV.facebook?.enabled !== false,
          credentials: {
            pageId: level2KV.facebook?.credentials?.pageId || process.env.FACEBOOK_PAGE_ID || '',
            pageAccessToken: (level2KV.facebook?.credentials?.pageAccessToken || process.env.FACEBOOK_PAGE_ACCESS_TOKEN) ? '(configured)' : ''
          }
        },
        linkedin: {
          configured: !!(
            (level2KV.linkedin?.credentials?.clientId || process.env.LINKEDIN_CLIENT_ID) &&
            (level2KV.linkedin?.credentials?.clientSecret || process.env.LINKEDIN_CLIENT_SECRET) &&
            (level2KV.linkedin?.credentials?.accessToken || process.env.LINKEDIN_ACCESS_TOKEN)
          ),
          enabled: level2KV.linkedin?.enabled !== false,
          credentials: {
            clientId: level2KV.linkedin?.credentials?.clientId || process.env.LINKEDIN_CLIENT_ID || '',
            clientSecret: (level2KV.linkedin?.credentials?.clientSecret || process.env.LINKEDIN_CLIENT_SECRET) ? '(configured)' : '',
            accessToken: level2KV.linkedin?.credentials?.accessToken || process.env.LINKEDIN_ACCESS_TOKEN || ''
          }
        },
        instagram: {
          configured: !!(level2KV.instagram?.credentials?.accessToken || process.env.INSTAGRAM_ACCESS_TOKEN),
          enabled: level2KV.instagram?.enabled === true,
          credentials: {
            accessToken: level2KV.instagram?.credentials?.accessToken || process.env.INSTAGRAM_ACCESS_TOKEN || ''
          }
        },
        threads: {
          configured: !!(level2KV.threads?.credentials?.accessToken || process.env.THREADS_ACCESS_TOKEN),
          enabled: level2KV.threads?.enabled === true,
          credentials: {
            accessToken: level2KV.threads?.credentials?.accessToken || process.env.THREADS_ACCESS_TOKEN || ''
          }
        },
        tiktok: {
          configured: !!(level2KV.tiktok?.credentials?.url || process.env.TIKTOK_URL),
          enabled: level2KV.tiktok?.enabled === true,
          credentials: {
            url: level2KV.tiktok?.credentials?.url || process.env.TIKTOK_URL || ''
          }
        },
        odysee: {
          configured: !!(level2KV.odysee?.credentials?.url || process.env.ODYSEE_URL),
          enabled: level2KV.odysee?.enabled === true,
          credentials: {
            url: level2KV.odysee?.credentials?.url || process.env.ODYSEE_URL || ''
          }
        },
        vimeo: {
          configured: !!(level2KV.vimeo?.credentials?.url || process.env.VIMEO_URL),
          enabled: level2KV.vimeo?.enabled === true,
          credentials: {
            url: level2KV.vimeo?.credentials?.url || process.env.VIMEO_URL || ''
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

    console.log(`Attempting to save ${platformId} config:`, {
      level,
      credentialKeys: Object.keys(credentials),
      enabled,
      env: {
        hasAccountId: !!process.env.CLOUDFLARE_ACCOUNT_ID,
        hasApiToken: !!process.env.CLOUDFLARE_API_TOKEN,
        hasNamespaceId: !!process.env.CLOUDFLARE_KV_NAMESPACE_ID
      }
    });

    // Save to Cloudflare KV with encryption
    await kvStorage.saveCredentials(level, platformId, credentials, enabled);

    console.log(`✅ Successfully saved ${platformId} config to KV`);

    return NextResponse.json({
      success: true,
      message: `${platformId} configuration saved`,
      platformId,
      level
    });
  } catch (error) {
    console.error('❌ Error saving config:', error);
    return NextResponse.json(
      { 
        error: 'Failed to save configuration',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
