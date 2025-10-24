// website/app/api/logout/route.ts
// Logout route to clear authentication cookies and end the user session

import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST() {
  const store = await cookies()

  // Delete both cookies explicitly
  store.delete('v2u-token')
  store.delete('v2u-access')

  // Respond with JSON
  return NextResponse.json({ ok: true })
}
