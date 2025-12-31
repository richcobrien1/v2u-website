import { NextRequest, NextResponse } from 'next/server';
import { kvStorage } from '@/lib/kv-storage';

export const runtime = 'nodejs';

/**
 * POST /api/sync/facebook-tokens
 * Syncs Facebook tokens from local files to Cloudflare KV
 * 
 * Body: {
 *   v2u: { credentials, enabled, configured },
 *   ainow: { credentials, enabled, configured }
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
      v2u?: { credentials: Record<string, string>; enabled: boolean; configured: boolean };
      ainow?: { credentials: Record<string, string>; enabled: boolean; configured: boolean };
    };

    const results: { v2u?: string; ainow?: string } = {};

    // Update V2U Facebook
    if (body.v2u) {
      await kvStorage.saveCredentials(
        2,
        'facebook',
        body.v2u.credentials,
        body.v2u.enabled,
        true
      );
      results.v2u = 'Updated';
      console.log('[Sync] ✅ Updated V2U Facebook in KV');
    }

    // Update AI-Now Facebook
    if (body.ainow) {
      await kvStorage.saveCredentials(
        2,
        'facebook-ainow',
        body.ainow.credentials,
        body.ainow.enabled,
        true
      );
      results.ainow = 'Updated';
      console.log('[Sync] ✅ Updated AI-Now Facebook in KV');
    }

    return NextResponse.json({
      success: true,
      message: 'Facebook tokens synced to Cloudflare KV',
      results
    });

  } catch (error) {
    console.error('[Sync] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
