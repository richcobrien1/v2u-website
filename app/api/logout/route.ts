import { NextResponse } from 'next/server'

export async function POST() {
  const res = NextResponse.json({ ok: true })
  const cookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: 'lax' as const,
    path: '/',
    domain: 'www.v2u.us',
    expires: new Date(0),
  }

  res.cookies.set('v2u-token', '', cookieOptions)
  res.cookies.set('v2u-access', '', cookieOptions)

  return res
}
