// website/app/api/me/route.ts
// API route to validate login and return current user info from JWT cookie

import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'

export async function GET() {
  // Depending on your Next.js version, cookies() may be sync or async.
  // If your types say it's a Promise, keep the await.
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
