import { kvClient } from '@/lib/kv-client'
import fs from 'fs'
import path from 'path'

const RESEND_API_KEY = process.env.RESEND_API_KEY
const EMAIL_FROM = process.env.EMAIL_FROM || 'onboarding@resend.dev' // Use Resend's test domain by default

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
  return `<p>Welcome to AI Deep Dive!</p>`
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
      from: EMAIL_FROM,
      to: [email],
      subject: "Welcome to AI Deep Dive! Here's what's next...",
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
    from: EMAIL_FROM,
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

/**
 * Send password reset email with reset link
 */
export async function sendPasswordResetEmail(email: string, resetUrl: string) {
  if (!RESEND_API_KEY) {
    console.error('❌ RESEND_API_KEY not set in environment variables')
    throw new Error('RESEND_API_KEY not set')
  }

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">Password Reset Request</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                Hi there,
              </p>
              <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                We received a request to reset your password for your V2U account. Click the button below to create a new password:
              </p>
              
              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="${resetUrl}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
                      Reset My Password
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 20px 0; color: #666666; font-size: 14px; line-height: 1.6;">
                Or copy and paste this link into your browser:
              </p>
              <p style="margin: 0 0 20px; color: #667eea; font-size: 14px; word-break: break-all;">
                ${resetUrl}
              </p>
              
              <p style="margin: 30px 0 20px; color: #666666; font-size: 14px; line-height: 1.6; padding-top: 20px; border-top: 1px solid #eeeeee;">
                <strong>⏰ This link expires in 1 hour.</strong>
              </p>
              
              <p style="margin: 0; color: #666666; font-size: 14px; line-height: 1.6;">
                If you didn't request a password reset, you can safely ignore this email. Your password won't be changed.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 20px 40px; background-color: #f8f9fa; border-radius: 0 0 8px 8px; text-align: center;">
              <p style="margin: 0; color: #999999; font-size: 12px;">
                © ${new Date().getFullYear()} V2U Media. All rights reserved.
              </p>
              <p style="margin: 8px 0 0; color: #999999; font-size: 12px;">
                Questions? Contact us at <a href="mailto:support@v2u.us" style="color: #667eea; text-decoration: none;">support@v2u.us</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()

  const payload = {
    from: 'V2U Account <admin@v2u.us>',
    to: [email],
    subject: "Reset Your V2U Password",
    html,
  }

  console.log('🔐 Sending password reset email via Resend:', { 
    to: email, 
    from: payload.from,
    subject: payload.subject 
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
  console.log('🔐 Resend API Response:', { 
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
  console.log('✅ Password reset email sent successfully:', result)
  return result
}
