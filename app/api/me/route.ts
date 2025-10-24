import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

export async function GET() {
  const cookieStore = await cookies()
  const tokenCookie = cookieStore.get('v2u-token')

  if (!tokenCookie) {
    return NextResponse.json({ loggedIn: false }, { status: 401 })
  }

  try {
    const decoded = jwt.verify(
      tokenCookie.value,
      process.env.JWT_SECRET || 'your-jwt-secret'
    ) as { customerId: string; subscription: string }

    return NextResponse.json({
      loggedIn: true,
      customerId: decoded.customerId,
      subscription: decoded.subscription,
    })
  } catch (err) {
    console.error('JWT verification failed:', err)
    return NextResponse.json({ loggedIn: false }, { status: 403 })
  }
}
