// app/api/login/route.ts
// DEPRECATED: This endpoint is being replaced by Clerk authentication
// DO NOT USE - For migration reference only
import { NextResponse } from 'next/server'

interface LoginRequest {
  email: string
  password: string
}

export async function POST(req: Request) {
  // This endpoint is disabled for security
  console.error('⚠️ Legacy /api/login called - this endpoint is disabled')
  console.error('   Please use Clerk authentication instead')
  
  return NextResponse.json({ 
    success: false,
    error: 'This authentication method is deprecated. Please use the new login system.',
    deprecated: true
  }, { status: 410 }) // 410 Gone
}

// SECURITY NOTE: Hardcoded credentials removed 2026-03-25
// Historical issue: Passwords were stored in plain text in this file
// Migration: All authentication now handled by Clerk

// Legacy code preserved for reference (DO NOT RESTORE):
// const mockUsers = [
//   { email: 'user@example.com', password: 'REMOVED', ... },
// ]

function legacyLoginResponse() {
  const res = NextResponse.json({ 
    success: true, 
    subscription: 'premium',
    firstName: 'User',
  })
  
  // Use appropriate domain and security based on environment
  const isProduction = process.env.NODE_ENV === 'production'
  const cookieOptions: Record<string, unknown> = {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax' as const,
    path: '/',
  }
  
  // Only set domain in production
  if (isProduction) {
    cookieOptions.domain = 'www.v2u.us'
  }

  res.cookies.set('v2u-token', token, cookieOptions)
  res.cookies.set('v2u-access', user.subscription, cookieOptions)

  return res
}
