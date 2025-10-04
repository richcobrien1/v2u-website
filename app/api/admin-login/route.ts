import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { getAdminEntry } from '@/lib/kv-client';

// POST /api/admin-login
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { adminId?: string; secret?: string };
    if (!body.adminId || !body.secret) {
      return NextResponse.json({ error: 'adminId and secret required' }, { status: 400 });
    }

    const entry = await getAdminEntry(body.adminId);
    if (!entry || entry.secret !== body.secret) {
      return NextResponse.json({ error: 'Invalid admin credentials' }, { status: 401 });
    }

    const jwtSecret = process.env.JWT_SECRET || 'default-secret-for-testing';
    // Short-lived token: 15 minutes
    const token = jwt.sign({ adminId: body.adminId, role: entry.role }, jwtSecret, { expiresIn: '15m' });

    const res = NextResponse.json({ success: true, message: 'Logged in' });
    // Set HttpOnly cookie for domain; adjust secure flag per environment
    res.headers.set('Set-Cookie', `v2u_admin_token=${token}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${15*60}`);
    return res;

  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
