import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { getAdminEntry, verifyAdminSecret } from '@/lib/kv-client';

// POST /api/admin-login
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { adminId?: string; secret?: string; rememberMe?: boolean };
    if (!body.adminId || !body.secret) {
      return NextResponse.json({ error: 'adminId and secret required' }, { status: 400 });
    }

    // Verify provided secret against stored hash (no plaintext stored)
    const valid = await verifyAdminSecret(body.adminId, body.secret);
    if (!valid) {
      return NextResponse.json({ error: 'Invalid admin credentials' }, { status: 401 });
    }

    const entry = await getAdminEntry(body.adminId);
    if (!entry) {
      return NextResponse.json({ error: 'Invalid admin credentials' }, { status: 401 });
    }

    const jwtSecret = process.env.JWT_SECRET || 'default-secret-for-testing';
    // Set expiration based on remember me preference
    const expiresIn = body.rememberMe ? '30d' : '24h';
    const maxAge = body.rememberMe ? 30*24*60*60 : 24*60*60; // 30 days or 24 hours in seconds
    const token = jwt.sign({ adminId: body.adminId, role: entry.role }, jwtSecret, { expiresIn });

    const res = NextResponse.json({ success: true, message: 'Logged in' });
    // Set HttpOnly cookie for domain; adjust secure flag per environment
    const isProduction = process.env.NODE_ENV === 'production';
    const secureFlag = isProduction ? '; Secure' : '';
    res.headers.set('Set-Cookie', `v2u_admin_token=${token}; HttpOnly; Path=/; SameSite=Lax${secureFlag}; Max-Age=${maxAge}`);
    return res;

  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
