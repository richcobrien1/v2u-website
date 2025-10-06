import { NextRequest, NextResponse } from 'next/server'
import { kvClient } from '@/lib/kv-client'
import fs from 'fs'
import path from 'path'
import jwt from 'jsonwebtoken'

type HistEntry = { action: string; timestamp: string; actor?: string | null; html?: string }

function requireOnboardToken(req: NextRequest) {
  // Accept either the static ADMIN_ONBOARD_TOKEN (header) OR a valid admin JWT
  const provided = req.headers.get('x-admin-onboard-token') || req.headers.get('x-admin-token')
  const expected = process.env.ADMIN_ONBOARD_TOKEN
  if (expected && provided === expected) return true

  const jwtSecret = process.env.JWT_SECRET || 'default-secret-for-testing'
  // If caller provided a token in header, try verifying as JWT
  if (provided) {
    try {
      jwt.verify(provided, jwtSecret)
      return true
    } catch {
      // not a valid JWT – continue to check cookies
    }
  }

  // Also accept a valid JWT presented as a cookie (v2u_admin_token)
  try {
    const cookieHeader = req.headers.get('cookie') || ''
    const match = cookieHeader.match(/v2u_admin_token=([^;\s]+)/)
    if (match) {
      const token = match[1]
      try {
        jwt.verify(token, jwtSecret)
        return true
      } catch {
        // invalid cookie token
      }
    }
  } catch {
    // ignore cookie parsing errors
  }

  return false
}

export async function GET(req: NextRequest) {
  if (!requireOnboardToken(req)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  // Allow callers to request history with ?history=1
  try {
    const url = new URL(req.url)
    const wantHistory = url.searchParams.get('history') === '1' || url.searchParams.get('history') === 'true'

    // Define history entry type
    type HistEntry = { action: string; timestamp: string; actor?: string | null; html?: string }

    // Try KV first
    try {
      const kv = await kvClient.get('email:welcome:html')
    const result: { source: string; html: string | null; history?: HistEntry[] } = { source: 'kv', html: kv }
        if (wantHistory) {
          try {
            const rawHist = await kvClient.get('email:welcome:history')
            result.history = rawHist ? JSON.parse(rawHist) as HistEntry[] : []
          } catch (err) {
            console.warn('Failed to read email template history from KV', err)
            result.history = []
          }
      }
      if (kv) return NextResponse.json(result)
    } catch (err) {
      console.warn('KV read failure in admin/email-template GET', err)
    }

    // Fallback to local file
    try {
      const filePath = path.resolve(process.cwd(), 'docs', 'html', 'email_template.html')
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8')
        const result: { source: string; html: string | null; history?: HistEntry[] } = { source: 'file', html: content }
        if (wantHistory) {
          try {
            const rawHist = await kvClient.get('email:welcome:history')
            result.history = rawHist ? JSON.parse(rawHist) as HistEntry[] : []
          } catch (err) {
            console.warn('Failed to read email template history from KV', err)
            result.history = []
          }
        }
        return NextResponse.json(result)
      }
    } catch (err) {
      console.error('File read error in admin/email-template GET', err)
    }

    // No template - still return history if requested
    const fallback: { source: string; html: string | null; history?: HistEntry[] } = { source: 'builtin', html: null }
    if (wantHistory) {
      try {
        const rawHist = await kvClient.get('email:welcome:history')
        fallback.history = rawHist ? JSON.parse(rawHist) as HistEntry[] : []
      } catch (err) {
        console.warn('Failed to read email template history from KV', err)
        fallback.history = []
      }
    }
    return NextResponse.json(fallback)
  } catch (err) {
    console.error('admin/email-template GET error', err)
    return NextResponse.json({ error: 'internal' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  if (!requireOnboardToken(req)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  try {
    const body = await req.json() as { html?: string }
    if (!body?.html) return NextResponse.json({ error: 'html required' }, { status: 400 })

    // Store in KV (preferred)
    try {
      await kvClient.put('email:welcome:html', body.html)
    } catch (err) {
      console.warn('KV put failed in admin/email-template PUT', err)
    }

    // Append to history in KV (keep most recent 50 entries)
    try {
      const raw = await kvClient.get('email:welcome:history')
      const list = raw ? JSON.parse(raw) as HistEntry[] : []
      list.unshift({ action: 'PUT', timestamp: new Date().toISOString(), actor: req.headers.get('x-admin-onboard-token') ? 'onboard-token' : null, html: body.html })
      await kvClient.put('email:welcome:history', JSON.stringify(list.slice(0, 50)))
    } catch {
      console.warn('Failed to append email template history to KV')
    }

    // Also persist to local file for developer convenience (only if enabled)
    try {
      const allowFile = process.env.ENABLE_LOCAL_TEMPLATE_FILE === 'true'
      if (allowFile) {
        const filePath = path.resolve(process.cwd(), 'docs', 'html')
        if (!fs.existsSync(filePath)) fs.mkdirSync(filePath, { recursive: true })
        fs.writeFileSync(path.resolve(filePath, 'email_template.html'), body.html, 'utf8')
      }
    } catch (err) {
      console.warn('Failed to write local email template file', err)
    }

    // Clear in-process cache if present
    try {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      if (globalThis && globalThis.CACHED_WELCOME_HTML !== undefined) globalThis.CACHED_WELCOME_HTML = null
    } catch {}

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('admin/email-template PUT error', err)
    return NextResponse.json({ error: 'internal' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  if (!requireOnboardToken(req)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  try {
    try { await kvClient.delete('email:welcome:html') } catch (err) { console.warn('KV delete failed', err) }
    // record deletion in history
    try {
      const raw = await kvClient.get('email:welcome:history')
      const list = raw ? JSON.parse(raw) as HistEntry[] : []
      list.unshift({ action: 'DELETE', timestamp: new Date().toISOString(), actor: req.headers.get('x-admin-onboard-token') ? 'onboard-token' : null })
      await kvClient.put('email:welcome:history', JSON.stringify(list.slice(0, 50)))
    } catch {
      console.warn('Failed to append delete action to email template history')
    }
    try { const filePath = path.resolve(process.cwd(), 'docs', 'html', 'email_template.html'); if (fs.existsSync(filePath)) fs.unlinkSync(filePath) } catch (err) { console.warn('File delete failed', err) }
    try {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      if (globalThis && globalThis.CACHED_WELCOME_HTML !== undefined) globalThis.CACHED_WELCOME_HTML = null
    } catch {}
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('admin/email-template DELETE error', err)
    return NextResponse.json({ error: 'internal' }, { status: 500 })
  }
}
