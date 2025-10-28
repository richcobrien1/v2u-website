import { kvClient } from '@/lib/kv-client'
import fs from 'fs'
import path from 'path'

const RESEND_API_KEY = process.env.RESEND_API_KEY

export async function getWelcomeHtml(): Promise<string> {
  try {
    const kv = await kvClient.get('email:welcome:html')
    if (kv) return kv
  } catch (err) {
    console.warn('KV read for welcome html failed, falling back to file', err)
  }

  // fallback to file
  try {
    const filePath = path.resolve(process.cwd(), 'docs', 'html', 'email_template.html')
    if (fs.existsSync(filePath)) return fs.readFileSync(filePath, 'utf8')
  } catch (err) {
    console.warn('Failed to read welcome file fallback', err)
  }

  // final fallback
  return `<p>Welcome to AI-Now!</p>`
}

export async function sendWelcomeEmail(email: string) {
  if (!RESEND_API_KEY) throw new Error('RESEND_API_KEY not set')
  const html = await getWelcomeHtml()

  const resp = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
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

export async function getPromotionalHtml(): Promise<string> {
  try {
    const filePath = path.resolve(process.cwd(), 'docs', 'html', 'email_promotional_template.html')
    if (fs.existsSync(filePath)) return fs.readFileSync(filePath, 'utf8')
  } catch (err) {
    console.warn('Failed to read promotional template file', err)
  }

  // fallback
  return `<p>Check out our latest AI insights!</p>`
}

export async function sendPromotionalEmail(email: string, html?: string) {
  if (!RESEND_API_KEY) {
    console.error('❌ RESEND_API_KEY not set in environment variables')
    throw new Error('RESEND_API_KEY not set')
  }
  
  const emailHtml = html || await getPromotionalHtml()

  const payload = {
    from: 'Alex & Jessica <alex@v2u.us>',
    to: [email],
    subject: "Stay Ahead in the AI Revolution - Your Exclusive Invitation",
    html: emailHtml,
  }

  console.log('🔵 Sending promotional email via Resend:', { 
    to: email, 
    from: payload.from,
    subject: payload.subject,
    htmlLength: emailHtml.length 
  })

  const resp = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  const responseText = await resp.text()
  console.log('🔵 Resend API Response:', { 
    status: resp.status, 
    statusText: resp.statusText,
    body: responseText 
  })

  if (!resp.ok) {
    const errorMessage = `Resend API error: ${resp.status} ${resp.statusText} - ${responseText}`
    console.error('❌ Resend API failed:', errorMessage)
    throw new Error(errorMessage)
  }

  const result = JSON.parse(responseText)
  console.log('✅ Email sent successfully:', result)
  return result
}
