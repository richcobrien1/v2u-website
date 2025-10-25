import { NextResponse } from 'next/server'

export async function POST() {
  const res = NextResponse.json({ ok: true })
  
  // Use appropriate domain based on environment
  const isProduction = process.env.NODE_ENV === 'production'
  const cookieOptions: any = {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax' as const,
    path: '/',
    expires: new Date(0),
  }
  
  // Only set domain in production
  if (isProduction) {
    cookieOptions.domain = 'www.v2u.us'
  }

  res.cookies.set('v2u-token', '', cookieOptions)
  res.cookies.set('v2u-access', '', cookieOptions)

  return res
}
