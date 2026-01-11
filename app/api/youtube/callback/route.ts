import { NextRequest, NextResponse } from 'next/server';
import { getTokensFromCode } from '@/lib/platforms/youtube-uploader';
import { kvStorage } from '@/lib/kv-storage';

export const runtime = 'nodejs';

/**
 * GET /api/youtube/callback?code=xxx&state=xxx
 * Handle YouTube OAuth callback
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    // Check for OAuth errors
    if (error) {
      console.error('❌ YouTube OAuth error:', error);
      return NextResponse.redirect(
        new URL(`/admin/settings?youtube_error=${encodeURIComponent(error)}`, request.url)
      );
    }

    if (!code) {
      return NextResponse.json({
        error: 'Missing authorization code',
      }, { status: 400 });
    }

    // Verify state (optional but recommended)
    if (state) {
      const stateData = await kvStorage.getFromKV(`youtube:oauth:state:${state}`);
      if (!stateData) {
        console.warn('⚠️ Invalid or expired OAuth state');
      }
      // Clean up state
      await kvStorage.deleteFromKV(`youtube:oauth:state:${state}`);
    }

    // Get YouTube config
    const level1Config = await kvStorage.getLevel1Config();
    const youtubeConfig = level1Config?.youtube;

    if (!youtubeConfig?.credentials?.clientId || !youtubeConfig?.credentials?.clientSecret) {
      return NextResponse.json({
        error: 'YouTube OAuth not configured',
      }, { status: 400 });
    }

    const credentials = {
      clientId: youtubeConfig.credentials.clientId,
      clientSecret: youtubeConfig.credentials.clientSecret,
      redirectUri: youtubeConfig.credentials.redirectUri || 'https://www.v2u.us/api/youtube/callback',
    };

    console.log('🔄 Exchanging authorization code for tokens...');

    // Exchange code for tokens
    const tokens = await getTokensFromCode(credentials, code);

    console.log('✅ YouTube tokens obtained');
    console.log(`🔑 Access token expires: ${new Date(tokens.expiryDate).toISOString()}`);

    // Update KV with tokens
    const updatedConfig = {
      ...youtubeConfig,
      credentials: {
        ...youtubeConfig.credentials,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiryDate: tokens.expiryDate,
      },
      configured: true,
      updatedAt: new Date().toISOString(),
    };

    await kvStorage.saveLevel1Config('youtube', updatedConfig);

    console.log('💾 YouTube tokens saved to KV');

    // Redirect to admin page with success message
    return NextResponse.redirect(
      new URL('/admin/settings?youtube_success=true', request.url)
    );
  } catch (error) {
    console.error('❌ YouTube OAuth callback failed:', error);
    
    // Redirect to admin page with error
    return NextResponse.redirect(
      new URL(
        `/admin/settings?youtube_error=${encodeURIComponent(
          error instanceof Error ? error.message : 'Unknown error'
        )}`,
        request.url
      )
    );
  }
}
