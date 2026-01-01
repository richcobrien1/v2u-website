/**
 * Test script for automation logging system
 * Creates sample log entries to verify the logging infrastructure works
 */

import { addLogEntry, getRecentLogs, getLogsSummary } from '../lib/automation-logger.js';

async function main() {
  console.log('🧪 Testing Automation Logger...\n');
  
  try {
    // Test 1: Add a successful post log
    console.log('Test 1: Adding successful post log...');
    await addLogEntry({
      type: 'manual',
      level: 'success',
      message: 'Test post to Twitter',
      details: {
        source: 'youtube',
        platform: 'twitter',
        videoId: 'test123',
        postUrl: 'https://twitter.com/test/status/123',
        title: 'Test YouTube Video Title',
        duration: 1500
      }
    });
    console.log('✅ Success log added\n');

    // Test 2: Add a failed post log
    console.log('Test 2: Adding failed post log...');
    await addLogEntry({
      type: 'check',
      level: 'error',
      message: 'Failed to post to LinkedIn',
      details: {
        source: 'rumble',
        platform: 'linkedin',
        videoId: 'test456',
        error: 'Invalid access token',
        title: 'Test Rumble Video'
      }
    });
    console.log('✅ Error log added\n');

    // Test 3: Add check execution log
    console.log('Test 3: Adding check execution log...');
    await addLogEntry({
      type: 'check',
      level: 'info',
      message: 'Automation check started',
      details: {
        trigger: 'cron',
        userAgent: 'test-script'
      }
    });
    console.log('✅ Check log added\n');

    // Test 4: Add multiple successful posts
    console.log('Test 4: Adding multiple successful posts...');
    const platforms = ['facebook', 'facebook-ainow', 'twitter-ainow'];
    for (const platform of platforms) {
      await addLogEntry({
        type: 'post-latest',
        level: 'success',
        message: `Posted Spotify content to ${platform}`,
        details: {
          source: 'spotify',
          platform: platform,
          title: 'AI-Now Podcast Episode #42',
          postUrl: `https://example.com/${platform}/post123`
        }
      });
    }
    console.log(`✅ Added ${platforms.length} more successful posts\n`);

    // Test 5: Retrieve recent logs
    console.log('Test 5: Retrieving recent logs...');
    const logs = await getRecentLogs(7);
    console.log(`✅ Retrieved ${logs.length} days of logs`);
    
    if (logs.length > 0) {
      const today = logs[0];
      console.log(`   Today's entries: ${today.entries.length}`);
      console.log(`   Total executions: ${today.summary.totalExecutions}`);
      console.log(`   Successful posts: ${today.summary.successfulPosts}`);
      console.log(`   Failed posts: ${today.summary.failedPosts}`);
    }
    console.log('');

    // Test 6: Get summary
    console.log('Test 6: Getting logs summary...');
    const summary = await getLogsSummary();
    console.log('✅ Summary retrieved:');
    console.log(`   Total days: ${summary.totalDays}`);
    console.log(`   Total executions: ${summary.totalExecutions}`);
    console.log(`   Success rate: ${summary.successRate}%`);
    console.log(`   Platforms tracked: ${Object.keys(summary.platformStats).length}`);
    
    if (Object.keys(summary.platformStats).length > 0) {
      console.log('\n   Platform breakdown:');
      for (const [platform, stats] of Object.entries(summary.platformStats)) {
        console.log(`     ${platform}: ${stats.success} ✓, ${stats.failed} ✗ (${stats.rate}%)`);
      }
    }
    console.log('');

    console.log('🎉 All tests completed successfully!\n');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

main();
