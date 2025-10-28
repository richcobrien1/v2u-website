import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { sendPromotionalEmail } from '@/lib/email'

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
    const body = await req.json() as { emails?: string[]; html?: string }
    if (!body?.emails || !Array.isArray(body.emails) || body.emails.length === 0) {
      return NextResponse.json({ error: 'emails array required' }, { status: 400 })
    }
    if (!body?.html || typeof body.html !== 'string') {
      return NextResponse.json({ error: 'html content required' }, { status: 400 })
    }

    const { emails, html } = body
    let sentCount = 0
    const errors: string[] = []
    const successfulSends: string[] = []

    // Send emails one by one to avoid rate limits and track individual failures
    for (const email of emails) {
      try {
        console.log(`🔵 Attempting to send promotional email to: ${email}`)
        const result = await sendPromotionalEmail(email, html)
        console.log(`✅ Successfully sent to ${email}:`, result)
        sentCount++
        successfulSends.push(email)
      } catch (err) {
        const errorMsg = err && typeof err === 'object' && 'message' in err
          ? String((err as Record<string, unknown>)['message'])
          : 'Unknown error'
        errors.push(`Failed to send to ${email}: ${errorMsg}`)
        console.error(`❌ Failed to send promotional email to ${email}:`, err)
      }
    }

    console.log(`📊 Email send summary: ${sentCount}/${emails.length} successful`)
    
    return NextResponse.json({
      success: true,
      sentCount,
      totalRequested: emails.length,
      successfulSends,
      errors: errors.length > 0 ? errors : undefined
    })
  } catch (err) {
    console.error('admin/send-promotional error', err)
    const message = err && typeof err === 'object' && 'message' in err
      ? String((err as Record<string, unknown>)['message'])
      : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}