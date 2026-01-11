import { NextRequest, NextResponse } from 'next/server';
import { getAuthorizationUrl } from '@/lib/platforms/youtube-uploader';
import { kvStorage } from '@/lib/kv-storage';

export const runtime = 'nodejs';

/**
 * GET /api/youtube/auth
 * Initiate YouTube OAuth flow
 */
export async function GET(request: NextRequest) {
  try {
    // Get YouTube config from KV
    const level1Config = await kvStorage.getLevel1Config();
    const youtubeConfig = level1Config?.youtube;

    if (!youtubeConfig?.credentials?.clientId || !youtubeConfig?.credentials?.clientSecret) {
      return NextResponse.json({
        error: 'YouTube OAuth not configured',
        message: 'Please configure YouTube OAuth credentials in youtube.json and upload to KV',
      }, { status: 400 });
    }

    const credentials = {
      clientId: youtubeConfig.credentials.clientId,
      clientSecret: youtubeConfig.credentials.clientSecret,
      redirectUri: youtubeConfig.credentials.redirectUri || 'https://www.v2u.us/api/youtube/callback',
    };

    // Generate authorization URL
    const authUrl = getAuthorizationUrl(credentials);

    // Store state for verification (optional but recommended)
    const state = Math.random().toString(36).substring(7);
    await kvStorage.saveToKV(`youtube:oauth:state:${state}`, JSON.stringify({
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 minutes
    }));

    const authUrlWithState = `${authUrl}&state=${state}`;

    console.log('🔐 YouTube OAuth flow initiated');
    console.log(`🔗 Redirect to: ${authUrlWithState}`);

    return NextResponse.json({
      success: true,
      authUrl: authUrlWithState,
      message: 'Redirect user to authUrl to authorize YouTube access',
    });
  } catch (error) {
    console.error('❌ YouTube OAuth initiation failed:', error);
    return NextResponse.json({
      error: 'Failed to initiate YouTube OAuth',
      message: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
