import { NextResponse } from 'next/server';
import { getRecentLogs, getLogsSummary } from '@/lib/automation-logger';

export const runtime = 'nodejs';

/**
 * GET /api/automation/logs
 * Get recent automation activity logs
 */
export async function GET() {
  try {
    const logs = await getRecentLogs(7);
    const summary = await getLogsSummary();

    return NextResponse.json({
      success: true,
      logs,
      summary
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to get logs',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
