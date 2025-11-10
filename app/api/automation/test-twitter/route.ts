import { NextRequest, NextResponse } from 'next/server';
import { postTweet } from '@/lib/twitter-oauth';
import { kvStorage } from '@/lib/kv-storage';

export const runtime = 'nodejs';

/**
 * POST /api/automation/test-twitter
 * Test Twitter posting with detailed debug information
 * 
 * Usage:
 * POST https://v2u.ai/api/automation/test-twitter
 * Body: { "platformId": "twitter" | "twitter-ainow", "text": "Test tweet" }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { platformId?: string; text?: string };
    const platformId = body.platformId || 'twitter';
    const text = body.text || `Test tweet from V2U.ai - ${new Date().toISOString()}`;

    console.log(`\n========================================`);
    console.log(`Twitter OAuth Debug Test - ${platformId}`);
    console.log(`========================================\n`);

    // Get credentials from KV
    const level2Config = await kvStorage.getLevel2Config();
    const config = level2Config[platformId];

    if (!config?.credentials) {
      return NextResponse.json({
        success: false,
        error: `No credentials found for ${platformId}`,
        help: 'Configure credentials in admin panel first'
      }, { status: 400 });
    }

    const credentials = config.credentials as {
      appKey?: string;
      appSecret?: string;
      accessToken?: string;
      accessSecret?: string;
    };

    console.log('Credentials check:', {
      hasAppKey: !!credentials.appKey,
      hasAppSecret: !!credentials.appSecret,
      hasAccessToken: !!credentials.accessToken,
      hasAccessSecret: !!credentials.accessSecret,
      appKeyLength: credentials.appKey?.length || 0,
      appSecretLength: credentials.appSecret?.length || 0,
      accessTokenLength: credentials.accessToken?.length || 0,
      accessSecretLength: credentials.accessSecret?.length || 0
    });

    if (!credentials.appKey || !credentials.appSecret || !credentials.accessToken || !credentials.accessSecret) {
      return NextResponse.json({
        success: false,
        error: 'Missing required credentials',
        credentials: {
          hasAppKey: !!credentials.appKey,
          hasAppSecret: !!credentials.appSecret,
          hasAccessToken: !!credentials.accessToken,
          hasAccessSecret: !!credentials.accessSecret
        }
      }, { status: 400 });
    }

    console.log(`\nAttempting to post tweet...`);
    console.log(`Text: "${text}"`);
    console.log(`Length: ${text.length} characters\n`);

    // Attempt to post tweet
    const result = await postTweet(
      text,
      credentials.appKey,
      credentials.appSecret,
      credentials.accessToken,
      credentials.accessSecret
    );

    console.log('\n========================================');
    console.log(`Result: ${result.success ? '✅ SUCCESS' : '❌ FAILED'}`);
    console.log('========================================\n');

    if (result.success) {
      console.log('✅ Tweet posted successfully!');
      console.log('Tweet ID:', result.tweetId);
      console.log('URL:', `https://twitter.com/i/web/status/${result.tweetId}`);
    } else {
      console.log('❌ Tweet posting failed');
      console.log('Error:', result.error);
      console.log('\nDebug Information:');
      console.log(JSON.stringify(result.debugInfo, null, 2));
    }

    return NextResponse.json({
      success: result.success,
      platformId,
      text,
      tweetId: result.tweetId,
      tweetUrl: result.tweetId ? `https://twitter.com/i/web/status/${result.tweetId}` : undefined,
      error: result.error,
      debugInfo: result.debugInfo,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Test Twitter exception:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}

/**
 * GET /api/automation/test-twitter
 * Show Twitter credentials status
 */
export async function GET() {
  try {
    const level2Config = await kvStorage.getLevel2Config();
    
    const twitterStatus: Record<string, {
      enabled: boolean;
      validated: boolean;
      hasAppKey: boolean;
      hasAppSecret: boolean;
      hasAccessToken: boolean;
      hasAccessSecret: boolean;
      appKeyPreview?: string;
      accessTokenPreview?: string;
    }> = {};

    for (const platformId of ['twitter', 'twitter-ainow']) {
      const config = level2Config[platformId];
      
      if (!config) {
        twitterStatus[platformId] = {
          enabled: false,
          validated: false,
          hasAppKey: false,
          hasAppSecret: false,
          hasAccessToken: false,
          hasAccessSecret: false
        };
        continue;
      }

      const credentials = config.credentials as {
        appKey?: string;
        appSecret?: string;
        accessToken?: string;
        accessSecret?: string;
      } || {};

      twitterStatus[platformId] = {
        enabled: config.enabled || false,
        validated: config.validated || false,
        hasAppKey: !!credentials.appKey,
        hasAppSecret: !!credentials.appSecret,
        hasAccessToken: !!credentials.accessToken,
        hasAccessSecret: !!credentials.accessSecret,
        appKeyPreview: credentials.appKey ? credentials.appKey.substring(0, 10) + '...' : undefined,
        accessTokenPreview: credentials.accessToken ? credentials.accessToken.substring(0, 10) + '...' : undefined
      };
    }

    return NextResponse.json({
      success: true,
      platforms: twitterStatus,
      usage: {
        testPost: 'POST /api/automation/test-twitter with body: { "platformId": "twitter", "text": "Test" }',
        checkStatus: 'GET /api/automation/test-twitter'
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
