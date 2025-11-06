import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

/**
 * POST /api/automation/toggle
 * Start or stop the automation system
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { running: boolean };
    const { running } = body;

    // TODO: Store state in Cloudflare KV
    // await KV.put('automation:running', running.toString());

    console.log(`Automation ${running ? 'started' : 'stopped'}`);

    return NextResponse.json({
      success: true,
      running,
      message: running ? 'Automation started' : 'Automation stopped',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error toggling automation:', error);
    return NextResponse.json(
      { error: 'Failed to toggle automation' },
      { status: 500 }
    );
  }
}
