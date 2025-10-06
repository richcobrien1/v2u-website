import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { sendWelcomeEmail } from '@/lib/email'

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

export async function POST(req: NextRequest) {
  if (!requireAdmin(req)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  try {
    const body = await req.json() as { email?: string }
    if (!body?.email) return NextResponse.json({ error: 'email required' }, { status: 400 })
    const res = await sendWelcomeEmail(String(body.email))
    return NextResponse.json({ success: true, result: res })
  } catch (err) {
    console.error('admin/send-welcome error', err)
    const message = err && typeof err === 'object' && 'message' in err ? String((err as Record<string, unknown>)['message']) : 'internal'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
