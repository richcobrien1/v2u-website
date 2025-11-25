import { NextRequest, NextResponse } from 'next/server';
import { kvStorage } from '@/lib/kv-storage';

export const runtime = 'nodejs';

/**
 * GET /api/admin/level1-config
 * Get current Level 1 configuration
 */
export async function GET() {
  try {
    const config = await kvStorage.getLevel1Config();
    return NextResponse.json({ success: true, config });
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to get config',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/level1-config
 * Update Level 1 platform configuration
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
      platform: string;
      config: {
        enabled?: boolean;
        configured?: boolean;
        credentials?: Record<string, string>;
      };
    };
    const { platform, config } = body;

    if (!platform || !config) {
      return NextResponse.json(
        { success: false, error: 'Missing platform or config' },
        { status: 400 }
      );
    }

    // Save credentials to KV storage
    await kvStorage.saveCredentials(
      1, // Level 1 (content sources)
      platform,
      config.credentials || {},
      config.enabled ?? true,
      config.configured ?? true
    );

    return NextResponse.json({ 
      success: true,
      message: `Updated ${platform} configuration`,
      platform,
      config
    });
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update config',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
