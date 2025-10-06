import { NextRequest, NextResponse } from 'next/server';
import { createAdminUser, getAdminEntry, revokeAdminUser } from '@/lib/kv-client';
import jwt from 'jsonwebtoken'

// Server-side onboarding token must be set in env: ADMIN_ONBOARD_TOKEN
// POST /api/admin-onboard
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
  token?: string;
  action?: 'create' | 'get' | 'revoke';
  adminId?: string;
  role?: string;
  secret?: string;
    };

    const serverToken = process.env.ADMIN_ONBOARD_TOKEN;
    if (!serverToken) {
      return NextResponse.json({ error: 'Server onboarding token not configured' }, { status: 500 });
    }

    // Helper: verify if the request is authorized either by presenting the
    // static onboarding token (body.token) OR by supplying a valid admin JWT
    // in header (x-admin-onboard-token/x-admin-token) or cookie (v2u_admin_token).
    const jwtSecret = process.env.JWT_SECRET || 'default-secret-for-testing'

    let authorizedByStaticToken = false
    if (body.token && body.token === serverToken) authorizedByStaticToken = true

  let authorizedByJwt = false
  let jwtPayload: unknown = null

    const providedHeader = (request.headers.get('x-admin-onboard-token') || request.headers.get('x-admin-token'))
    if (providedHeader) {
      try {
        jwtPayload = jwt.verify(providedHeader, jwtSecret)
        authorizedByJwt = true
      } catch {
        // not a valid jwt in header
      }
    }

    if (!authorizedByJwt) {
      // try cookie
      try {
        const cookieHeader = request.headers.get('cookie') || ''
        const match = cookieHeader.match(/v2u_admin_token=([^;\s]+)/)
        if (match) {
          const token = match[1]
          try {
            jwtPayload = jwt.verify(token, jwtSecret)
            authorizedByJwt = true
          } catch {
            // invalid cookie token
          }
        }
      } catch {
        // ignore
      }
    }

    if (!authorizedByStaticToken && !authorizedByJwt) {
      return NextResponse.json({ error: 'Invalid onboarding token or not authenticated' }, { status: 401 });
    }

    const action = body.action || 'create';

    // If the request is authorized via JWT, ensure the caller has admin role
    if (authorizedByJwt) {
      // Narrow jwtPayload to an object to read role safely
      const payloadObj = jwtPayload && typeof jwtPayload === 'object' ? jwtPayload as Record<string, unknown> : null
      const roleVal = payloadObj ? String(payloadObj['role'] || '') : ''
      if (!roleVal || (roleVal !== 'admin' && roleVal !== 'superadmin')) {
        return NextResponse.json({ error: 'Insufficient privileges' }, { status: 403 })
      }
      // For convenience: if authorized by JWT, auto-fill body.token with serverToken
      // so downstream logic that expects token still works and audits show onboard usage
      body.token = serverToken
    }

    switch (action) {
      case 'create':
        if (!body.adminId) return NextResponse.json({ error: 'adminId required' }, { status: 400 });
        const role = body.role || 'admin';
        const created = await createAdminUser(body.adminId, role, body.secret);
        return NextResponse.json({ success: true, created });

      case 'get':
        if (!body.adminId) return NextResponse.json({ error: 'adminId required' }, { status: 400 });
        const entry = await getAdminEntry(body.adminId);
        return NextResponse.json({ success: true, entry });

      case 'revoke':
        if (!body.adminId) return NextResponse.json({ error: 'adminId required' }, { status: 400 });
        await revokeAdminUser(body.adminId);
        return NextResponse.json({ success: true, message: `Admin ${body.adminId} revoked` });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

  } catch (error) {
    console.error('Admin onboard API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
