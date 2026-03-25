import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { getAdminEntry, verifyAdminSecret } from '@/lib/kv-client';

// POST /api/admin-login
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { adminId?: string; secret?: string; rememberMe?: boolean };
    console.log('🔐 Login attempt for:', body.adminId);
    
    if (!body.adminId || !body.secret) {
      console.log('❌ Missing adminId or secret');
      return NextResponse.json({ error: 'adminId and secret required' }, { status: 400 });
    }

    // Check if admin entry exists
    const entry = await getAdminEntry(body.adminId);
    console.log('📋 Admin entry found:', entry ? 'YES' : 'NO');
    
    if (!entry) {
      console.log('❌ Admin entry not found for:', body.adminId);
      return NextResponse.json({ error: 'Invalid admin credentials' }, { status: 401 });
    }

    // Verify provided secret against stored hash (no plaintext stored)
    console.log('🔑 Verifying secret...');
    const valid = await verifyAdminSecret(body.adminId, body.secret);
    console.log('🔑 Secret valid:', valid ? 'YES' : 'NO');
    
    if (!valid) {
      console.log('❌ Invalid secret for:', body.adminId);
      return NextResponse.json({ error: 'Invalid admin credentials' }, { status: 401 });
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('❌ JWT_SECRET not configured - refusing to sign token');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }
    
    // Set expiration based on remember me preference
    const expiresIn = body.rememberMe ? '90d' : '24h';
    const maxAge = body.rememberMe ? 90*24*60*60 : 24*60*60; // 90 days or 24 hours in seconds
    const token = jwt.sign({ adminId: body.adminId, role: entry.role }, jwtSecret, { expiresIn });
    
    console.log('🔐 Login successful for:', body.adminId, 'token length:', token.length);

    const res = NextResponse.json({ success: true, message: 'Logged in' });
    // Set HttpOnly cookie for domain; adjust secure flag per environment
    const isProduction = process.env.NODE_ENV === 'production';
    const secureFlag = isProduction ? '; Secure' : '';
    const cookieValue = `v2u_admin_token=${token}; HttpOnly; Path=/; SameSite=Lax${secureFlag}; Max-Age=${maxAge}`;
    console.log('🍪 Setting cookie:', cookieValue.substring(0, 50) + '...');
    
    res.headers.set('Set-Cookie', cookieValue);
    return res;

  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
