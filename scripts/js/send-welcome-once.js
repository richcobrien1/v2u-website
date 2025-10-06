#!/usr/bin/env node
const fs = require('fs')
const path = require('path')
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') })

const RESEND_API_KEY = process.env.RESEND_API_KEY
if (!RESEND_API_KEY) {
  console.error('RESEND_API_KEY not found in .env.local; aborting')
  process.exit(2)
}

const to = process.argv[2]
if (!to) {
  console.error('Usage: node scripts/js/send-welcome-once.js recipient@example.com')
  process.exit(2)
}

async function main() {
  try {
    const filePath = path.resolve(process.cwd(), 'docs', 'html', 'email_template.html')
    let html = null
    if (fs.existsSync(filePath)) {
      html = fs.readFileSync(filePath, 'utf8')
    } else {
      console.warn('Template file not found, using built-in fallback')
      // Minimal fallback
      html = '<p>Welcome to AI-Now!</p>'
    }

    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Alex & Jessica <alex@v2u.us>',
        to: [to],
        subject: "Welcome to AI-Now! Here's what's next...",
        html
      })
    })

    if (!resp.ok) {
      const text = await resp.text().catch(() => '')
      console.error('Resend API error', resp.status, resp.statusText, text)
      process.exit(1)
    }

    const json = await resp.json()
    console.log('Email sent, id:', json?.id || '(no id returned)')
    process.exit(0)
  } catch (err) {
    console.error('Send failed:', err)
    process.exit(1)
  }
}

main()
