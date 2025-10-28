import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-for-testing'
const RESEND_API_KEY = process.env.RESEND_API_KEY

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
    const testEmail = body.email || 'test@example.com'

    // Check if API key exists
    if (!RESEND_API_KEY) {
      return NextResponse.json({ 
        error: 'RESEND_API_KEY not configured',
        details: 'Please set RESEND_API_KEY in Vercel environment variables'
      }, { status: 500 })
    }

    const EMAIL_FROM = process.env.EMAIL_FROM || 'onboarding@resend.dev'

    console.log('🧪 Testing email configuration:', {
      from: EMAIL_FROM,
      to: testEmail,
      apiKeyExists: !!RESEND_API_KEY,
      apiKeyPrefix: RESEND_API_KEY.substring(0, 7) + '...'
    })

    const payload = {
      from: EMAIL_FROM,
      to: [testEmail],
      subject: 'Test Email from V2U Admin',
      html: '<h1>Test Email</h1><p>This is a test email from your V2U admin panel.</p><p>If you received this, your email configuration is working correctly!</p>',
    }

    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    const responseText = await resp.text()
    
    console.log('🧪 Resend API Response:', { 
      status: resp.status,
      statusText: resp.statusText,
      body: responseText 
    })

    if (!resp.ok) {
      return NextResponse.json({
        error: 'Resend API error',
        status: resp.status,
        statusText: resp.statusText,
        details: responseText,
        config: {
          from: EMAIL_FROM,
          apiKeyConfigured: true,
          apiKeyPrefix: RESEND_API_KEY.substring(0, 7) + '...'
        }
      }, { status: resp.status })
    }

    const result = JSON.parse(responseText)
    
    return NextResponse.json({
      success: true,
      message: 'Test email sent successfully!',
      resendResponse: result,
      config: {
        from: EMAIL_FROM,
        to: testEmail,
        apiKeyConfigured: true
      }
    })

  } catch (err) {
    console.error('Test email error:', err)
    const message = err && typeof err === 'object' && 'message' in err
      ? String((err as Record<string, unknown>)['message'])
      : 'Internal server error'
    return NextResponse.json({ 
      error: 'Test email failed', 
      details: message 
    }, { status: 500 })
  }
}
