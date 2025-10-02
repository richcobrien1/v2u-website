import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

interface Env {
  'v2u-kv': KVNamespace
}

export async function GET(
  req: NextRequest,
  context: { env: Env }
) {
  const authHeader = req.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Missing token' }, { status: 401 })
  }

  const token = authHeader.replace('Bearer ', '')
  const customerId = req.nextUrl.searchParams.get('customerId')
  if (!customerId) {
    return NextResponse.json({ error: 'Missing customerId' }, { status: 400 })
  }

  try {
    // Redundant KV lookups for resilience
    const [secret, access, subscriptionId] = await Promise.all([
      context.env['v2u-kv'].get(`secret:${customerId}`),
      context.env['v2u-kv'].get(`access:${customerId}`),
      context.env['v2u-kv'].get(`subscription:${customerId}`),
    ])

    if (!secret) {
      return NextResponse.json({ error: 'No secret found' }, { status: 403 })
    }
    if (access !== 'granted') {
      return NextResponse.json({ error: 'Access not granted' }, { status: 403 })
    }

    // Verify JWT with per‑customer secret
    const decoded = jwt.verify(token, secret) as {
      customerId: string
      iat: number
      exp: number
      [key: string]: unknown
    }

    if (decoded.customerId !== customerId) {
      return NextResponse.json({ error: 'Customer mismatch' }, { status: 403 })
    }

    // ✅ Authorized — return full redundant details
    return NextResponse.json({
      status: 'ok',
      message: 'Access granted',
      customerId,
      subscriptionId,
      tokenPayload: decoded,
      kvState: {
        access,
        hasSecret: !!secret,
        hasSubscription: !!subscriptionId,
      },
    })
  } catch (err) {
    console.error('JWT verification failed:', err)
    return NextResponse.json({ error: 'Invalid token' }, { status: 403 })
  }
}