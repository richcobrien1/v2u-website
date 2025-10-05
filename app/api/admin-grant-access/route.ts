import { NextRequest, NextResponse } from 'next/server';
import { grantAccess, getCustomerSecret } from '@/lib/kv-client';

// POST /api/admin-grant-access
// Body: { token: string, customerId: string, subscriptionId?: string }
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { token?: string; customerId?: string; subscriptionId?: string };

    const serverToken = process.env.ADMIN_ONBOARD_TOKEN;
    if (!serverToken) {
      return NextResponse.json({ error: 'Server onboarding token not configured' }, { status: 500 });
    }

    if (!body.token || body.token !== serverToken) {
      return NextResponse.json({ error: 'Invalid onboarding token' }, { status: 401 });
    }

    if (!body.customerId) {
      return NextResponse.json({ error: 'customerId required' }, { status: 400 });
    }

    const subscriptionId = body.subscriptionId || '';

    await grantAccess(body.customerId, subscriptionId);
    const secret = await getCustomerSecret(body.customerId);

    return NextResponse.json({ success: true, customerId: body.customerId, secret });
  } catch (error) {
    console.error('Admin grant-access API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
