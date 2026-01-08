import { NextRequest, NextResponse } from 'next/server';
import { kvStorage } from '@/lib/kv-storage';
import {
  validateTwitterCredentials,
  validateFacebookCredentials,
  validateLinkedInCredentials,
  validateYouTubeCredentials,
  validateSpotifyCredentials,
  validateRSSFeed,
  validateThreadsCredentials,
  validateBlueskyCredentials,
  validateInstagramCredentials
} from '@/lib/credential-validator';

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
          validated: level1KV.youtube?.validated || false,
          validatedAt: level1KV.youtube?.validatedAt,
          credentials: {
            apiKey: (level1KV.youtube?.credentials?.apiKey || process.env.YOUTUBE_API_KEY) ? '(configured)' : '',
            channelId: level1KV.youtube?.credentials?.channelId || process.env.YOUTUBE_CHANNEL_ID || ''
          }
        },
        rumble: {
          configured: !!(level1KV.rumble?.credentials?.url || process.env.RUMBLE_URL),
          validated: level1KV.rumble?.validated || false,
          validatedAt: level1KV.rumble?.validatedAt,
          credentials: {
            url: level1KV.rumble?.credentials?.url || process.env.RUMBLE_URL || ''
          }
        },
        spotify: {
          configured: !!(
            // Primary: Spotify API credentials
            ((level1KV.spotify?.credentials?.clientId || process.env.SPOTIFY_CLIENT_ID) &&
            (level1KV.spotify?.credentials?.clientSecret || process.env.SPOTIFY_CLIENT_SECRET) &&
            (level1KV.spotify?.credentials?.showId || process.env.SPOTIFY_SHOW_ID)) ||
            // Fallback: RSS feed URL
            (level1KV.spotify?.credentials?.rssFeedUrl || process.env.SPOTIFY_RSS_FEED_URL)
          ),
          validated: level1KV.spotify?.validated || false,
          validatedAt: level1KV.spotify?.validatedAt,
          credentials: {
            clientId: level1KV.spotify?.credentials?.clientId || process.env.SPOTIFY_CLIENT_ID || '',
            clientSecret: (level1KV.spotify?.credentials?.clientSecret || process.env.SPOTIFY_CLIENT_SECRET) ? '(configured)' : '',
            showId: level1KV.spotify?.credentials?.showId || process.env.SPOTIFY_SHOW_ID || '',
            rssFeedUrl: level1KV.spotify?.credentials?.rssFeedUrl || process.env.SPOTIFY_RSS_FEED_URL || ''
          }
        }
      },
      level2: {
        twitter: {
          configured: !!(
            (level2KV.twitter?.credentials?.appKey || process.env.TWITTER_API_KEY_V2U) &&
            (level2KV.twitter?.credentials?.appSecret || process.env.TWITTER_API_SECRET_V2U) &&
            (level2KV.twitter?.credentials?.accessToken || process.env.TWITTER_ACCESS_TOKEN_V2U) &&
            (level2KV.twitter?.credentials?.accessSecret || process.env.TWITTER_ACCESS_SECRET_V2U)
          ),
          validated: level2KV.twitter?.validated || false,
          validatedAt: level2KV.twitter?.validatedAt,
          enabled: level2KV.twitter?.enabled !== false,
          credentials: {
            appKey: level2KV.twitter?.credentials?.appKey || process.env.TWITTER_API_KEY_V2U || '',
            appSecret: (level2KV.twitter?.credentials?.appSecret || process.env.TWITTER_API_SECRET_V2U) ? '(configured)' : '',
            accessToken: level2KV.twitter?.credentials?.accessToken || process.env.TWITTER_ACCESS_TOKEN_V2U || '',
            accessSecret: (level2KV.twitter?.credentials?.accessSecret || process.env.TWITTER_ACCESS_SECRET_V2U) ? '(configured)' : ''
          }
        },
        'twitter-ainow': {
          configured: !!(
            (level2KV['twitter-ainow']?.credentials?.appKey || process.env.TWITTER_API_KEY_AI) &&
            (level2KV['twitter-ainow']?.credentials?.appSecret || process.env.TWITTER_API_SECRET_AI) &&
            (level2KV['twitter-ainow']?.credentials?.accessToken || process.env.TWITTER_ACCESS_TOKEN_AI) &&
            (level2KV['twitter-ainow']?.credentials?.accessSecret || process.env.TWITTER_ACCESS_SECRET_AI)
          ),
          validated: level2KV['twitter-ainow']?.validated || false,
          validatedAt: level2KV['twitter-ainow']?.validatedAt,
          enabled: level2KV['twitter-ainow']?.enabled !== false,
          credentials: {
            appKey: level2KV['twitter-ainow']?.credentials?.appKey || process.env.TWITTER_API_KEY_AI || '',
            appSecret: (level2KV['twitter-ainow']?.credentials?.appSecret || process.env.TWITTER_API_SECRET_AI) ? '(configured)' : '',
            accessToken: level2KV['twitter-ainow']?.credentials?.accessToken || process.env.TWITTER_ACCESS_TOKEN_AI || '',
            accessSecret: (level2KV['twitter-ainow']?.credentials?.accessSecret || process.env.TWITTER_ACCESS_SECRET_AI) ? '(configured)' : ''
          }
        },
        facebook: {
          configured: !!(
            (level2KV.facebook?.credentials?.pageId || process.env.FACEBOOK_PAGE_ID_V2U) &&
            (level2KV.facebook?.credentials?.pageAccessToken || process.env.FACEBOOK_ACCESS_TOKEN_V2U)
          ),
          validated: level2KV.facebook?.validated || false,
          validatedAt: level2KV.facebook?.validatedAt,
          enabled: level2KV.facebook?.enabled !== false,
          credentials: {
            pageId: level2KV.facebook?.credentials?.pageId || process.env.FACEBOOK_PAGE_ID_V2U || '',
            pageAccessToken: (level2KV.facebook?.credentials?.pageAccessToken || process.env.FACEBOOK_ACCESS_TOKEN_V2U) ? '(configured)' : ''
          }
        },
        'facebook-ainow': {
          configured: !!(
            (level2KV['facebook-ainow']?.credentials?.pageId || process.env.FACEBOOK_PAGE_ID_AI) &&
            (level2KV['facebook-ainow']?.credentials?.pageAccessToken || process.env.FACEBOOK_ACCESS_TOKEN_AI)
          ),
          validated: level2KV['facebook-ainow']?.validated || false,
          validatedAt: level2KV['facebook-ainow']?.validatedAt,
          enabled: level2KV['facebook-ainow']?.enabled !== false,
          credentials: {
            pageId: level2KV['facebook-ainow']?.credentials?.pageId || process.env.FACEBOOK_PAGE_ID_AI || '',
            pageAccessToken: (level2KV['facebook-ainow']?.credentials?.pageAccessToken || process.env.FACEBOOK_ACCESS_TOKEN_AI) ? '(configured)' : ''
          }
        },
        linkedin: {
          configured: !!(
            (level2KV.linkedin?.credentials?.clientId || process.env.LINKEDIN_CLIENT_ID) &&
            (level2KV.linkedin?.credentials?.clientSecret || process.env.LINKEDIN_CLIENT_SECRET) &&
            (level2KV.linkedin?.credentials?.accessToken || process.env.LINKEDIN_ACCESS_TOKEN)
          ),
          validated: level2KV.linkedin?.validated || false,
          validatedAt: level2KV.linkedin?.validatedAt,
          enabled: level2KV.linkedin?.enabled !== false,
          credentials: {
            clientId: level2KV.linkedin?.credentials?.clientId || process.env.LINKEDIN_CLIENT_ID || '',
            clientSecret: (level2KV.linkedin?.credentials?.clientSecret || process.env.LINKEDIN_CLIENT_SECRET) ? '(configured)' : '',
            accessToken: level2KV.linkedin?.credentials?.accessToken || process.env.LINKEDIN_ACCESS_TOKEN || '',
            personUrn: level2KV.linkedin?.credentials?.personUrn || process.env.LINKEDIN_PERSON_URN || '',
            organizationUrn: level2KV.linkedin?.credentials?.organizationUrn || ''
          }
        },
        instagram: {
          configured: !!(level2KV.instagram?.credentials?.accessToken || process.env.INSTAGRAM_ACCESS_TOKEN),
          validated: level2KV.instagram?.validated || false,
          validatedAt: level2KV.instagram?.validatedAt,
          enabled: level2KV.instagram?.enabled === true,
          credentials: {
            appId: level2KV.instagram?.credentials?.appId || process.env.META_APP_ID_AI || '',
            appSecret: level2KV.instagram?.credentials?.appSecret || process.env.META_APP_SECRET_AI || '',
            accessToken: level2KV.instagram?.credentials?.accessToken || process.env.INSTAGRAM_ACCESS_TOKEN || '',
            userId: level2KV.instagram?.credentials?.userId || '',
            username: level2KV.instagram?.credentials?.username || ''
          }
        },
        'instagram-ainow': {
          configured: !!(level2KV['instagram-ainow']?.credentials?.accessToken),
          validated: level2KV['instagram-ainow']?.validated || false,
          validatedAt: level2KV['instagram-ainow']?.validatedAt,
          enabled: level2KV['instagram-ainow']?.enabled !== false,
          credentials: {
            appId: level2KV['instagram-ainow']?.credentials?.appId || process.env.META_APP_ID_AI || '',
            appSecret: level2KV['instagram-ainow']?.credentials?.appSecret || process.env.META_APP_SECRET_AI || '',
            accessToken: level2KV['instagram-ainow']?.credentials?.accessToken || '',
            userId: level2KV['instagram-ainow']?.credentials?.userId || '',
            username: level2KV['instagram-ainow']?.credentials?.username || ''
          }
        },
        threads: {
          configured: !!(level2KV.threads?.credentials?.accessToken || process.env.THREADS_ACCESS_TOKEN),
          validated: level2KV.threads?.validated || false,
          validatedAt: level2KV.threads?.validatedAt,
          enabled: level2KV.threads?.enabled === true,
          credentials: {
            accessToken: level2KV.threads?.credentials?.accessToken || process.env.THREADS_ACCESS_TOKEN || '',
            userId: level2KV.threads?.credentials?.userId || '',
            username: level2KV.threads?.credentials?.username || ''
          }
        },
        tiktok: {
          configured: !!(level2KV.tiktok?.credentials?.url || process.env.TIKTOK_URL),
          validated: level2KV.tiktok?.validated || false,
          validatedAt: level2KV.tiktok?.validatedAt,
          enabled: level2KV.tiktok?.enabled === true,
          credentials: {
            url: level2KV.tiktok?.credentials?.url || process.env.TIKTOK_URL || ''
          }
        },
        odysee: {
          configured: !!(level2KV.odysee?.credentials?.url || process.env.ODYSEE_URL),
          validated: level2KV.odysee?.validated || false,
          validatedAt: level2KV.odysee?.validatedAt,
          enabled: level2KV.odysee?.enabled === true,
          credentials: {
            url: level2KV.odysee?.credentials?.url || process.env.ODYSEE_URL || ''
          }
        },
        vimeo: {
          configured: !!(level2KV.vimeo?.credentials?.url || process.env.VIMEO_URL),
          validated: level2KV.vimeo?.validated || false,
          validatedAt: level2KV.vimeo?.validatedAt,
          enabled: level2KV.vimeo?.enabled === true,
          credentials: {
            url: level2KV.vimeo?.credentials?.url || process.env.VIMEO_URL || ''
          }
        },
        bluesky: {
          configured: !!(
            (level2KV.bluesky?.credentials?.username || process.env.BLUESKY_USERNAME) &&
            (level2KV.bluesky?.credentials?.appPassword || process.env.BLUESKY_APP_PASSWORD)
          ),
          validated: level2KV.bluesky?.validated || false,
          validatedAt: level2KV.bluesky?.validatedAt,
          enabled: level2KV.bluesky?.enabled !== false,
          credentials: {
            username: level2KV.bluesky?.credentials?.username || process.env.BLUESKY_USERNAME || '',
            appPassword: (level2KV.bluesky?.credentials?.appPassword || process.env.BLUESKY_APP_PASSWORD) ? '(configured)' : '',
            did: level2KV.bluesky?.credentials?.did || '',
            handle: level2KV.bluesky?.credentials?.handle || ''
          }
        }
      }
    };

    // Load post results for level 2 platforms
    const platformIds = ['twitter', 'twitter-ainow', 'facebook', 'facebook-ainow', 'linkedin', 'instagram', 'threads', 'tiktok', 'odysee', 'vimeo', 'bluesky'] as const;
    for (const platformId of platformIds) {
      const postResult = await kvStorage.getPostResult(platformId);
      if (postResult && config.level2[platformId]) {
        (config.level2[platformId] as Record<string, unknown>).lastPostResult = postResult as Record<string, unknown>;
      }
    }

    return NextResponse.json(config, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
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

    // Get existing credentials from KV to handle masked values during validation
    const existingConfig = await kvStorage.getCredentials(level, platformId);
    const existingCreds = existingConfig?.credentials || {};
    
    // Build validation credentials: use real values from KV for masked fields
    const validationCreds: Record<string, string> = {};
    for (const [key, value] of Object.entries(credentials)) {
      // Use existing value if this is a masked field
      if (value === '(configured)' || value === '***' || value.startsWith('••••••••')) {
        validationCreds[key] = existingCreds[key] || '';
      } else {
        validationCreds[key] = value;
      }
    }
    // Add any existing credentials not in the request
    for (const [key, value] of Object.entries(existingCreds)) {
      if (!(key in validationCreds)) {
        validationCreds[key] = value;
      }
    }

    // Validate credentials before saving
    let validationResult: { valid: boolean; error?: string } = { valid: true };
    
    try {
      switch (platformId) {
        case 'twitter':
        case 'twitter-ainow':
          validationResult = await validateTwitterCredentials(
            validationCreds.appKey || '',
            validationCreds.appSecret || '',
            validationCreds.accessToken || '',
            validationCreds.accessSecret || ''
          );
          break;
        case 'facebook':
        case 'facebook-ainow': {
          const facebookResult = await validateFacebookCredentials(
            validationCreds.pageId || '',
            validationCreds.pageAccessToken || '',
            validationCreds.appId || process.env.FACEBOOK_APP_ID,
            validationCreds.appSecret || process.env.FACEBOOK_APP_SECRET
          );
          validationResult = facebookResult;
          
          // If we got a long-lived token, replace the existing token
          if (facebookResult.valid && facebookResult.longLivedToken) {
            credentials.pageAccessToken = facebookResult.longLivedToken;
            if (facebookResult.expiresAt) {
              credentials.tokenExpiresAt = facebookResult.expiresAt;
            }
            credentials.tokenRefreshedAt = new Date().toISOString();
            console.log('✅ Facebook long-lived token obtained and saved, expires:', facebookResult.expiresAt);
          } else if (facebookResult.valid && facebookResult.expiresAt) {
            credentials.tokenExpiresAt = facebookResult.expiresAt;
            credentials.tokenRefreshedAt = new Date().toISOString();
            console.log('⚠️ Using provided Facebook token, expires:', facebookResult.expiresAt);
          }
          break;
        }
        case 'linkedin': {
          const linkedInResult = await validateLinkedInCredentials(
            validationCreds.clientId || '',
            validationCreds.clientSecret || '',
            validationCreds.accessToken || '',
            validationCreds.organizationUrn || undefined
          );
          validationResult = linkedInResult;
          // If validation successful and personUrn returned, add it to credentials
          if (linkedInResult.valid && linkedInResult.personUrn) {
            credentials.personUrn = linkedInResult.personUrn;
            console.log('✅ LinkedIn personUrn fetched and added to credentials:', linkedInResult.personUrn);
          }
          // If organizationUrn was validated, it's already in credentials
          if (linkedInResult.valid && linkedInResult.organizationUrn) {
            console.log('✅ LinkedIn organizationUrn validated:', linkedInResult.organizationUrn);
          }
          break;
        }
        case 'youtube':
          validationResult = await validateYouTubeCredentials(
            credentials.apiKey || '',
            credentials.channelId || ''
          );
          break;
        case 'spotify':
          // Try API validation first, fallback to RSS
          if (credentials.clientId && credentials.clientSecret) {
            validationResult = await validateSpotifyCredentials(
              credentials.clientId,
              credentials.clientSecret,
              credentials.refreshToken || ''
            );
          } else if (credentials.rssFeedUrl) {
            validationResult = await validateRSSFeed(credentials.rssFeedUrl);
          }
          break;
        case 'instagram':
        case 'threads': {
          // Both use Meta Graph API
          if (platformId === 'threads') {
            const threadsResult = await validateThreadsCredentials(
              credentials.accessToken || ''
            );
            validationResult = threadsResult;
            // If validation successful and userId returned, add it to credentials
            if (threadsResult.valid && threadsResult.userId) {
              credentials.userId = threadsResult.userId;
              if (threadsResult.username) {
                credentials.username = threadsResult.username;
              }
              console.log('✅ Threads user ID and username fetched:', { 
                userId: threadsResult.userId, 
                username: threadsResult.username 
              });
            }
          } else {
            // Instagram
            const instagramResult = await validateInstagramCredentials(
              credentials.accessToken || '',
              credentials.userId || ''
            );
            validationResult = instagramResult;
            // If validation successful and userId returned, add it to credentials
            if (instagramResult.valid && instagramResult.userId) {
              credentials.userId = instagramResult.userId;
              if (instagramResult.username) {
                credentials.username = instagramResult.username;
              }
              console.log('✅ Instagram user ID and username fetched:', { 
                userId: instagramResult.userId, 
                username: instagramResult.username 
              });
            }
          }
          break;
        }
        case 'tiktok':
        case 'odysee':
        case 'vimeo':
          // These platforms don't have validators yet - accept any credentials
          validationResult = { valid: true };
          break;
        case 'bluesky': {
          const blueskyResult = await validateBlueskyCredentials(
            credentials.username || '',
            credentials.appPassword || ''
          );
          validationResult = blueskyResult;
          // If validation successful, save DID and handle
          if (blueskyResult.valid && blueskyResult.did) {
            credentials.did = blueskyResult.did;
            if (blueskyResult.handle) {
              credentials.handle = blueskyResult.handle;
            }
            console.log('✅ Bluesky authentication successful:', { 
              did: blueskyResult.did, 
              handle: blueskyResult.handle 
            });
          }
          break;
        }
        default:
          validationResult = { valid: true };
      }
    } catch (error) {
      console.error(`Validation error for ${platformId}:`, error);
      validationResult = {
        valid: false,
        error: error instanceof Error ? error.message : 'Validation failed'
      };
    }

    // Save credentials with validation status
    await kvStorage.saveCredentials(level, platformId, credentials, enabled, validationResult.valid);

    // If validation failed, return error
    if (!validationResult.valid) {
      console.log(`❌ Validation failed for ${platformId}:`, validationResult.error);
      return NextResponse.json({
        success: false,
        error: validationResult.error || 'Credential validation failed. Please check your credentials and try again.',
        platformId,
        level
      }, { status: 400 });
    }

    console.log(`✅ Successfully saved and validated ${platformId} config`);

    return NextResponse.json({
      success: true,
      message: `${platformId} configuration saved and validated`,
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
