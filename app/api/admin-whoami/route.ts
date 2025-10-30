import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

export async function GET(request: NextRequest) {
  try {
    const cookieHeader = request.headers.get('cookie') || '';
    console.log('admin-whoami: cookie header:', cookieHeader.substring(0, 200) + '...');
    
    const match = cookieHeader.match(/v2u_admin_token=([^;\s]+)/);
    console.log('admin-whoami: token match:', match ? 'found' : 'not found');
    
    if (!match) return NextResponse.json({ error: 'No admin token' }, { status: 401, headers: { 'Cache-Control': 'no-store' } });

    const token = match[1];
    console.log('admin-whoami: token length:', token.length);
    
    const jwtSecret = process.env.JWT_SECRET || 'default-secret-for-testing';
    console.log('admin-whoami: using jwt secret:', jwtSecret.substring(0, 10) + '...');

    try {
      const decoded = jwt.verify(token, jwtSecret) as { adminId?: string; role?: string; iat?: number; exp?: number };
      console.log('admin-whoami: decoded token:', { adminId: decoded.adminId, role: decoded.role });
      
      return NextResponse.json({ success: true, identity: decoded }, { headers: { 'Cache-Control': 'no-store' } });
    } catch (err) {
      console.error('Admin JWT verify failed', err);
      return NextResponse.json({ error: 'Invalid token' }, { status: 401, headers: { 'Cache-Control': 'no-store' } });
    }

  } catch (err) {
    console.error('admin-whoami error', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500, headers: { 'Cache-Control': 'no-store' } });
  }
}
