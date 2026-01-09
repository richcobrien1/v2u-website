import { NextResponse } from 'next/server';
import { getRecentLogs, getLogsSummary } from '@/lib/automation-logger';

export const runtime = 'nodejs';

/**
 * GET /api/automation/logs
 * Get recent automation activity logs
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '1000');
    const days = parseInt(searchParams.get('days') || '30');
    
    const logs = await getRecentLogs(days);
    const summary = await getLogsSummary();
    
    // Flatten all entries from all days and sort by timestamp
    const allEntries = logs.flatMap(log => log.entries)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);

    return NextResponse.json({
      success: true,
      activities: allEntries,
      logs: allEntries,
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
