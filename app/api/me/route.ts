// website/app/api/me/route.ts
// API route to validate login and return current user info from JWT cookie

import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'

export async function GET() {
  // cookies() is async in App Router, so we must await it
  const cookieStore = await cookies()
  const token = cookieStore.get('v2u-token')?.value
  if (!token) {
    return NextResponse.json({ loggedIn: false }, { status: 401 })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret') as {
      customerId: string
      subscription: string
    }

    return NextResponse.json({
      loggedIn: true,
      customerId: decoded.customerId,
      subscription: decoded.subscription,
    })
  } catch (err) {
    console.error('JWT decode failed', err)
    return NextResponse.json({ loggedIn: false }, { status: 403 })
  }
}
