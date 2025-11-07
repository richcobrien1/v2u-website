import { NextRequest, NextResponse } from 'next/server';
import { kvStorage } from '@/lib/kv-storage';

export const runtime = 'nodejs';
export const maxDuration = 60; // Allow up to 60 seconds for this function

/**
 * GET /api/automation/check
 * This endpoint is called every hour by Vercel Cron
 * It checks Level 1 platforms for new content and posts to Level 2 platforms
 */
export async function GET(request: NextRequest) {
  try {
    // Verify authorization (cron secret or admin token)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET || 'change-me-in-production';
    
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if automation is running
    const status = await kvStorage.getStatus();
    if (!status?.running) {
      console.log('Automation is stopped, skipping check');
      return NextResponse.json({ 
        message: 'Automation is stopped',
        running: false
      });
    }

    console.log('🔄 Starting hourly automation check...');

    // Get Level 1 and Level 2 configurations
    const level1Config = await kvStorage.getLevel1Config();
    const level2Config = await kvStorage.getLevel2Config();

    const results = {
      timestamp: new Date().toISOString(),
      checked: [] as string[],
      newContent: [] as string[],
      posted: [] as string[],
      errors: [] as string[]
    };

    // Check each Level 1 platform for new content
    for (const [platformId, config] of Object.entries(level1Config)) {
      if (!config.configured) {
        console.log(`Skipping ${platformId} - not configured`);
        continue;
      }

      results.checked.push(platformId);
      console.log(`Checking ${platformId} for new content...`);

      try {
        // TODO: Implement actual platform checks
        // For now, just log that we would check
        console.log(`Would check ${platformId} for new videos/episodes`);
        
        // Placeholder: Check for new content
        // const newContent = await checkPlatform(platformId, config.credentials);
        // if (newContent) {
        //   results.newContent.push(platformId);
        //   await postToLevel2Platforms(newContent, level2Config);
        // }
      } catch (err) {
        console.error(`Error checking ${platformId}:`, err);
        results.errors.push(`${platformId}: ${err instanceof Error ? err.message : String(err)}`);
      }
    }

    // Update status
    const newStatus = {
      running: true,
      lastCheck: new Date().toISOString(),
      nextCheck: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      checksToday: (status?.checksToday || 0) + 1
    };
    await kvStorage.saveStatus(newStatus);

    console.log('✅ Automation check complete:', results);

    return NextResponse.json({
      success: true,
      results,
      nextCheck: newStatus.nextCheck
    });

  } catch (error) {
    console.error('❌ Automation check failed:', error);
    return NextResponse.json(
      { 
        error: 'Automation check failed',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
