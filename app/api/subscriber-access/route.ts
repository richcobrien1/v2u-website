import { NextRequest, NextResponse } from 'next/server';
import { grantAccess, revokeAccess, checkAccess } from '@/lib/kv-client';

// API endpoint for testing subscriber access management
// POST /api/subscriber-access

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
      action: 'grant' | 'revoke' | 'check';
      customerId?: string;
      subscriptionId?: string;
    };
    
    const { action, customerId, subscriptionId } = body;

    switch (action) {
      case 'grant':
        if (!customerId || !subscriptionId) {
          return NextResponse.json(
            { error: 'customerId and subscriptionId required for grant action' },
            { status: 400 }
          );
        }
        await grantAccess(customerId, subscriptionId);
        return NextResponse.json({
          success: true,
          message: `Access granted for customer ${customerId}`,
          customerId,
          subscriptionId
        });

      case 'revoke':
        if (!customerId) {
          return NextResponse.json(
            { error: 'customerId required for revoke action' },
            { status: 400 }
          );
        }
        await revokeAccess(customerId);
        return NextResponse.json({
          success: true,
          message: `Access revoked for customer ${customerId}`,
          customerId
        });

      case 'check':
        if (!customerId) {
          return NextResponse.json(
            { error: 'customerId required for check action' },
            { status: 400 }
          );
        }
        const hasAccess = await checkAccess(customerId);
        return NextResponse.json({
          success: true,
          customerId,
          hasAccess,
          message: hasAccess ? 'Customer has access' : 'Customer does not have access'
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: grant, revoke, or check' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Subscriber access API error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET endpoint to check access
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');

    if (!customerId) {
      return NextResponse.json(
        { error: 'customerId query parameter required' },
        { status: 400 }
      );
    }

    const hasAccess = await checkAccess(customerId);
    
    return NextResponse.json({
      success: true,
      customerId,
      hasAccess,
      message: hasAccess ? 'Customer has access' : 'Customer does not have access'
    });

  } catch (error) {
    console.error('Subscriber access check error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}