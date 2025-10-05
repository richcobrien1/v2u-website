import { NextResponse } from 'next/server';

// POST /api/admin-logout
export async function POST() {
  const res = NextResponse.json({ success: true, message: 'Logged out' });
  // Clear cookie by setting Max-Age=0
  res.headers.set('Set-Cookie', `v2u_admin_token=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0`);
  return res;
}
