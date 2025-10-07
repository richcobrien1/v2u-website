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
      const decoded = jwt.verify(token, jwtSecret) as { adminId?: string; role?: string; exp?: number; iat?: number };

      if (!decoded.adminId) {
        return NextResponse.json({ error: 'Invalid token payload' }, { status: 401 });
      }

      // Determine if this was a "remember me" token (30 days) or regular token (24 hours)
      // by checking the original expiration time
      const originalDuration = decoded.exp && decoded.iat ? decoded.exp - decoded.iat : 24 * 60 * 60; // default to 24 hours
      const isLongSession = originalDuration > 24 * 60 * 60; // longer than 24 hours means it was a remember me token

      // Issue a fresh token with same expiration policy
      const expiresIn = isLongSession ? '30d' : '24h';
      const maxAge = isLongSession ? 30*24*60*60 : 24*60*60;

      const freshToken = jwt.sign(
        { adminId: decoded.adminId, role: decoded.role },
        jwtSecret,
        { expiresIn }
      );

      const res = NextResponse.json({ success: true, message: 'Token refreshed' });
      // Set fresh HttpOnly cookie
      const isProduction = process.env.NODE_ENV === 'production';
      const secureFlag = isProduction ? '; Secure' : '';
      res.headers.set('Set-Cookie', `v2u_admin_token=${freshToken}; HttpOnly; Path=/; SameSite=Lax${secureFlag}; Max-Age=${maxAge}`);
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