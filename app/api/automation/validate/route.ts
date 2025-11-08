import { NextRequest, NextResponse } from 'next/server';
import {
  validateTwitterCredentials,
  validateFacebookCredentials,
  validateLinkedInCredentials,
  validateYouTubeCredentials,
  validateSpotifyCredentials,
  validateRSSFeed
} from '@/lib/credential-validator';

export const runtime = 'nodejs';

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
