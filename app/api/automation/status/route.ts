import { NextRequest, NextResponse } from 'next/server';
import { kvStorage } from '@/lib/kv-storage';

export const runtime = 'nodejs';

/**
 * GET /api/automation/status
 * Get current automation status
 */
export async function GET() {
  try {
    // Load from Cloudflare KV
    const status = await kvStorage.getStatus();
    
    if (!status) {
      // Return default status if not yet initialized
      return NextResponse.json({
        running: false,
        lastCheck: null,
        nextCheck: null,
        checksToday: 0
      });
    }

    return NextResponse.json(status);
  } catch (error) {
    console.error('Error getting automation status:', error);
    return NextResponse.json(
      { error: 'Failed to get automation status' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/automation/status
 * DEPRECATED - Use specific endpoints instead:
 * - POST /api/automation/toggle
 * - POST /api/automation/config
 */
export async function POST(request: NextRequest) {
  return NextResponse.json(
    { error: 'Deprecated - use /api/automation/toggle or /api/automation/config' },
    { status: 410 }
  );
}
