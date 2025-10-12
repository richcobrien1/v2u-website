import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import cronService from '@/lib/cron-service'

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-for-testing'

function verifyJwt(token: string): boolean {
  try { jwt.verify(token, JWT_SECRET); return true } catch { return false }
}

function requireAdmin(req: NextRequest): boolean {
  const provided = req.headers.get('x-admin-onboard-token') || req.headers.get('x-admin-token')
  const expected = process.env.ADMIN_ONBOARD_TOKEN
  if (expected && provided === expected) return true
  if (provided && verifyJwt(provided)) return true
  try {
    const cookieHeader = req.headers.get('cookie') || ''
    const match = cookieHeader.match(/v2u_admin_token=([^;\s]+)/)
    if (match && verifyJwt(match[1])) return true
  } catch {}
  return false
}

// Mock data - in production this would come from a database
const automationStatus = {
  lastRun: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
  nextRun: cronService.getNextRun()?.toISOString() || new Date(Date.now() + 22 * 60 * 60 * 1000).toISOString(),
  status: 'idle' as 'idle' | 'running' | 'error',
  recentActivities: [
    {
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      action: 'Daily News Gathering',
      status: 'success' as const,
      details: 'Generated 3 AI news episodes, posted to Twitter, sent email notifications'
    },
    {
      timestamp: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
      action: 'Daily News Gathering',
      status: 'success' as const,
      details: 'Generated 2 AI news episodes, posted to Twitter'
    },
    {
      timestamp: new Date(Date.now() - 50 * 60 * 60 * 1000).toISOString(),
      action: 'Daily News Gathering',
      status: 'error' as const,
      details: 'Twitter API rate limit exceeded, retry scheduled'
    }
  ] as Array<{
    timestamp: string
    action: string
    status: 'success' | 'error' | 'info'
    details: string
  }>,
  stats: {
    totalRuns: 45,
    successfulRuns: 42,
    failedRuns: 3,
    lastSuccess: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  }
}

export async function GET(request: NextRequest) {
  if (!requireAdmin(request)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  try {

    return NextResponse.json({
      success: true,
      data: automationStatus
    })
  } catch (error) {
    console.error('AI-Now status error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch automation status' },
      { status: 500 }
    )
  }
}