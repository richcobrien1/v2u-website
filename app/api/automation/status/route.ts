import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

/**
 * GET /api/automation/status
 * Get current automation status
 */
export async function GET() {
  try {
    // TODO: Load from Cloudflare KV
    // const running = await KV.get('automation:running') === 'true';
    // const lastCheck = await KV.get('automation:lastCheck');
    // const checksToday = parseInt(await KV.get('automation:checksToday') || '0');
    
    const running = false; // Default until KV is connected
    const lastCheck = null;
    const checksToday = 0;
    
    // Calculate next check (1 hour from last check, or now if not running)
    let nextCheck = null;
    if (running && lastCheck) {
      const next = new Date(lastCheck);
      next.setHours(next.getHours() + 1);
      nextCheck = next.toISOString();
    }

    return NextResponse.json({
      running,
      lastCheck,
      nextCheck,
      checksToday
    });
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
