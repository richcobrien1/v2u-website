import { NextRequest, NextResponse } from 'next/server'
import { kvClient } from '@/lib/kv-client'
import { checkR2Configuration } from '@/lib/r2-episodes'

async function checkKV() {
  try {
    // Perform a harmless read
    const test = await kvClient.get('health:kv:test')
    return { ok: true, note: test !== null ? 'read OK' : 'read OK (null)' }
  } catch (err) {
    return { ok: false, error: String(err) }
  }
}

async function checkResend() {
  const key = process.env.RESEND_API_KEY
  if (!key) return { ok: false, error: 'RESEND_API_KEY missing' }
  try {
    const resp = await fetch('https://api.resend.com/emails?limit=1', { headers: { Authorization: `Bearer ${key}` } })
    if (!resp.ok) return { ok: false, error: `resend responded ${resp.status}` }
    return { ok: true }
  } catch (err) {
    return { ok: false, error: String(err) }
  }
}

export async function GET(req: NextRequest) {
  const provided = req.headers.get('x-admin-onboard-token') || req.headers.get('x-admin-token')
  const expected = process.env.ADMIN_ONBOARD_TOKEN
  if (!expected || provided !== expected) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const kv = await checkKV()
  const r2 = await checkR2Configuration().then(v => ({ ok: v })).catch(err => ({ ok: false, error: String(err) }))
  const resend = await checkResend()

  return NextResponse.json({ kv, r2, resend })
}
