// Debug endpoint to set test authentication cookies
import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

export async function GET() {
  const jwtSecret = process.env.JWT_SECRET || 'your-jwt-secret'
  const token = jwt.sign(
    { 
      customerId: 'test-premium-user', 
      subscription: 'premium', 
      firstName: 'Test User' 
    },
    jwtSecret,
    { expiresIn: '7d' }
  )

  const res = NextResponse.json({ 
    success: true, 
    message: 'Test premium authentication cookie set',
    subscription: 'premium',
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
  res.cookies.set('v2u-access', 'premium', cookieOptions)

  return res
}