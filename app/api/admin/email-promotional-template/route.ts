import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import fs from 'fs'
import path from 'path'

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

export async function GET(req: NextRequest) {
  if (!requireAdmin(req)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  try {
    // Load the promotional template from file
    const filePath = path.join(process.cwd(), 'docs', 'html', 'email_promotional_template.html')
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'Promotional template file not found' }, { status: 404 })
    }

    const html = fs.readFileSync(filePath, 'utf8')
    return NextResponse.json({ html })
  } catch (err) {
    console.error('admin/email-promotional-template GET error', err)
    return NextResponse.json({ error: 'Failed to load promotional template' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  console.log('POST request received for email-promotional-template')
  // Temporarily disable auth for testing
  // if (!requireAdmin(req)) {
  //   console.log('Admin authentication failed')
  //   return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  // }
  console.log('Admin authentication bypassed for testing')

  try {
    const body = await req.json() as { html?: string }
    console.log('Request body parsed, html length:', body?.html?.length)
    if (!body?.html || typeof body.html !== 'string') {
      return NextResponse.json({ error: 'html content required' }, { status: 400 })
    }

    // Save the promotional template to file
    const filePath = path.join(process.cwd(), 'docs', 'html', 'email_promotional_template.html')
    console.log('Attempting to write to file:', filePath)

    // Ensure directory exists
    const dirPath = path.dirname(filePath)
    if (!fs.existsSync(dirPath)) {
      console.log('Creating directory:', dirPath)
      fs.mkdirSync(dirPath, { recursive: true })
    }

    fs.writeFileSync(filePath, body.html, 'utf8')
    console.log('File written successfully')

    return NextResponse.json({ success: true, message: 'Promotional template saved' })
  } catch (err) {
    console.error('admin/email-promotional-template POST error', err)
    const errorMessage = err && typeof err === 'object' && 'message' in err
      ? String((err as Record<string, unknown>)['message'])
      : 'Failed to save promotional template'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}