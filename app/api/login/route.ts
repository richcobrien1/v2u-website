// app/api/login/route.ts
import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

const mockUsers = [
  { email: 'richcobrien@hotmail.com', password: '1Topgun123', firstName: 'Richard', subscription: 'premium' },
  { email: 'breannamobrien@hotmail.com', password: 'password', firstName: 'Breanna', subscription: 'premium' },
]

interface LoginRequest {
  email: string
  password: string
}

export async function POST(req: Request) {
  // explicitly type the parsed body
  const { email, password } = (await req.json()) as LoginRequest

  const user = mockUsers.find((u) => u.email === email && u.password === password)
  if (!user) {
    return NextResponse.json({ success: false }, { status: 401 })
  }

  const jwtSecret = process.env.JWT_SECRET || 'your-jwt-secret'
  const token = jwt.sign(
    { customerId: user.email, subscription: user.subscription, firstName: user.firstName },
    jwtSecret,
    { expiresIn: '7d' }
  )

  const res = NextResponse.json({ success: true })
  const cookieOptions = {
    httpOnly: true,
    secure: true,
    sameSite: 'lax' as const,
    path: '/',
    domain: 'www.v2u.us',
  }

  res.cookies.set('v2u-token', token, cookieOptions)
  res.cookies.set('v2u-access', user.subscription, cookieOptions)

  return res
}
