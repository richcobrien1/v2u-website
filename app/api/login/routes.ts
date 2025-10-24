import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken'

// In production, replace this with a real user lookup (DB, Stripe, etc.)
const mockUsers = [
  { email: 'richcobrien@hotmail.com', password: '1Topgun123$', subscription: 'premium' },
  { email: 'breannamobrien@hotmail.com', password: 'password', subscription: 'premium' },
];

interface LoginRequestBody {
  email: string;
  password: string;
}

export async function POST(req: Request) {
  const body: LoginRequestBody = await req.json();
  const { email, password } = body;

  const user = mockUsers.find(
    (u) => u.email === email && u.password === password
  )

  if (!user) {
    return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 })
  }

  const jwtSecret = process.env.JWT_SECRET || 'your-jwt-secret'

  // Create JWT payload
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

  // 🍪 Cookie for quick gating
  response.cookies.set('v2u-access', user.subscription === 'premium' ? 'granted' : 'free', {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
  })

  // 🔑 JWT cookie for API validation
  response.cookies.set('v2u-token', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
  })

  return response
}
