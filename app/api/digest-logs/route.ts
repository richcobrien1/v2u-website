import { NextResponse } from 'next/server'
import { kvClient } from '@/lib/kv-client'

export const runtime = 'nodejs'

/**
 * GET /api/digest-logs
 * Retrieve digest send logs from KV storage
 */
export async function GET() {
  try {
    const logsRaw = await kvClient.get('digest:logs')
    const logs = logsRaw ? JSON.parse(logsRaw) : []

    return NextResponse.json({ 
      success: true,
      logs 
    })
  } catch (error) {
    console.error('Error fetching digest logs:', error)
    return NextResponse.json({
      error: 'Failed to fetch logs',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}
