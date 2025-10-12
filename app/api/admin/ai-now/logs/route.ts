import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

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

// Mock logs data - in production this would come from a database
const mockLogs = [
  {
    id: '1',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    level: 'info',
    message: 'Daily news gathering started',
    details: { runId: 'run-2025-10-12-001' }
  },
  {
    id: '2',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000 + 30000).toISOString(),
    level: 'info',
    message: 'Generated AI news content for 3 topics',
    details: { topics: ['AI Ethics', 'Machine Learning', 'Robotics'] }
  },
  {
    id: '3',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000 + 60000).toISOString(),
    level: 'info',
    message: 'Posted to Twitter successfully',
    details: { tweetId: '1234567890', platform: 'twitter' }
  },
  {
    id: '4',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000 + 90000).toISOString(),
    level: 'info',
    message: 'Sent email notifications to subscribers',
    details: { recipientCount: 150 }
  },
  {
    id: '5',
    timestamp: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
    level: 'error',
    message: 'Twitter API rate limit exceeded',
    details: { error: 'Rate limit exceeded', retryIn: 900 }
  }
]

export async function GET(request: NextRequest) {
  if (!requireAdmin(request)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const level = searchParams.get('level') // 'info', 'error', 'warn'

    let filteredLogs = mockLogs

    if (level) {
      filteredLogs = mockLogs.filter(log => log.level === level)
    }

    // Return most recent logs first, limited by limit
    const logs = filteredLogs
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit)

    return NextResponse.json({
      success: true,
      data: logs,
      total: mockLogs.length
    })
  } catch (error) {
    console.error('AI-Now logs error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch logs' },
      { status: 500 }
    )
  }
}