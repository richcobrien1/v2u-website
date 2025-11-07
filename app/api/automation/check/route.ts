import { NextRequest, NextResponse } from 'next/server';
import { kvStorage } from '@/lib/kv-storage';
import { getLatestYouTubeVideo, isVideoRecent } from '@/lib/social-platforms/youtube-checker';
import { postYouTubeToTwitter } from '@/lib/social-platforms/twitter-poster';

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
        // YouTube Check
        if (platformId === 'youtube') {
          const latestVideo = await getLatestYouTubeVideo({
            apiKey: config.credentials.apiKey || '',
            channelId: config.credentials.channelId || ''
          });

          if (latestVideo && isVideoRecent(latestVideo.publishedAt, 6)) {
            // Check if we've already posted about this video
            const alreadyPosted = await kvStorage.hasPostedVideo(latestVideo.id);
            
            if (!alreadyPosted) {
              console.log(`📺 New YouTube video found: ${latestVideo.title}`);
              results.newContent.push(`youtube:${latestVideo.id}`);

              // Post to enabled Level 2 platforms
              for (const [l2Id, l2Config] of Object.entries(level2Config)) {
                if (!l2Config.enabled || !l2Config.configured) continue;

                try {
                  if (l2Id === 'twitter') {
                    console.log('Posting to Twitter...');
                    const tweetId = await postYouTubeToTwitter(
                      {
                        appKey: l2Config.credentials.appKey || '',
                        appSecret: l2Config.credentials.appSecret || '',
                        accessToken: l2Config.credentials.accessToken || '',
                        accessSecret: l2Config.credentials.accessSecret || ''
                      },
                      {
                        title: latestVideo.title,
                        url: latestVideo.url,
                        thumbnailUrl: latestVideo.thumbnailUrl
                      }
                    );
                    results.posted.push(`twitter:${tweetId}`);
                    console.log(`✅ Posted to Twitter: ${tweetId}`);
                  }
                } catch (err) {
                  console.error(`Error posting to ${l2Id}:`, err);
                  results.errors.push(`${l2Id}: ${err instanceof Error ? err.message : String(err)}`);
                }
              }

              // Mark video as posted
              await kvStorage.markVideoAsPosted(latestVideo.id);
            } else {
              console.log(`Already posted about video: ${latestVideo.id}`);
            }
          } else {
            console.log('No new YouTube videos in the last 2 hours');
          }
        }

        // TODO: Add Rumble and Spotify checks here
        
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
