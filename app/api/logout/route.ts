// website/app/api/logout/route.ts
// Logout route to clear authentication cookies and end the user session

import { NextResponse } from 'next/server'

export async function POST() {
  const res = NextResponse.json({ ok: true })

  // Expire both cookies with the same attributes used on login
  res.cookies.set('v2u-token', '', {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    expires: new Date(0),
  })

  res.cookies.set('v2u-access', '', {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    expires: new Date(0),
  })

  return res
}
