import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

const mockUsers = [
  { email: 'richcobrien@hotmail.com', password: '1Topgun123$', subscription: 'premium' },
  { email: 'breannamobrien@hotmail.com', password: 'password', subscription: 'premium' },
]

export async function POST(req: Request) {
  const { email, password } = await req.json()

  const user = mockUsers.find((u) => u.email === email && u.password === password)
  if (!user) {
    return NextResponse.json({ success: false }, { status: 401 })
  }

  const jwtSecret = process.env.JWT_SECRET || 'your-jwt-secret'
  const token = jwt.sign(
    { customerId: user.email, subscription: user.subscription },
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
