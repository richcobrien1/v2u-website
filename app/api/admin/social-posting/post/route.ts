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

interface PostRequest {
  videoUrl: string
  videoTitle: string
  description?: string
  platforms: string[]
  scheduleTime?: string
}

async function logToKV(entry: {
  platform: string
  status: 'success' | 'failed' | 'active'
  videoTitle: string
  videoUrl: string
  videoId?: string
  error?: string
  details?: any
}) {
  const today = new Date().toISOString().split('T')[0]
  const key = `automation:log:${today}`
  const url = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/storage/kv/namespaces/${NAMESPACE_ID}/values/${key}`
  
  try {
    // First, try to get existing log
    const getResponse = await fetch(url, {
      headers: { 'Authorization': `Bearer ${API_TOKEN}` }
    })
    
    let existingLog = {
      entries: [],
      summary: { total: 0, success: 0, failed: 0, active: 0 }
    }
    
    if (getResponse.ok) {
      existingLog = await getResponse.json()
    }
    
    // Add new entry
    const newEntry = {
      timestamp: new Date().toISOString(),
      ...entry
    }
    
    existingLog.entries.push(newEntry)
    
    // Update summary
    existingLog.summary.total++
    if (entry.status === 'success') existingLog.summary.success++
    else if (entry.status === 'failed') existingLog.summary.failed++
    else if (entry.status === 'active') existingLog.summary.active++
    
    // Save back to KV
    const putResponse = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(existingLog)
    })
    
    if (!putResponse.ok) {
      console.error('Failed to save log to KV:', await putResponse.text())
    }
    
    return putResponse.ok
  } catch (error) {
    console.error('Error logging to KV:', error)
    return false
  }
}

export async function POST(req: NextRequest) {
  if (!requireAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body: PostRequest = await req.json()
    const { videoUrl, videoTitle, description, platforms, scheduleTime } = body

    if (!videoUrl || !videoTitle || !platforms || platforms.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields: videoUrl, videoTitle, platforms' },
        { status: 400 }
      )
    }

    const results = []

    for (const platform of platforms) {
      // Log the posting attempt
      await logToKV({
        platform,
        status: 'active',
        videoTitle,
        videoUrl,
        details: {
          description,
          scheduleTime,
          initiatedBy: 'admin-dashboard',
          initiatedAt: new Date().toISOString()
        }
      })

      results.push({
        platform,
        status: 'queued',
        message: `Video queued for posting to ${platform}`
      })
    }

    // In a real implementation, you would trigger the actual posting here
    // For now, we'll just log it and return success
    console.log(`Video posting queued:`, {
      videoTitle,
      videoUrl,
      platforms,
      scheduleTime
    })

    return NextResponse.json({
      success: true,
      results,
      message: `Video queued for posting to ${platforms.length} platform(s)`
    })

  } catch (error) {
    console.error('Error posting video:', error)
    return NextResponse.json(
      { error: 'Failed to queue video posting' },
      { status: 500 }
    )
  }
}
