import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

/**
 * Facebook Token Refresh Endpoint
 * 
 * Exchanges short-lived tokens for long-lived tokens
 * and gets never-expiring Page Access Tokens
 * 
 * GET /api/facebook/refresh-token?userToken=SHORT_TOKEN&account=v2u|ainow
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userAccessToken = searchParams.get('userToken');
    const account = searchParams.get('account') || 'v2u';

    if (!userAccessToken) {
      return NextResponse.json(
        { 
          error: 'Missing userToken parameter',
          usage: 'GET /api/facebook/refresh-token?userToken=YOUR_TOKEN&account=v2u|ainow'
        },
        { status: 400 }
      );
    }

    // Facebook app credentials (same for both accounts)
    const appId = '1385433963019785';
    const appSecret = '8495b40412e90e4e136c048c9ff15519';

    // Page IDs
    const pageIds = {
      v2u: '565965183263645',
      ainow: '809650095556499'
    };

    const pageId = pageIds[account as keyof typeof pageIds];

    console.log(`Refreshing token for ${account} (Page ID: ${pageId})`);

    // Step 1: Exchange short-lived user token for long-lived user token
    const exchangeUrl = `https://graph.facebook.com/v18.0/oauth/access_token?` +
      `grant_type=fb_exchange_token&` +
      `client_id=${appId}&` +
      `client_secret=${appSecret}&` +
      `fb_exchange_token=${userAccessToken}`;

    console.log('Step 1: Exchanging for long-lived user token...');
    const exchangeResponse = await fetch(exchangeUrl);
    
    if (!exchangeResponse.ok) {
      const error = await exchangeResponse.json();
      console.error('Token exchange failed:', error);
      return NextResponse.json(
        { error: 'Failed to exchange token', details: error },
        { status: 500 }
      );
    }

    const exchangeData = await exchangeResponse.json();
    const longLivedUserToken = exchangeData.access_token;
    const userTokenExpires = exchangeData.expires_in; // Usually 5184000 seconds (60 days)

    console.log(`Long-lived user token obtained (expires in ${userTokenExpires / 86400} days)`);

    // Step 2: Get never-expiring Page Access Token
    const pageTokenUrl = `https://graph.facebook.com/v18.0/${pageId}?` +
      `fields=access_token&` +
      `access_token=${longLivedUserToken}`;

    console.log('Step 2: Getting never-expiring Page Access Token...');
    const pageResponse = await fetch(pageTokenUrl);

    if (!pageResponse.ok) {
      const error = await pageResponse.json();
      console.error('Page token fetch failed:', error);
      return NextResponse.json(
        { error: 'Failed to get page token', details: error },
        { status: 500 }
      );
    }

    const pageData = await pageResponse.json();
    const pageAccessToken = pageData.access_token;

    // Step 3: Verify the token and check expiration
    const debugUrl = `https://graph.facebook.com/v18.0/debug_token?` +
      `input_token=${pageAccessToken}&` +
      `access_token=${appId}|${appSecret}`;

    console.log('Step 3: Verifying token...');
    const debugResponse = await fetch(debugUrl);
    const debugData = await debugResponse.json();

    const tokenInfo = debugData.data;
    const expiresAt = tokenInfo.expires_at === 0 ? 'never' : new Date(tokenInfo.expires_at * 1000).toISOString();

    console.log('Token info:', {
      valid: tokenInfo.is_valid,
      expiresAt,
      scopes: tokenInfo.scopes
    });

    // Step 4: Prepare configuration
    const config = {
      credentials: {
        appId,
        appSecret,
        pageId,
        pageAccessToken,
        tokenExpiresAt: expiresAt,
        tokenRefreshedAt: new Date().toISOString()
      },
      enabled: true,
      configured: true,
      updatedAt: new Date().toISOString(),
      _note: expiresAt === 'never' 
        ? `${account === 'v2u' ? 'V2U' : 'AI-Now'} Facebook Page - Page Access Token never expires`
        : `${account === 'v2u' ? 'V2U' : 'AI-Now'} Facebook Page - Token expires ${expiresAt}`
    };

    return NextResponse.json({
      success: true,
      account,
      pageId,
      tokenInfo: {
        isValid: tokenInfo.is_valid,
        expiresAt,
        type: tokenInfo.type,
        appId: tokenInfo.app_id
      },
      config,
      instructions: [
        `✅ Token refreshed successfully for ${account}`,
        '',
        'Copy the configuration below and update:',
        account === 'v2u' ? '📄 facebook.json' : '📄 facebook-ainow.json',
        '',
        'Then sync to Cloudflare KV:',
        '1. Run: npm run sync-tokens',
        '2. Or manually update KV key: level2:facebook' + (account === 'ainow' ? '-ainow' : ''),
        '',
        expiresAt === 'never' 
          ? '✨ This is a never-expiring Page Access Token!'
          : `⚠️  This token expires on ${expiresAt}. You may need to refresh it again.`
      ].join('\n')
    });

  } catch (error) {
    console.error('Token refresh error:', error);
    return NextResponse.json(
      {
        error: 'Token refresh failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
