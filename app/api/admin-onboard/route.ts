import { NextRequest, NextResponse } from 'next/server';
import { createAdminUser, getAdminEntry, revokeAdminUser } from '@/lib/kv-client';

// Server-side onboarding token must be set in env: ADMIN_ONBOARD_TOKEN
// POST /api/admin-onboard
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
      token?: string;
      action?: 'create' | 'get' | 'revoke';
      adminId?: string;
      role?: string;
    };

    const serverToken = process.env.ADMIN_ONBOARD_TOKEN;
    if (!serverToken) {
      return NextResponse.json({ error: 'Server onboarding token not configured' }, { status: 500 });
    }

    if (!body.token || body.token !== serverToken) {
      return NextResponse.json({ error: 'Invalid onboarding token' }, { status: 401 });
    }

    const action = body.action || 'create';

    switch (action) {
      case 'create':
        if (!body.adminId) return NextResponse.json({ error: 'adminId required' }, { status: 400 });
        const role = body.role || 'admin';
        const created = await createAdminUser(body.adminId, role);
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
