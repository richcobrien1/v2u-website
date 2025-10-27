// website/app/api/forgot-password/route.ts
// Handles password reset requests

import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { kvClient } from '@/lib/kv-client'

interface ForgotPasswordRequest {
  email: string
}

export async function POST(req: Request) {
  const { email } = (await req.json()) as ForgotPasswordRequest

  if (!email) {
    return NextResponse.json(
      { success: false, message: 'Email is required' },
      { status: 400 }
    )
  }

  try {
    // Generate reset token valid for 1 hour
    const jwtSecret = process.env.JWT_SECRET || 'your-jwt-secret'
    const resetToken = jwt.sign(
      { email, purpose: 'password-reset' },
      jwtSecret,
      { expiresIn: '1h' }
    )

    // Store token in KV with 1 hour expiration
    await kvClient.put(`password-reset:${email}`, resetToken)

    // TODO: Send email with reset link
    // const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${resetToken}`
    // await sendPasswordResetEmail(email, resetUrl)

    console.log(`📧 Password reset requested for: ${email}`)
    console.log(`🔗 Reset token generated (expires in 1h)`)
    console.log(`TODO: Send email with reset link`)

    return NextResponse.json({
      success: true,
      message: 'Password reset email sent',
    })
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to process request' },
      { status: 500 }
    )
  }
}
