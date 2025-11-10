import { NextRequest, NextResponse } from 'next/server';
import { kvStorage } from '@/lib/kv-storage';
import {
  validateTwitterCredentials,
  validateFacebookCredentials,
  validateLinkedInCredentials,
  validateYouTubeCredentials,
  validateSpotifyCredentials,
  validateRSSFeed,
  validateInstagramCredentials,
  validateThreadsCredentials,
  validateBlueskyCredentials
} from '@/lib/credential-validator';

export const runtime = 'nodejs';

/**
 * GET /api/automation/validate?level=1&platformId=youtube
 * Validate existing credentials in KV storage without re-entering them
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const level = parseInt(searchParams.get('level') || '1') as 1 | 2;
    const platformId = searchParams.get('platformId');

    if (!platformId) {
      return NextResponse.json({
        success: false,
        error: 'platformId is required'
      }, { status: 400 });
    }

    // Fetch existing credentials from KV
    const config = level === 1 
      ? await kvStorage.getLevel1Config()
      : await kvStorage.getLevel2Config();

    const platformConfig = config[platformId];
    
    if (!platformConfig?.credentials) {
      return NextResponse.json({
        success: false,
        error: 'No credentials found in storage'
      }, { status: 404 });
    }

    const credentials = platformConfig.credentials;

    // Validate credentials
    let validationResult: { valid: boolean; error?: string; personUrn?: string; userId?: string; username?: string; did?: string; handle?: string } = { valid: true };
    
    try {
      switch (platformId) {
        case 'twitter':
        case 'twitter-ainow':
          validationResult = await validateTwitterCredentials(
            credentials.appKey || '',
            credentials.appSecret || '',
            credentials.accessToken || '',
            credentials.accessSecret || ''
          );
          break;
        case 'facebook':
        case 'facebook-ainow':
          validationResult = await validateFacebookCredentials(
            credentials.pageId || '',
            credentials.pageAccessToken || ''
          );
          break;
        case 'linkedin': {
          const linkedInResult = await validateLinkedInCredentials(
            credentials.clientId || '',
            credentials.clientSecret || '',
            credentials.accessToken || ''
          );
          validationResult = linkedInResult;
          // If validation successful and personUrn returned, save it to KV
          if (linkedInResult.valid && linkedInResult.personUrn) {
            credentials.personUrn = linkedInResult.personUrn;
            console.log('✅ LinkedIn personUrn fetched and will be saved:', linkedInResult.personUrn);
          }
          break;
        }
        case 'instagram': {
          const instagramResult = await validateInstagramCredentials(
            credentials.accessToken || ''
          );
          validationResult = instagramResult;
          // If validation successful and userId returned, save it to KV
          if (instagramResult.valid && instagramResult.userId) {
            credentials.userId = instagramResult.userId;
            if (instagramResult.username) {
              credentials.username = instagramResult.username;
            }
            console.log('✅ Instagram user ID fetched and will be saved:', instagramResult.userId);
          }
          break;
        }
        case 'threads': {
          const threadsResult = await validateThreadsCredentials(
            credentials.accessToken || ''
          );
          validationResult = threadsResult;
          // If validation successful and userId returned, save it to KV
          if (threadsResult.valid && threadsResult.userId) {
            credentials.userId = threadsResult.userId;
            if (threadsResult.username) {
              credentials.username = threadsResult.username;
            }
            console.log('✅ Threads user ID fetched and will be saved:', threadsResult.userId);
          }
          break;
        }
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
            console.log('✅ Bluesky DID fetched and will be saved:', blueskyResult.did);
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
          if (credentials.clientId && credentials.clientSecret) {
            validationResult = await validateSpotifyCredentials(
              credentials.clientId,
              credentials.clientSecret,
              credentials.showId || ''
            );
          } else if (credentials.rssFeedUrl) {
            validationResult = await validateRSSFeed(credentials.rssFeedUrl);
          }
          break;
        case 'rumble':
          if (credentials.url) {
            validationResult = { valid: credentials.url.includes('rumble.com') };
            if (!validationResult.valid) {
              validationResult.error = 'Invalid Rumble URL';
            }
          }
          break;
        default:
          // Platforms without validators - just mark as valid if credentials exist
          validationResult = { valid: true };
      }
    } catch (error) {
      console.error(`Validation error for ${platformId}:`, error);
      validationResult = {
        valid: false,
        error: error instanceof Error ? error.message : 'Validation failed'
      };
    }

    // Update validation status in KV
    await kvStorage.saveCredentials(
      level, 
      platformId, 
      credentials, 
      platformConfig.enabled !== false,
      validationResult.valid
    );

    if (!validationResult.valid) {
      return NextResponse.json({
        success: false,
        error: validationResult.error || 'Credential validation failed',
        platformId,
        level
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: `${platformId} credentials validated successfully`,
      platformId,
      level
    });
  } catch (error) {
    console.error('❌ Error validating credentials:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/automation/validate
 * Validate platform credentials
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
      platform: string;
      credentials: Record<string, string>;
    };

    const { platform, credentials } = body;

    let result;

    switch (platform) {
      case 'twitter':
      case 'twitter-ainow':
        result = await validateTwitterCredentials(
          credentials.appKey,
          credentials.appSecret,
          credentials.accessToken,
          credentials.accessSecret
        );
        break;

      case 'facebook':
        result = await validateFacebookCredentials(
          credentials.pageId,
          credentials.pageAccessToken
        );
        break;

      case 'linkedin':
        result = await validateLinkedInCredentials(
          credentials.clientId,
          credentials.clientSecret,
          credentials.accessToken
        );
        break;

      case 'youtube':
        result = await validateYouTubeCredentials(
          credentials.apiKey,
          credentials.channelId
        );
        break;

      case 'spotify':
        // Try API first, fallback to RSS
        if (credentials.clientId && credentials.clientSecret) {
          result = await validateSpotifyCredentials(
            credentials.clientId,
            credentials.clientSecret,
            credentials.showId
          );
        } else if (credentials.rssFeedUrl) {
          result = await validateRSSFeed(credentials.rssFeedUrl);
        } else {
          result = { valid: false, error: 'No credentials provided' };
        }
        break;

      case 'rumble':
        // Just validate URL format
        if (credentials.url && credentials.url.includes('rumble.com')) {
          result = { valid: true };
        } else {
          result = { valid: false, error: 'Invalid Rumble URL' };
        }
        break;

      default:
        return NextResponse.json(
          { error: 'Unknown platform' },
          { status: 400 }
        );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Validation error:', error);
    return NextResponse.json(
      { 
        valid: false,
        error: error instanceof Error ? error.message : 'Validation failed'
      },
      { status: 500 }
    );
  }
}
