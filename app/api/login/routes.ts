import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken'

// In production, replace this with a real user lookup (DB, Stripe, etc.)
const mockUsers = [
  { email: 'richcobrien@hotmail.com', password: '1Topgun123$', subscription: 'premium' },
  { email: 'breannamobrien@hotmail.com', password: 'password', subscription: 'premium' },
];
interface LoginRequestBody {
  email: string
  password: string
}

export async function POST(req: Request) {
  const body: LoginRequestBody = await req.json()
  const { email, password } = body

  const user = mockUsers.find(
    (u) => u.email === email && u.password === password
  )

  if (!user) {
    return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 })
  }

  const jwtSecret = process.env.JWT_SECRET || 'your-jwt-secret'

  const token = jwt.sign(
    { customerId: user.email, subscription: user.subscription },
    jwtSecret,
    { expiresIn: '7d' }
  )

  // 🔄 Update Cloudflare KV with profile metadata
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
        loginCount: 1, // Replace with increment logic if needed
      }),
    })
  } catch (kvError) {
    console.error('KV update failed:', kvError)
    // Optional: log but don’t block login
  }

  const response = NextResponse.json({
    success: true,
    subscription: user.subscription,
    token,
  })

  // 🍪 Cookie for UI gating
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

