import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

async function readMockKV() {
  const file = path.resolve(process.cwd(), '.v2u-mock-kv.json')
  try {
    if (!fs.existsSync(file)) return {}
    const raw = await fs.promises.readFile(file, 'utf8')
    return JSON.parse(raw || '{}')
  } catch (err) {
    console.error('Failed to read mock KV file', err)
    return { error: 'failed to read mock kv' }
  }
}

async function listCloudflareKV() {
  const account = process.env.CLOUDFLARE_ACCOUNT_ID
  const namespace = process.env.CLOUDFLARE_KV_NAMESPACE_ID
  const token = process.env.CLOUDFLARE_API_TOKEN
  if (!account || !namespace || !token) return { error: 'cloudflare credentials not configured' }

  const base = `https://api.cloudflare.com/client/v4/accounts/${account}/storage/kv/namespaces/${namespace}`
  try {
    // list keys (paginated) - we'll fetch first 1000 for convenience
    const res = await fetch(`${base}/keys?limit=1000`, { headers: { Authorization: `Bearer ${token}` } })
    if (!res.ok) return { error: `cloudflare list failed: ${res.status}` }
    const json = await res.json()
    return json
  } catch (err) {
    console.error('Cloudflare KV list failed', err)
    return { error: 'cloudflare list failed' }
  }
}

export async function GET(req: NextRequest) {
  // protect this debug route with the admin onboarding token (dev only)
  const provided = req.headers.get('x-admin-onboard-token') || req.headers.get('x-admin-token')
  const expected = process.env.ADMIN_ONBOARD_TOKEN
  if (!expected || provided !== expected) {
    return NextResponse.json({ error: 'unauthorized - provide x-admin-onboard-token header' }, { status: 401 })
  }

  // If Cloudflare KV is configured, prefer listing keys via the API (safe read-only)
  if (process.env.CLOUDFLARE_KV_NAMESPACE_ID && process.env.CLOUDFLARE_API_TOKEN && process.env.CLOUDFLARE_ACCOUNT_ID) {
    const cf = await listCloudflareKV()
    return NextResponse.json({ source: 'cloudflare', data: cf })
  }

  // fallback to reading the mock KV file stored locally
  const mock = await readMockKV()
  return NextResponse.json({ source: 'mock', data: mock })
}
