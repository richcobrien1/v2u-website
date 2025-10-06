import { NextRequest, NextResponse } from 'next/server'
import { kvClient } from '@/lib/kv-client'
import jwt from 'jsonwebtoken'

async function requireAdmin(req: NextRequest) {
  const cookieHeader = req.headers.get('cookie') || ''
  const match = cookieHeader.match(/v2u_admin_token=([^;\s]+)/)
  if (!match) return null
  const token = match[1]
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret-for-testing') as { adminId?: string; role?: string }
    return decoded
  } catch (err) {
    console.error('Failed to verify admin token', err)
    return null
  }
}

export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req)
  if (!admin) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const raw = await kvClient.get('subscribers:list')
  const list = raw ? JSON.parse(raw) as string[] : []
  const subscribers = await Promise.all(list.map(async (email) => {
    const rawSub = await kvClient.get(`subscriber:${email}`)
    return rawSub ? JSON.parse(rawSub) : null
  }))
  return NextResponse.json({ success: true, subscribers: subscribers.filter(Boolean) }, { headers: { 'Cache-Control': 'no-store' } })
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req)
  if (!admin) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const body = await req.json() as { email?: string }
  if (!body?.email) return NextResponse.json({ error: 'email required' }, { status: 400 })
  const email = body.email.trim().toLowerCase()
  const payload = JSON.stringify({ email, createdAt: new Date().toISOString() })
  await kvClient.put(`subscriber:${email}`, payload)
  const raw = await kvClient.get('subscribers:list')
  const list = raw ? JSON.parse(raw) as string[] : []
  if (!list.includes(email)) {
    list.push(email)
    await kvClient.put('subscribers:list', JSON.stringify(list))
  }
  return NextResponse.json({ success: true }, { headers: { 'Cache-Control': 'no-store' } })
}

export async function PUT(req: NextRequest) {
  const admin = await requireAdmin(req)
  if (!admin) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const body = await req.json() as { email?: string; newEmail?: string }
  if (!body?.email || !body?.newEmail) return NextResponse.json({ error: 'email and newEmail required' }, { status: 400 })
  const email = body.email.trim().toLowerCase()
  const newEmail = body.newEmail.trim().toLowerCase()
  const raw = await kvClient.get(`subscriber:${email}`)
  if (!raw) return NextResponse.json({ error: 'not found' }, { status: 404 })
  const payload = JSON.parse(raw)
  payload.email = newEmail
  await kvClient.put(`subscriber:${newEmail}`, JSON.stringify(payload))
  await kvClient.delete(`subscriber:${email}`)
  // update list
  const rawList = await kvClient.get('subscribers:list')
  const list = rawList ? JSON.parse(rawList) as string[] : []
  const idx = list.indexOf(email)
  if (idx !== -1) list[idx] = newEmail
  await kvClient.put('subscribers:list', JSON.stringify(list))
  return NextResponse.json({ success: true }, { headers: { 'Cache-Control': 'no-store' } })
}

export async function DELETE(req: NextRequest) {
  const admin = await requireAdmin(req)
  if (!admin) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const email = req.nextUrl.searchParams.get('email')
  if (!email) return NextResponse.json({ error: 'email required' }, { status: 400 })
  const e = email.trim().toLowerCase()
  await kvClient.delete(`subscriber:${e}`)
  const rawList = await kvClient.get('subscribers:list')
  const list = rawList ? JSON.parse(rawList) as string[] : []
  const updated = list.filter(x => x !== e)
  await kvClient.put('subscribers:list', JSON.stringify(updated))
  return NextResponse.json({ success: true }, { headers: { 'Cache-Control': 'no-store' } })
}
