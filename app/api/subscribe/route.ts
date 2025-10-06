import { NextRequest, NextResponse } from 'next/server'
import { kvClient } from '@/lib/kv-client'
import fs from 'fs'
import path from 'path'

const RESEND_API_KEY = process.env.RESEND_API_KEY

// Cache the loaded template to avoid repeated disk reads
let CACHED_WELCOME_HTML: string | null = null

function loadWelcomeHtmlFromFile(): string | null {
  if (CACHED_WELCOME_HTML !== null) return CACHED_WELCOME_HTML
  try {
    const filePath = path.resolve(process.cwd(), 'docs', 'html', 'email_template.html')
    if (!fs.existsSync(filePath)) return null
    const content = fs.readFileSync(filePath, { encoding: 'utf8' })
    CACHED_WELCOME_HTML = content
    return content
  } catch (err) {
    console.warn('Could not load welcome email template from file:', err)
    CACHED_WELCOME_HTML = null
    return null
  }
}

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

    // Attempt to send a welcome email via Resend (non-blocking on missing key)
    try {
      if (!RESEND_API_KEY) {
        console.warn('RESEND_API_KEY not configured; skipping welcome email')
      } else {
        await sendWelcomeEmail(email)
      }
    } catch (sendErr) {
      console.error('Failed to send welcome email:', sendErr)
      // proceed - do not surface email failures to the end-user as an error
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('subscribe API error', err)
    return NextResponse.json({ error: 'internal' }, { status: 500 })
  }
}

async function sendWelcomeEmail(email: string) {
  if (!RESEND_API_KEY) throw new Error('RESEND_API_KEY not set')

  const html = await getWelcomeHtml()

  const resp = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Alex & Jessica <alex@v2u.us>',
      to: [email],
      subject: "Welcome to AI-Now! Here's what's next...",
      html,
    }),
  })

  if (!resp.ok) {
    const text = await resp.text().catch(() => '')
    throw new Error(`Resend API error: ${resp.status} ${resp.statusText} ${text}`)
  }

  return resp.json()
}

async function getWelcomeHtml(): Promise<string> {
  try {
    // Prefer KV-stored template (admin can PUT it)
    const kv = await kvClient.get('email:welcome:html')
    if (kv) return kv
  } catch (err) {
    console.warn('KV read for welcome html failed, falling back to file', err)
  }

  // Next fallback - file in docs/html
  const fileHtml = loadWelcomeHtmlFromFile()
  if (fileHtml) return fileHtml

  // Final fallback - built-in template
  return getWelcomeEmailHTML()
}

function getWelcomeEmailHTML() {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
  
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 32px;">Welcome to AI-Now! 🚀</h1>
  </div>
  
  <div style="background: #ffffff; padding: 40px 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
    
    <p style="font-size: 18px; margin-bottom: 20px;">Hi there,</p>
    
    <p>Welcome to the AI-Now community! We're excited to have you here.</p>
    
    <h2 style="color: #667eea; font-size: 22px; margin-top: 30px;">Here's what you just signed up for:</h2>
    
    <ul style="line-height: 2; padding-left: 20px;">
      <li>✅ Weekly AI digest every Monday morning</li>
      <li>✅ Curated insights from Alex & Jessica's daily episodes</li>
      <li>✅ No spam, no fluff—just actionable AI intel</li>
    </ul>
    
    <h2 style="color: #667eea; font-size: 22px; margin-top: 30px;">What to expect this week:</h2>
    
    <p>This Monday, you'll get our first digest covering:</p>
    <ul style="line-height: 2; padding-left: 20px;">
      <li>The 3 biggest AI developments from the past week</li>
      <li>One tool you can start using today</li>
      <li>A sneak peek at what our premium subscribers are learning</li>
    </ul>
    
    <div style="background: #f9fafb; padding: 25px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #667eea;">
      <h3 style="margin-top: 0; color: #667eea;">Want to go deeper?</h3>
      <p style="margin-bottom: 15px;">Our premium subscribers get:</p>
      <ul style="line-height: 2; margin-bottom: 20px;">
        <li>Weekly AI-Now-Educate series (Master Prompts → Magentic Architecture)</li>
        <li>Monthly deep-dive reports</li>
        <li>Commercial AI tool reviews</li>
        <li>Conceptual frameworks that matter</li>
      </ul>
      <p><strong>Founding members get lifetime pricing: $3.99/month</strong> (normally $4.99)</p>
      <a href="https://v2u.us/subscribe" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; margin-top: 10px;">Join as Founding Member →</a>
    </div>
    
    <h3 style="color: #667eea; margin-top: 30px;">Quick housekeeping:</h3>
    <ul style="line-height: 2; padding-left: 20px; color: #666;">
      <li>These emails come from alex@v2u.us</li>
      <li>You'll hear from us once per week (max)</li>
      <li>Unsubscribe anytime with one click (no hard feelings)</li>
    </ul>
    
    <p style="margin-top: 30px;">See you Monday!</p>
    
    <p style="margin-bottom: 0;"><strong>— Alex & Jessica</strong><br>
    <span style="color: #666;">AI-Now by v2u</span></p>
    
    <p style="font-size: 14px; color: #666; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
      <em>P.S. Have a specific AI question? Hit reply—we actually read these.</em>
    </p>
    
  </div>
  
  <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
    <p>v2u | Empowering Your Future with AI</p>
    <p><a href="https://v2u.us" style="color: #667eea; text-decoration: none;">Visit our website</a></p>
  </div>
  
</body>
</html>`
}
