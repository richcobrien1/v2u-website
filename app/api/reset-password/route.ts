// website/app/api/reset-password/route.ts
// Handles password reset with token validation

import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { kvClient } from '@/lib/kv-client'

interface ResetPasswordRequest {
  token: string
  password: string
}

export async function POST(req: Request) {
  const { token, password } = (await req.json()) as ResetPasswordRequest

  if (!token || !password) {
    return NextResponse.json(
      { success: false, message: 'Token and password are required' },
      { status: 400 }
    )
  }

  try {
    // Verify token
    const jwtSecret = process.env.JWT_SECRET || 'your-jwt-secret'
    const decoded = jwt.verify(token, jwtSecret) as {
      email: string
      purpose: string
    }

    if (decoded.purpose !== 'password-reset') {
      return NextResponse.json(
        { success: false, message: 'Invalid reset token' },
        { status: 403 }
      )
    }

    // Check if token exists in KV (not already used)
    const storedToken = await kvClient.get(`password-reset:${decoded.email}`)
    if (storedToken !== token) {
      return NextResponse.json(
        { success: false, message: 'Reset token has expired or already been used' },
        { status: 403 }
      )
    }

    // TODO: Update password in your user database
    // For now, just log it since we're using mock users
    console.log(`🔒 Password reset for: ${decoded.email}`)
    console.log(`TODO: Update password in database`)

    // Delete the used token
    await kvClient.delete(`password-reset:${decoded.email}`)

    return NextResponse.json({
      success: true,
      message: 'Password updated successfully',
    })
  } catch (error) {
    console.error('Reset password error:', error)
    
    if (error instanceof jwt.TokenExpiredError) {
      return NextResponse.json(
        { success: false, message: 'Reset token has expired' },
        { status: 403 }
      )
    }

    return NextResponse.json(
      { success: false, message: 'Invalid or expired reset token' },
      { status: 403 }
    )
  }
}
