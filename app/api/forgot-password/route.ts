// website/app/api/forgot-password/route.ts
// Handles password reset requests

import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { kvClient } from '@/lib/kv-client'
import { sendPasswordResetEmail } from '@/lib/email'

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

    // Send password reset email
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : 'http://localhost:3000'
    const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`
    
    try {
      await sendPasswordResetEmail(email, resetUrl)
      console.log(`✅ Password reset email sent to: ${email}`)
    } catch (emailError) {
      console.error('❌ Failed to send password reset email:', emailError)
      // Still return success to prevent email enumeration
      // But log the error for debugging
    }

    return NextResponse.json({
      success: true,
      message: 'If an account exists with that email, you will receive a password reset link shortly.',
    })
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to process request' },
      { status: 500 }
    )
  }
}
