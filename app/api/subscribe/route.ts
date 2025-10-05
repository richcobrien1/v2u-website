import { NextRequest, NextResponse } from 'next/server'
import { kvClient } from '@/lib/kv-client'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { email?: string }
    if (!body?.email) return NextResponse.json({ error: 'email required' }, { status: 400 })

    const email = String(body.email).trim().toLowerCase()
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) return NextResponse.json({ error: 'invalid email' }, { status: 400 })

    const payload = JSON.stringify({ email, createdAt: new Date().toISOString() })
    await kvClient.put(`subscriber:${email}`, payload)

    // Maintain subscribers index (simple array stored under subscribers:list)
    try {
      const raw = await kvClient.get('subscribers:list')
      const list = raw ? JSON.parse(raw) as string[] : []
      if (!list.includes(email)) {
        list.push(email)
        await kvClient.put('subscribers:list', JSON.stringify(list))
      }
    } catch (e) {
      console.error('Failed to update subscribers list', e)
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('subscribe API error', err)
    return NextResponse.json({ error: 'internal' }, { status: 500 })
  }
}
