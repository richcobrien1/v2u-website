// website/app/api/logout/route.ts
// Logout route to clear authentication cookies
// and end the user session

import { NextResponse } from 'next/server'

export async function POST() {
  const res = NextResponse.json({ ok: true })
  // Expire both cookies
  res.cookies.set('v2u-token', '', { expires: new Date(0), path: '/' })
  res.cookies.set('v2u-access', '', { expires: new Date(0), path: '/' })
  return res
}
