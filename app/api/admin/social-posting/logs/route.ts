import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-for-testing'
const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID || "d54e57481e824e8752d0f6caa9b37ba7"
const API_TOKEN = process.env.CLOUDFLARE_API_TOKEN || "4brdJznMqITcyxQ1gBArpwpfNJMrb-p2Ps5jzR3k"
const NAMESPACE_ID = process.env.CLOUDFLARE_KV_NAMESPACE_ID || "3c40aed9e67b479eb28a271c547e43d4"

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

interface KVLogEntry {
  timestamp: string
  platform: string
  status: 'success' | 'failed' | 'active'
  videoTitle?: string
  videoId?: string
  videoUrl?: string
  error?: string
  details?: Record<string, unknown>
}

interface KVLog {
  entries: KVLogEntry[]
  summary: {
    total: number
    success: number
    failed: number
    active: number
  }
}

async function fetchKVLogs(date: string): Promise<KVLog | null> {
  const key = `automation:log:${date}`
  const url = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/storage/kv/namespaces/${NAMESPACE_ID}/values/${key}`
  
  try {
    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${API_TOKEN}` }
    })
    
    if (response.ok) {
      return await response.json()
    }
    return null
  } catch (error) {
    console.error(`Error fetching KV logs for ${date}:`, error)
    return null
  }
}

export async function GET(req: NextRequest) {
  if (!requireAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const searchParams = req.nextUrl.searchParams
  const dateParam = searchParams.get('date')
  const platformParam = searchParams.get('platform')
  const statusParam = searchParams.get('status')
  const daysParam = searchParams.get('days') || '7'
  
  const days = parseInt(daysParam)
  const dates: string[] = []
  
  if (dateParam) {
    dates.push(dateParam)
  } else {
    // Get last N days
    for (let i = 0; i < days; i++) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      dates.push(date.toISOString().split('T')[0])
    }
  }

  let allEntries: (KVLogEntry & { date: string })[] = []
  const totalSummary = { total: 0, success: 0, failed: 0, active: 0 }

  for (const date of dates) {
    const log = await fetchKVLogs(date)
    if (log && log.entries) {
      // Add date to each entry
      const entriesWithDate = log.entries.map(entry => ({ ...entry, date }))
      allEntries.push(...entriesWithDate)
      
      // Accumulate summaries
      if (log.summary) {
        totalSummary.total += log.summary.total || 0
        totalSummary.success += log.summary.success || 0
        totalSummary.failed += log.summary.failed || 0
        totalSummary.active += log.summary.active || 0
      }
    }
  }

  // Apply filters
  if (platformParam) {
    allEntries = allEntries.filter(entry => entry.platform === platformParam)
  }
  if (statusParam) {
    allEntries = allEntries.filter(entry => entry.status === statusParam)
  }

  // Sort by timestamp descending (most recent first)
  allEntries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  return NextResponse.json({
    entries: allEntries,
    summary: totalSummary,
    dateRange: {
      from: dates[dates.length - 1],
      to: dates[0]
    }
  })
}
