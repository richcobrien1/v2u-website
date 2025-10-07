import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

// POST /api/admin-refresh
export async function POST(request: NextRequest) {
  try {
    const cookieHeader = request.headers.get('cookie') || '';
    const match = cookieHeader.match(/v2u_admin_token=([^;\s]+)/);
    if (!match) {
      return NextResponse.json({ error: 'No admin token' }, { status: 401 });
    }

    const token = match[1];
    const jwtSecret = process.env.JWT_SECRET || 'default-secret-for-testing';

    try {
      // Verify the existing token
      const decoded = jwt.verify(token, jwtSecret) as { adminId?: string; role?: string };

      if (!decoded.adminId) {
        return NextResponse.json({ error: 'Invalid token payload' }, { status: 401 });
      }

      // Issue a fresh token with 24 hour expiration
      const freshToken = jwt.sign(
        { adminId: decoded.adminId, role: decoded.role },
        jwtSecret,
        { expiresIn: '24h' }
      );

      const res = NextResponse.json({ success: true, message: 'Token refreshed' });
      // Set fresh HttpOnly cookie
      res.headers.set('Set-Cookie', `v2u_admin_token=${freshToken}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${24*60*60}`);
      return res;

    } catch (err) {
      console.error('Token refresh failed:', err);
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

  } catch (error) {
    console.error('Admin refresh error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}