import { NextRequest, NextResponse } from 'next/server';
import { kvStorage } from '@/lib/kv-storage';
import { getRecentYouTubeVideos } from '@/lib/social-platforms/youtube-checker';
import { postYouTubeToTwitter } from '@/lib/social-platforms/twitter-poster';
import { postYouTubeToLinkedIn } from '@/lib/social-platforms/linkedin-poster';
import { addLogEntry } from '@/lib/automation-logger';

export const runtime = 'nodejs';
export const maxDuration = 300; // Allow up to 5 minutes for backfill

/**
 * POST /api/automation/backfill
 * Checks for unposted videos from the last 7 days and posts them in chronological order
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Starting backfill check...');

    // Get Level 1 and Level 2 configurations
    const level1Config = await kvStorage.getLevel1Config();
    const level2Config = await kvStorage.getLevel2Config();

    const results = {
      checked: 0,
      found: [] as Array<{ id: string; title: string; publishedAt: string }>,
      posted: [] as Array<{ videoId: string; platform: string; success: boolean; error?: string }>,
      skipped: [] as Array<{ id: string; title: string; reason: string }>,
      errors: [] as string[]
    };

    // Check YouTube for recent unposted videos
    const youtubeConfig = level1Config.youtube;
    if (youtubeConfig?.configured) {
      console.log('📺 Checking YouTube for unposted videos from the last 7 days...');
      
      try {
        const recentVideos = await getRecentYouTubeVideos(
          {
            apiKey: youtubeConfig.credentials.apiKey || '',
            channelId: youtubeConfig.credentials.channelId || ''
          },
          30, // Get up to 30 recent videos
          7   // From last 7 days
        );

        console.log(`Found ${recentVideos.length} videos from the last 7 days`);
        results.checked = recentVideos.length;

        // Find unposted videos
        const unpostedVideos = [];
        for (const video of recentVideos) {
          const postedInfo = await kvStorage.getPostedVideoInfo(video.id);
          if (!postedInfo) {
            unpostedVideos.push(video);
            results.found.push({
              id: video.id,
              title: video.title,
              publishedAt: video.publishedAt
            });
          }
        }

        console.log(`Found ${unpostedVideos.length} unposted videos`);

        // Post each unposted video (oldest first, already sorted)
        for (const video of unpostedVideos) {
          console.log(`\n📤 Posting video: ${video.title} (${video.publishedAt})`);
          
          const targetPlatforms = ['twitter', 'twitter-ainow', 'linkedin']; // YouTube content targets
          let successCount = 0;

          for (const [l2Id, l2Config] of Object.entries(level2Config)) {
            // Skip if not enabled, not configured, or not in target list
            if (!l2Config.enabled || !l2Config.configured) continue;
            if (!targetPlatforms.includes(l2Id)) continue;

            try {
              if (l2Id === 'twitter' || l2Id === 'twitter-ainow') {
                const accountName = l2Id === 'twitter-ainow' ? '@AI_Now_v2u' : '@V2U_now';
                const accountType = l2Id === 'twitter-ainow' ? 'ainow' : 'v2u';
                console.log(`  Posting to Twitter (${accountName})...`);
                
                const result = await postYouTubeToTwitter(
                  {
                    appKey: l2Config.credentials.appKey || '',
                    appSecret: l2Config.credentials.appSecret || '',
                    accessToken: l2Config.credentials.accessToken || '',
                    accessSecret: l2Config.credentials.accessSecret || ''
                  },
                  {
                    title: video.title,
                    url: video.url,
                    thumbnailUrl: video.thumbnailUrl
                  },
                  accountType as 'v2u' | 'ainow'
                );
                
                results.posted.push({
                  videoId: video.id,
                  platform: l2Id,
                  success: true
                });
                
                console.log(`  ✅ Posted to ${accountName}: ${result.url}`);
                successCount++;
                
                // Log successful post
                await addLogEntry({
                  type: 'backfill',
                  level: 'success',
                  message: `Backfilled YouTube content to ${l2Id}`,
                  details: {
                    source: 'youtube',
                    platform: l2Id,
                    videoId: video.id,
                    postUrl: result.url,
                    title: video.title,
                    publishedAt: video.publishedAt
                  }
                });

                // Save post result
                await kvStorage.savePostResult(l2Id, {
                  success: true,
                  postUrl: result.url,
                  timestamp: new Date().toISOString()
                });

              } else if (l2Id === 'linkedin') {
                console.log(`  Posting to LinkedIn...`);
                
                const result = await postYouTubeToLinkedIn(
                  {
                    accessToken: l2Config.credentials.accessToken || ''
                  },
                  {
                    title: video.title,
                    url: video.url,
                    thumbnailUrl: video.thumbnailUrl
                  }
                );
                
                results.posted.push({
                  videoId: video.id,
                  platform: l2Id,
                  success: true
                });
                
                console.log(`  ✅ Posted to LinkedIn: ${result.url}`);
                successCount++;
                
                // Log successful post
                await addLogEntry({
                  type: 'backfill',
                  level: 'success',
                  message: `Backfilled YouTube content to ${l2Id}`,
                  details: {
                    source: 'youtube',
                    platform: l2Id,
                    videoId: video.id,
                    postUrl: result.url,
                    title: video.title,
                    publishedAt: video.publishedAt
                  }
                });

                // Save post result
                await kvStorage.savePostResult(l2Id, {
                  success: true,
                  postUrl: result.url,
                  timestamp: new Date().toISOString()
                });
              }

              // Add small delay between posts to avoid rate limiting
              await new Promise(resolve => setTimeout(resolve, 2000));

            } catch (err) {
              const errorMsg = err instanceof Error ? err.message : String(err);
              console.error(`  ❌ Error posting to ${l2Id}:`, errorMsg);
              
              results.posted.push({
                videoId: video.id,
                platform: l2Id,
                success: false,
                error: errorMsg
              });
              
              results.errors.push(`${video.title} -> ${l2Id}: ${errorMsg}`);
              
              // Log failed post
              await addLogEntry({
                type: 'backfill',
                level: 'error',
                message: `Failed to backfill YouTube content to ${l2Id}`,
                details: {
                  source: 'youtube',
                  platform: l2Id,
                  videoId: video.id,
                  error: errorMsg,
                  title: video.title,
                  publishedAt: video.publishedAt
                }
              });
            }
          }

          // Mark video as posted if at least one platform succeeded
          if (successCount > 0) {
            await kvStorage.markVideoAsPosted(video.id);
            console.log(`  ✅ Marked video ${video.id} as posted (${successCount} platforms succeeded)`);
          } else {
            console.log(`  ⚠️ Not marking video ${video.id} as posted - all platforms failed`);
          }
        }

      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        console.error('Error during YouTube backfill:', errorMsg);
        results.errors.push(`YouTube backfill error: ${errorMsg}`);
      }
    } else {
      console.log('YouTube not configured, skipping backfill');
    }

    console.log('\n✅ Backfill complete!');
    console.log(`Checked: ${results.checked} videos`);
    console.log(`Found unposted: ${results.found.length} videos`);
    console.log(`Posted: ${results.posted.filter(p => p.success).length} times`);
    console.log(`Failed: ${results.posted.filter(p => !p.success).length} times`);

    return NextResponse.json({
      success: true,
      summary: {
        checked: results.checked,
        foundUnposted: results.found.length,
        posted: results.posted.filter(p => p.success).length,
        failed: results.posted.filter(p => !p.success).length
      },
      details: results
    });

  } catch (error) {
    console.error('Backfill error:', error);
    const errorMsg = error instanceof Error ? error.message : String(error);
    
    return NextResponse.json({
      success: false,
      error: errorMsg
    }, { status: 500 });
  }
}
