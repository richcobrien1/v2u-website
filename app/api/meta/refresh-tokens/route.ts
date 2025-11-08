import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/meta/refresh-tokens
 * Refreshes Facebook/Instagram page access tokens
 * 
 * Page tokens don't expire as long as they're refreshed every 60 days
 * Call this endpoint monthly to keep tokens fresh
 */
export async function POST(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const APP_ID = process.env.META_APP_ID_AI;
    const APP_SECRET = process.env.META_APP_SECRET_AI;
    
    if (!APP_ID || !APP_SECRET) {
      throw new Error('Meta app credentials not configured');
    }

    const tokens = [
      { 
        name: 'AI-Now', 
        pageId: process.env.FACEBOOK_AINOW_PAGE_ID,
        currentToken: process.env.FACEBOOK_AINOW_ACCESS_TOKEN 
      },
      { 
        name: 'V2U', 
        pageId: process.env.FACEBOOK_V2U_PAGE_ID,
        currentToken: process.env.FACEBOOK_V2U_ACCESS_TOKEN 
      }
    ];

    const results = [];

    for (const page of tokens) {
      if (!page.currentToken) {
        console.log(`⚠️ No token for ${page.name}, skipping`);
        continue;
      }

      // Exchange current token for a refreshed long-lived token
      const refreshUrl = `https://graph.facebook.com/v21.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${APP_ID}&client_secret=${APP_SECRET}&fb_exchange_token=${page.currentToken}`;
      
      const response = await fetch(refreshUrl);
      const data = await response.json() as { access_token?: string; expires_in?: number; error?: { message: string } };

      if (data.access_token) {
        const expiresInDays = data.expires_in ? Math.round(data.expires_in / 86400) : 60;
        
        results.push({
          page: page.name,
          pageId: page.pageId,
          success: true,
          newToken: data.access_token.substring(0, 50) + '...',
          expiresInDays
        });

        console.log(`✅ Refreshed token for ${page.name} (expires in ~${expiresInDays} days)`);
        console.log(`   New token: ${data.access_token}`);
        console.log(`   Update .env.local or Vercel env var!`);
      } else {
        results.push({
          page: page.name,
          pageId: page.pageId,
          success: false,
          error: data.error?.message || 'Failed to refresh token'
        });

        console.error(`❌ Failed to refresh ${page.name}:`, data.error?.message);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Token refresh completed',
      results,
      note: 'Copy the new tokens from the server logs and update your environment variables'
    });

  } catch (error) {
    console.error('Token refresh error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Token refresh failed'
    }, { status: 500 });
  }
}

/**
 * GET /api/meta/refresh-tokens
 * Check token expiration status
 */
export async function GET() {
  try {
    const APP_ID = process.env.META_APP_ID_AI;
    const APP_SECRET = process.env.META_APP_SECRET_AI;
    
    const tokens = [
      { 
        name: 'AI-Now', 
        token: process.env.FACEBOOK_AINOW_ACCESS_TOKEN 
      },
      { 
        name: 'V2U', 
        token: process.env.FACEBOOK_V2U_ACCESS_TOKEN 
      }
    ];

    const statuses = [];

    for (const page of tokens) {
      if (!page.token) {
        statuses.push({ page: page.name, status: 'Not configured' });
        continue;
      }

      // Debug token to check expiration
      const debugUrl = `https://graph.facebook.com/v21.0/debug_token?input_token=${page.token}&access_token=${APP_ID}|${APP_SECRET}`;
      
      const response = await fetch(debugUrl);
      const data = await response.json() as { 
        data?: { 
          expires_at?: number; 
          is_valid?: boolean;
          data_access_expires_at?: number;
        } 
      };

      if (data.data) {
        const expiresAt = data.data.expires_at ? new Date(data.data.expires_at * 1000) : null;
        const dataExpiresAt = data.data.data_access_expires_at ? new Date(data.data.data_access_expires_at * 1000) : null;
        const now = new Date();
        const daysUntilExpiry = expiresAt ? Math.round((expiresAt.getTime() - now.getTime()) / 86400000) : null;

        statuses.push({
          page: page.name,
          isValid: data.data.is_valid,
          expiresAt: expiresAt?.toISOString(),
          dataExpiresAt: dataExpiresAt?.toISOString(),
          daysUntilExpiry,
          needsRefresh: daysUntilExpiry !== null && daysUntilExpiry < 30
        });
      } else {
        statuses.push({
          page: page.name,
          status: 'Unable to check token'
        });
      }
    }

    return NextResponse.json({
      success: true,
      tokens: statuses
    });

  } catch (error) {
    console.error('Token check error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Token check failed'
    }, { status: 500 });
  }
}
