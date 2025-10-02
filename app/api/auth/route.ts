import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

export async function GET(req: NextRequest) {
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
    // For Next.js testing, use a simple JWT verification
    // In production, this would connect to your Cloudflare KV via API
    const jwtSecret = process.env.JWT_SECRET || 'your-jwt-secret'
    
    const decoded = jwt.verify(token, jwtSecret) as {
      customerId: string
      iat: number
      exp: number
      [key: string]: unknown
    }

    if (decoded.customerId !== customerId) {
      return NextResponse.json({ error: 'Customer mismatch' }, { status: 403 })
    }

    // ✅ Authorized — return success for testing
    return NextResponse.json({
      status: 'ok',
      message: 'Access granted',
      customerId,
      tokenPayload: decoded,
      note: 'Testing mode - connects to Cloudflare KV in production'
    })
  } catch (err) {
    console.error('JWT verification failed:', err)
    return NextResponse.json({ error: 'Invalid token' }, { status: 403 })
  }
}