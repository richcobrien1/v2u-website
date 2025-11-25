import { NextRequest, NextResponse } from 'next/server';
import { kvStorage } from '@/lib/kv-storage';

export const runtime = 'nodejs';

/**
 * GET /api/admin/level1-config
 * Get current Level 1 configuration
 */
export async function GET(request: NextRequest) {
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
    const body = await request.json();
    const { platform, config } = body;

    if (!platform || !config) {
      return NextResponse.json(
        { success: false, error: 'Missing platform or config' },
        { status: 400 }
      );
    }

    // Get current config
    const currentConfig = await kvStorage.getLevel1Config();
    
    // Update specific platform
    currentConfig[platform] = {
      ...currentConfig[platform],
      ...config,
      configured: true
    };

    // Save back to KV
    await kvStorage.saveLevel1Config(currentConfig);

    return NextResponse.json({ 
      success: true,
      message: `Updated ${platform} configuration`,
      config: currentConfig[platform]
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
