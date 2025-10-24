// website/app/api/login/route.ts
// API route for user login, JWT generation, and setting cookies

import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

// In production, replace this with a real user lookup (DB, Stripe, etc.)
const mockUsers = [
  { email: 'richcobrien@hotmail.com', password: '1Topgun123$', subscription: 'premium' },
  { email: 'breannamobrien@hotmail.com', password: 'password', subscription: 'premium' },
]

interface LoginRequestBody {
  email: string
  password: string
}

export async function POST(req: Request) {
  const body: LoginRequestBody = await req.json()
  const { email, password } = body

  const user = mockUsers.find((u) => u.email === email && u.password === password)
  if (!user) {
    return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 })
  }

  const jwtSecret = process.env.JWT_SECRET || 'your-jwt-secret'
  const token = jwt.sign(
    { customerId: user.email, subscription: user.subscription },
    jwtSecret,
    { expiresIn: '7d' }
  )

  // Optional: update KV or external store
  try {
    await fetch(`https://your-kv-endpoint.example.com/api/users/${user.email}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.KV_API_KEY}`,
      },
      body: JSON.stringify({
        subscription: user.subscription,
        lastLogin: new Date().toISOString(),
        loginCount: 1,
      }),
    })
  } catch (err) {
    console.error('KV update failed:', err)
  }

  const response = NextResponse.json({
    success: true,
    subscription: user.subscription,
    token,
  })

  // Common cookie options
  const cookieOptions = {
    httpOnly: true,
    secure: true, // production only, you are on https://www.v2u.us
    sameSite: 'lax' as const,
    path: '/',
    domain: 'www.v2u.us', // explicitly scope to your prod host
  }

  // Subscription cookie
  response.cookies.set(
    'v2u-access',
    user.subscription === 'premium' ? 'granted' : 'free',
    cookieOptions
  )

  // JWT cookie
  response.cookies.set('v2u-token', token, cookieOptions)

  return response
}
