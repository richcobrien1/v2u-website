// app/api/login/route.ts
// DEPRECATED: This endpoint is being replaced by Clerk authentication
// DO NOT USE - For migration reference only
import { NextResponse } from 'next/server'

export async function POST() {
  // This endpoint is disabled for security
  console.error('⚠️ Legacy /api/login called - this endpoint is disabled')
  console.error('   Please use Clerk authentication instead')
  
  return NextResponse.json({ 
    success: false,
    error: 'This authentication method is deprecated. Please use the new login system.',
    deprecated: true
  }, { status: 410 }) // 410 Gone
}

// SECURITY NOTE: Hardcoded credentials removed 2026-03-25
// Historical issue: Passwords were stored in plain text in this file
// Migration: All authentication now handled by Clerk
