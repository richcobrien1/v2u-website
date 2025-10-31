import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import jwt from 'jsonwebtoken'
import { checkAccess, getCustomerSecret } from '@/lib/kv-client'

let stripe: Stripe | null = null

function getStripe() {
  if (!stripe) {
    const secretKey = process.env.STRIPE_SECRET_KEY
    if (!secretKey) {
      throw new Error('STRIPE_SECRET_KEY is not configured')
    }
    stripe = new Stripe(secretKey)
  }
  return stripe
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const sessionId = searchParams.get('session_id')

  if (!sessionId) {
    return NextResponse.json({ granted: false, error: 'Missing session_id' }, { status: 400 })
  }

  try {
    // Retrieve the checkout session from Stripe
    const session = await getStripe().checkout.sessions.retrieve(sessionId)
    const customerId =
      typeof session.customer === 'string' ? session.customer : session.customer?.id

    if (!customerId) {
      return NextResponse.json({ granted: false, error: 'No customer found' }, { status: 403 })
    }

    // Check the shared KV for access and secret
    const [access, secret] = await Promise.all([
      checkAccess(customerId),
      getCustomerSecret(customerId),
    ])

    if (access && secret) {
      // Mint a JWT for API/CLI access. Use a safe fallback secret for local dev.
      const jwtSecret = process.env.JWT_SECRET || 'default-secret-for-testing'
      const token = jwt.sign(
        { sub: customerId, scope: ['read:private'] },
        jwtSecret,
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