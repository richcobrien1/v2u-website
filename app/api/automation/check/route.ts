import { NextRequest, NextResponse } from 'next/server';
import { kvStorage } from '@/lib/kv-storage';
import { getLatestYouTubeVideo, isVideoRecent } from '@/lib/social-platforms/youtube-checker';
import { postYouTubeToTwitter } from '@/lib/social-platforms/twitter-poster';
import { postYouTubeToLinkedIn } from '@/lib/social-platforms/linkedin-poster';
import { postContentToFacebook } from '@/lib/social-platforms/facebook-poster';
import { sendFailureAlert } from '@/lib/notifications/email-alerts';

export const runtime = 'nodejs';
export const maxDuration = 60; // Allow up to 60 seconds for this function

interface PostedResult {
  platform: string;
  postId: string;
  url: string;
}

/**
 * Retry a failed operation with exponential backoff
 */
async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 2,
  delayMs: number = 1000
): Promise<T> {
  let lastError: Error | undefined;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (attempt < maxRetries) {
        console.log(`⏳ Retry attempt ${attempt + 1}/${maxRetries} after ${delayMs}ms...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
        delayMs *= 2; // Exponential backoff
      }
    }
  }
  
  throw lastError;
}

/**
 * Platform routing logic based on content type:
 * 
 * Desktop/Landscape (YouTube, Rumble):
 *   → Twitter (both accounts), LinkedIn
 * 
 * Mobile/Portrait (Spotify):
 *   → Twitter (both accounts), Facebook (both accounts), Threads
 */
function getTargetPlatforms(sourceId: string): string[] {
  if (sourceId === 'youtube' || sourceId === 'rumble') {
    // Desktop/Landscape content → Twitter + LinkedIn
    return ['twitter', 'twitter-ainow', 'linkedin'];
  }
  
  if (sourceId === 'spotify') {
    // Mobile/Portrait content → Twitter + Facebook + Threads
    return ['twitter', 'twitter-ainow', 'facebook', 'facebook-ainow', 'threads'];
  }
  
  // Default: post to all enabled platforms
  return [];
}

/**
 * GET /api/automation/check
 * This endpoint is called every hour by Vercel Cron
 * It checks Level 1 platforms for new content and posts to Level 2 platforms
 */
export async function GET(request: NextRequest) {
  try {
    // Verify authorization (Vercel Cron or admin token)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET || 'change-me-in-production';
    
    // Check for Vercel Cron secret (sent in Authorization header by Vercel)
    const isVercelCron = authHeader === `Bearer ${cronSecret}`;
    
    // Check for Vercel's internal cron identifier
    const isCronJob = request.headers.get('user-agent')?.includes('vercel-cron');
    
    if (!isVercelCron && !isCronJob) {
      console.log('⚠️ Unauthorized cron attempt', { 
        authHeader: authHeader ? 'present' : 'missing',
        userAgent: request.headers.get('user-agent')
      });
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
      posted: [] as PostedResult[],
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

          if (latestVideo && isVideoRecent(latestVideo.publishedAt, 24)) {
            // Check if we've already posted about this video
            const alreadyPosted = await kvStorage.hasPostedVideo(latestVideo.id);
            
            if (!alreadyPosted) {
              console.log(`📺 New YouTube video found: ${latestVideo.title}`);
              results.newContent.push(`youtube:${latestVideo.id}`);

              // Get target platforms for YouTube (landscape content)
              const targetPlatforms = getTargetPlatforms('youtube');
              console.log(`Posting to target platforms: ${targetPlatforms.join(', ')}`);

              // Track failures for email alert
              const postingFailures: { platform: string; error: string }[] = [];
              const postingSuccesses: string[] = [];

              // Post to enabled Level 2 platforms
              for (const [l2Id, l2Config] of Object.entries(level2Config)) {
                // Skip if not enabled, not configured, or not in target list
                if (!l2Config.enabled || !l2Config.configured) continue;
                if (targetPlatforms.length > 0 && !targetPlatforms.includes(l2Id)) {
                  console.log(`Skipping ${l2Id} - not a target for YouTube content`);
                  continue;
                }

                try {
                  // Wrap posting in retry logic
                  await retryOperation(async () => {
                    if (l2Id === 'twitter' || l2Id === 'twitter-ainow') {
                      const accountName = l2Id === 'twitter-ainow' ? '@AI_Now_v2u' : '@V2U_now';
                      const accountType = l2Id === 'twitter-ainow' ? 'ainow' : 'v2u';
                      console.log(`Posting to Twitter (${accountName})...`);
                      const result = await postYouTubeToTwitter(
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
                        },
                        accountType as 'v2u' | 'ainow'
                      );
                      results.posted.push({
                        platform: l2Id,
                        postId: result.id,
                        url: result.url
                      });
                      console.log(`✅ Posted to ${accountName}: ${result.id}`);
                      console.log(`🔗 View at: ${result.url}`);
                    } else if (l2Id === 'linkedin') {
                      console.log(`Posting to LinkedIn...`);
                      const result = await postYouTubeToLinkedIn(
                        {
                          accessToken: l2Config.credentials.accessToken || ''
                        },
                        {
                          title: latestVideo.title,
                          url: latestVideo.url,
                          thumbnailUrl: latestVideo.thumbnailUrl
                        }
                      );
                      results.posted.push({
                        platform: l2Id,
                        postId: result.id,
                        url: result.url
                      });
                      console.log(`✅ Posted to LinkedIn: ${result.id}`);
                      console.log(`🔗 View at: ${result.url}`);
                    } else if (l2Id === 'facebook' || l2Id === 'facebook-ainow') {
                      const accountName = l2Id === 'facebook-ainow' ? 'AI Now' : 'V2U';
                      console.log(`Posting to Facebook (${accountName})...`);
                      const result = await postContentToFacebook(
                        {
                          pageId: l2Config.credentials.pageId || '',
                          accessToken: l2Config.credentials.pageAccessToken || l2Config.credentials.accessToken || ''
                        },
                        {
                          title: latestVideo.title,
                          url: latestVideo.url,
                          thumbnailUrl: latestVideo.thumbnailUrl
                        },
                        false // Not Spotify content
                      );
                      results.posted.push({
                        platform: l2Id,
                        postId: result.id,
                        url: result.url
                      });
                      console.log(`✅ Posted to Facebook ${accountName}: ${result.id}`);
                      console.log(`🔗 View at: ${result.url}`);
                    }
                  }, 2); // Retry up to 2 times
                  
                  postingSuccesses.push(l2Id);
                } catch (err) {
                  const errorMsg = err instanceof Error ? err.message : String(err);
                  console.error(`❌ Error posting to ${l2Id} (after retries):`, errorMsg);
                  results.errors.push(`${l2Id}: ${errorMsg}`);
                  postingFailures.push({ platform: l2Id, error: errorMsg });
                }
              }

              // Send email alert if there were any failures
              if (postingFailures.length > 0) {
                await sendFailureAlert({
                  timestamp: new Date().toISOString(),
                  contentTitle: latestVideo.title,
                  contentUrl: latestVideo.url,
                  contentSource: 'youtube',
                  failures: postingFailures,
                  successes: postingSuccesses,
                });
              }

              // Only mark video as posted if at least one platform succeeded
              if (postingSuccesses.length > 0) {
                await kvStorage.markVideoAsPosted(latestVideo.id);
                console.log(`✅ Marked video ${latestVideo.id} as posted (${postingSuccesses.length} platforms succeeded)`);
              } else {
                console.log(`⚠️ Not marking video ${latestVideo.id} as posted - all platforms failed, will retry next check`);
              }
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
