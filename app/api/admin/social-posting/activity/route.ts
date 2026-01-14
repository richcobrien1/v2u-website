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

async function fetchTodayStats() {
  const today = new Date().toISOString().split('T')[0]
  const key = `automation:log:${today}`
  const url = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/storage/kv/namespaces/${NAMESPACE_ID}/values/${key}`
  
  try {
    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${API_TOKEN}` }
    })
    
    if (response.ok) {
      const data = await response.json()
      return data.summary || { total: 0, success: 0, failed: 0, active: 0 }
    }
    return { total: 0, success: 0, failed: 0, active: 0 }
  } catch (error) {
    console.error('Error fetching today stats:', error)
    return { total: 0, success: 0, failed: 0, active: 0 }
  }
}

async function fetchRecentActivity() {
  const dates = []
  for (let i = 0; i < 7; i++) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    dates.push(date.toISOString().split('T')[0])
  }

  const allEntries = []

  for (const date of dates) {
    const key = `automation:log:${date}`
    const url = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/storage/kv/namespaces/${NAMESPACE_ID}/values/${key}`
    
    try {
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${API_TOKEN}` }
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.entries && Array.isArray(data.entries)) {
          allEntries.push(...data.entries.map((entry: KVLogEntry) => ({ ...entry, date })))
        }
      }
    } catch (error) {
      console.error(`Error fetching logs for ${date}:`, error)
    }
  }

  // Sort by timestamp descending and take top 10
  return allEntries
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 10)
}

export async function GET(req: NextRequest) {
  if (!requireAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const stats = await fetchTodayStats()
  const recentActivity = await fetchRecentActivity()

  return NextResponse.json({
    stats,
    recentActivity
  })
}
