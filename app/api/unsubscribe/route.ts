import { NextRequest, NextResponse } from 'next/server'
import { kvClient } from '@/lib/kv-client'

export const runtime = 'nodejs'

/**
 * POST /api/unsubscribe
 * Allow users to unsubscribe from the mailing list
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { email?: string }
    
    if (!body?.email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 })
    }

    const email = String(body.email).trim().toLowerCase()
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
    }

    // Remove from KV storage
    try {
      await kvClient.delete(`subscriber:${email}`)
    } catch (err) {
      console.error('Failed to delete subscriber from KV:', err)
    }

    // Remove from subscribers list
    try {
      const raw = await kvClient.get('subscribers:list')
      const list = raw ? JSON.parse(raw) as string[] : []
      const updatedList = list.filter(e => e !== email)
      
      if (updatedList.length !== list.length) {
        await kvClient.put('subscribers:list', JSON.stringify(updatedList))
      }
    } catch (err) {
      console.error('Failed to update subscribers list:', err)
    }

    // Log the unsubscribe
    try {
      const unsubLog = {
        email,
        timestamp: new Date().toISOString(),
        ip: request.headers.get('x-forwarded-for') || 'unknown'
      }
      
      const logsRaw = await kvClient.get('unsubscribe:logs')
      const logs = logsRaw ? JSON.parse(logsRaw) as typeof unsubLog[] : []
      logs.unshift(unsubLog)
      
      // Keep last 100 unsubscribes
      if (logs.length > 100) {
        logs.splice(100)
      }
      
      await kvClient.put('unsubscribe:logs', JSON.stringify(logs))
    } catch (err) {
      console.error('Failed to log unsubscribe:', err)
      // Don't fail the request if logging fails
    }

    return NextResponse.json({ 
      success: true,
      message: 'Successfully unsubscribed' 
    })

  } catch (error) {
    console.error('Unsubscribe API error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
