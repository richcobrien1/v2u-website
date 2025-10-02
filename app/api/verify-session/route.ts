import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import jwt from 'jsonwebtoken'

// Stripe client
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

// Mock KV operations for Next.js testing
const mockKV = {
  get: async (key: string) => {
    console.log(`KV GET: ${key}`)
    // For testing, return mock values for access
    if (key.includes('access:')) return 'granted'
    if (key.includes('secret:')) return 'mock-secret-' + Math.random().toString(36).substring(7)
    return null
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const sessionId = searchParams.get('session_id')

  if (!sessionId) {
    return NextResponse.json({ granted: false, error: 'Missing session_id' }, { status: 400 })
  }

  try {
    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    const customerId =
      typeof session.customer === 'string' ? session.customer : session.customer?.id

    if (!customerId) {
      return NextResponse.json({ granted: false, error: 'No customer found' }, { status: 403 })
    }

    // Mock KV lookups for testing
    const [access, secret] = await Promise.all([
      mockKV.get(`access:${customerId}`),
      mockKV.get(`secret:${customerId}`),
    ])

    if (access === 'granted' && secret) {
      // Mint a JWT for API/CLI access
      const token = jwt.sign(
        { sub: customerId, scope: ['read:private'] },
        process.env.JWT_SECRET!,
        { expiresIn: '30d' }
      )

      return NextResponse.json({ granted: true, jwt: token })
    }

    return NextResponse.json({ granted: false, error: 'Access not granted' }, { status: 403 })
  } catch (err) {
    console.error('Stripe session verification failed:', err)
    return NextResponse.json({ granted: false, error: 'Internal error' }, { status: 500 })
  }
}