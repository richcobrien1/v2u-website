// website/app/api/login/route.ts
// API route for user login, JWT generation, and setting cookies

import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

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

  const response = NextResponse.json({
    success: true,
    subscription: user.subscription,
    token,
  })

  // Common cookie options
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // only secure in prod
    sameSite: 'lax' as const,
    path: '/',
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
