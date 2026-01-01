import { NextResponse } from 'next/server';
import { addLogEntry, getRecentLogs } from '@/lib/automation-logger';

export const runtime = 'nodejs';

/**
 * POST /api/automation/logs/test
 * Add test log entries to verify the logging system works
 */
export async function POST() {
  try {
    console.log('🧪 Creating test log entries...');

    // Test 1: Successful YouTube → Twitter post
    await addLogEntry({
      type: 'check',
      level: 'success',
      message: 'Posted YouTube content to twitter',
      details: {
        source: 'youtube',
        platform: 'twitter',
        videoId: 'dQw4w9WgXcQ',
        postUrl: 'https://twitter.com/V2U_now/status/1234567890',
        title: 'Test YouTube Video - AI Automation Demo',
        duration: 1245
      }
    });
    
    // Test 2: Successful YouTube → LinkedIn post
    await addLogEntry({
      type: 'check',
      level: 'success',
      message: 'Posted YouTube content to linkedin',
      details: {
        source: 'youtube',
        platform: 'linkedin',
        videoId: 'dQw4w9WgXcQ',
        postUrl: 'https://www.linkedin.com/feed/update/urn:li:share:1234567890',
        title: 'Test YouTube Video - AI Automation Demo',
        duration: 1450
      }
    });

    // Test 3: Failed Facebook post
    await addLogEntry({
      type: 'check',
      level: 'error',
      message: 'Failed to post YouTube content to facebook',
      details: {
        source: 'youtube',
        platform: 'facebook',
        videoId: 'dQw4w9WgXcQ',
        error: 'Invalid page access token - token expired',
        title: 'Test YouTube Video - AI Automation Demo'
      }
    });

    // Test 4: Successful Spotify → Facebook posts
    await addLogEntry({
      type: 'post-latest',
      level: 'success',
      message: 'Posted Spotify content to facebook',
      details: {
        source: 'spotify',
        platform: 'facebook',
        title: 'AI-Now Podcast Episode #42: The Future of Automation',
        postUrl: 'https://www.facebook.com/v2u.us/posts/123456789',
        duration: 2100
      }
    });

    await addLogEntry({
      type: 'post-latest',
      level: 'success',
      message: 'Posted Spotify content to facebook-ainow',
      details: {
        source: 'spotify',
        platform: 'facebook-ainow',
        title: 'AI-Now Podcast Episode #42: The Future of Automation',
        postUrl: 'https://www.facebook.com/ainow/posts/987654321',
        duration: 1950
      }
    });

    // Test 5: Successful Rumble → Twitter post
    await addLogEntry({
      type: 'check',
      level: 'success',
      message: 'Posted Rumble content to twitter-ainow',
      details: {
        source: 'rumble',
        platform: 'twitter-ainow',
        videoId: 'v3xyz123',
        postUrl: 'https://twitter.com/AI_Now_v2u/status/9876543210',
        title: 'Breaking: AI Developments in 2026',
        duration: 1680
      }
    });

    // Test 6: Check execution log
    await addLogEntry({
      type: 'check',
      level: 'info',
      message: 'Automation check started',
      details: {
        trigger: 'manual-test',
        userAgent: 'test-script',
        checked: 3,
        newContent: 2,
        posted: 5,
        errors: 1
      }
    });

    // Test 7: Failed LinkedIn post
    await addLogEntry({
      type: 'manual',
      level: 'error',
      message: 'Failed to post Rumble content to linkedin',
      details: {
        source: 'rumble',
        platform: 'linkedin',
        videoId: 'v3xyz123',
        error: 'Rate limit exceeded - try again in 15 minutes',
        title: 'Breaking: AI Developments in 2026'
      }
    });

    console.log('✅ Test logs created successfully');

    // Retrieve logs to verify
    const logs = await getRecentLogs(1);
    
    return NextResponse.json({
      success: true,
      message: 'Test logs created successfully',
      todayEntries: logs[0]?.entries.length || 0,
      summary: logs[0]?.summary
    });
    
  } catch (error) {
    console.error('❌ Failed to create test logs:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create test logs',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

/**
 * GET /api/automation/logs/test
 * Check if test logs exist
 */
export async function GET() {
  try {
    const logs = await getRecentLogs(1);
    
    return NextResponse.json({
      success: true,
      hasLogs: logs.length > 0,
      todayEntries: logs[0]?.entries.length || 0,
      summary: logs[0]?.summary
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to check logs',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
