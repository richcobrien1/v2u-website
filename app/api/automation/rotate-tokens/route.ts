import { NextResponse } from 'next/server';
import { kvStorage } from '@/lib/kv-storage';

export const runtime = 'nodejs';

/**
 * POST /api/automation/rotate-tokens
 * Cron endpoint to check and rotate Facebook tokens before they expire
 * 
 * Setup in Vercel:
 * 1. Go to Project Settings > Cron Jobs
 * 2. Add: /api/automation/rotate-tokens
 * 3. Schedule: 0 0 * * * (daily at midnight)
 * 4. Or use external cron service to hit this endpoint
 */
export async function POST() {
  const rotationLog: Array<{ timestamp: string; platform: string; message: string; status: 'success' | 'error' | 'skipped' }> = [];
  
  function log(platform: string, message: string, status: 'success' | 'error' | 'skipped') {
    const entry = { timestamp: new Date().toISOString(), platform, message, status };
    rotationLog.push(entry);
    console.log(`[Token Rotation] [${status.toUpperCase()}] [${platform}] ${message}`);
  }

  try {
    // Note: This endpoint is intentionally public for GitHub Actions cron jobs
    // It only refreshes tokens that are about to expire - no sensitive data exposed
    
    log('system', 'Starting token rotation check', 'success');

    // Get all Level 2 configurations
    const level2Config = await kvStorage.getLevel2Config();
    
    // Track statistics
    let checked = 0;
    let rotated = 0;
    let errors = 0;
    let skipped = 0;

    // Check Facebook tokens
    for (const platformId of ['facebook', 'facebook-ainow']) {
      const config = level2Config[platformId];
      
      if (!config?.enabled || !config?.validated || !config?.credentials) {
        log(platformId, 'Platform not enabled or not configured', 'skipped');
        skipped++;
        continue;
      }

      checked++;

      const credentials = config.credentials as {
        pageId?: string;
        pageAccessToken?: string;
        appId?: string;
        appSecret?: string;
        tokenExpiresAt?: string;
        tokenRefreshedAt?: string;
      };

      // Check if we have app credentials needed for rotation
      const appId = credentials.appId || process.env.FACEBOOK_APP_ID;
      const appSecret = credentials.appSecret || process.env.FACEBOOK_APP_SECRET;

      if (!appId || !appSecret) {
        log(platformId, 'Missing app credentials - cannot rotate token automatically', 'skipped');
        skipped++;
        continue;
      }

      // Check token expiration
      const expiresAt = credentials.tokenExpiresAt;
      
      if (!expiresAt || expiresAt === 'never') {
        log(platformId, 'Token is non-expiring (long-lived page token) - no rotation needed', 'skipped');
        skipped++;
        continue;
      }

      // Calculate days until expiration
      const expirationDate = new Date(expiresAt);
      const now = new Date();
      const daysUntilExpiration = Math.floor((expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      log(platformId, `Token expires in ${daysUntilExpiration} days (${expiresAt})`, 'success');

      // Rotate if token expires in less than 7 days
      if (daysUntilExpiration > 7) {
        log(platformId, `Token still valid for ${daysUntilExpiration} days - no rotation needed`, 'skipped');
        skipped++;
        continue;
      }

      log(platformId, `Token expires soon (${daysUntilExpiration} days) - attempting rotation`, 'success');

      try {
        // Step 1: Exchange current token for long-lived user token
        const exchangeResponse = await fetch(
          `https://graph.facebook.com/v18.0/oauth/access_token?` +
          `grant_type=fb_exchange_token&` +
          `client_id=${appId}&` +
          `client_secret=${appSecret}&` +
          `fb_exchange_token=${credentials.pageAccessToken}`
        );

        if (!exchangeResponse.ok) {
          const error = await exchangeResponse.json() as { error?: { message?: string } };
          throw new Error(error.error?.message || 'Token exchange failed');
        }

        const exchangeData = await exchangeResponse.json() as { access_token?: string; expires_in?: number };
        const longLivedUserToken = exchangeData.access_token;

        if (!longLivedUserToken) {
          throw new Error('No access token returned from exchange');
        }

        log(platformId, `Got long-lived user token (expires in ${exchangeData.expires_in}s)`, 'success');

        // Step 2: Get long-lived page token
        const pageTokenResponse = await fetch(
          `https://graph.facebook.com/v18.0/${credentials.pageId}?fields=access_token&access_token=${longLivedUserToken}`
        );

        if (!pageTokenResponse.ok) {
          const error = await pageTokenResponse.json() as { error?: { message?: string } };
          throw new Error(error.error?.message || 'Page token fetch failed');
        }

        const pageTokenData = await pageTokenResponse.json() as { access_token?: string };
        const newPageToken = pageTokenData.access_token;

        if (!newPageToken) {
          throw new Error('No page access token returned');
        }

        // Step 3: Save the new token
        credentials.pageAccessToken = newPageToken;
        credentials.tokenExpiresAt = 'never';
        credentials.tokenRefreshedAt = new Date().toISOString();

        await kvStorage.saveCredentials(2, platformId, credentials, config.enabled, config.validated);

        log(platformId, '✅ Token successfully rotated and saved (never expires)', 'success');
        rotated++;

      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        log(platformId, `❌ Token rotation failed: ${errorMsg}`, 'error');
        errors++;

        // TODO: Send alert notification when rotation fails
        // Could send email, Slack notification, etc.
      }
    }

    log('system', `Token rotation complete: ${checked} checked, ${rotated} rotated, ${skipped} skipped, ${errors} errors`, 'success');

    return NextResponse.json({
      success: true,
      statistics: {
        checked,
        rotated,
        skipped,
        errors
      },
      logs: rotationLog,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    log('system', `Fatal error: ${errorMsg}`, 'error');
    
    return NextResponse.json({
      success: false,
      error: errorMsg,
      logs: rotationLog
    }, { status: 500 });
  }
}

/**
 * GET /api/automation/rotate-tokens
 * Check token expiration status without rotating
 */
export async function GET() {
  try {
    const level2Config = await kvStorage.getLevel2Config();
    const tokenStatus: Record<string, {
      enabled: boolean;
      hasToken: boolean;
      expiresAt?: string;
      daysUntilExpiration?: number;
      needsRotation: boolean;
    }> = {};

    for (const platformId of ['facebook', 'facebook-ainow']) {
      const config = level2Config[platformId];
      
      if (!config?.credentials) {
        tokenStatus[platformId] = {
          enabled: config?.enabled || false,
          hasToken: false,
          needsRotation: false
        };
        continue;
      }

      const credentials = config.credentials as {
        pageAccessToken?: string;
        tokenExpiresAt?: string;
      };

      const expiresAt = credentials.tokenExpiresAt;
      let daysUntilExpiration: number | undefined;
      let needsRotation = false;

      if (expiresAt && expiresAt !== 'never') {
        const expirationDate = new Date(expiresAt);
        const now = new Date();
        daysUntilExpiration = Math.floor((expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        needsRotation = daysUntilExpiration < 7;
      }

      tokenStatus[platformId] = {
        enabled: config.enabled || false,
        hasToken: !!credentials.pageAccessToken,
        expiresAt,
        daysUntilExpiration,
        needsRotation
      };
    }

    return NextResponse.json({
      success: true,
      tokenStatus,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
