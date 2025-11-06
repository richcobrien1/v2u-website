import { NextRequest, NextResponse } from 'next/server';
import { kvStorage } from '@/lib/kv-storage';

export const runtime = 'nodejs';

/**
 * POST /api/automation/toggle
 * Start or stop the automation system
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { running: boolean };
    const { running } = body;

    // Get current status or create new
    const currentStatus = await kvStorage.getStatus() || {
      running: false,
      lastCheck: null,
      nextCheck: null,
      checksToday: 0
    };

    // Update running state
    const newStatus = {
      ...currentStatus,
      running
    };

    // If starting, set next check to 1 hour from now
    if (running && !currentStatus.running) {
      newStatus.nextCheck = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    }

    await kvStorage.saveStatus(newStatus);

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
