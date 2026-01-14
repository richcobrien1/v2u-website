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

interface RealKVLogEntry {
  type: string
  level: string
  message: string
  timestamp: string
  details?: Record<string, unknown>
}

interface KVLogData {
  entries: RealKVLogEntry[]
  summary?: {
    totalExecutions?: number
    successfulPosts?: number
    failedPosts?: number
  }
}

async function fetchKVLogs(date: string): Promise<KVLogData | null> {
  const key = `automation:log:${date}`
  const url = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/storage/kv/namespaces/${NAMESPACE_ID}/values/${key}`
  
  try {
    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${API_TOKEN}` }
    })
    
    if (response.ok) {
      return await response.json() as KVLogData
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
    for (let i = 0; i < days; i++) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      dates.push(date.toISOString().split('T')[0])
    }
  }

  let allEntries: (RealKVLogEntry & { date: string })[] = []
  let totalExecutions = 0
  let totalSuccessful = 0
  let totalFailed = 0

  for (const date of dates) {
    const log = await fetchKVLogs(date)
    if (log && log.entries) {
      const entriesWithDate = log.entries.map((entry) => ({ ...entry, date }))
      allEntries.push(...entriesWithDate)
      
      if (log.summary) {
        totalExecutions += log.summary.totalExecutions || 0
        totalSuccessful += log.summary.successfulPosts || 0
        totalFailed += log.summary.failedPosts || 0
      }
    }
  }

  // Apply filters
  if (platformParam) {
    allEntries = allEntries.filter(entry => 
      entry.details?.platform === platformParam || 
      entry.details?.source === platformParam ||
      entry.type === platformParam
    )
  }
  if (statusParam === 'success') {
    allEntries = allEntries.filter(entry => entry.level === 'success')
  } else if (statusParam === 'failed') {
    allEntries = allEntries.filter(entry => entry.level === 'error')
  }

  // Sort by timestamp descending
  allEntries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  return NextResponse.json({
    entries: allEntries,
    summary: {
      totalExecutions,
      successfulPosts: totalSuccessful,
      failedPosts: totalFailed,
      dateRange: {
        from: dates[dates.length - 1],
        to: dates[0]
      }
    }
  })
}
