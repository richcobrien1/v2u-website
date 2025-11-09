import { NextRequest, NextResponse } from 'next/server';
import { kvStorage } from '@/lib/kv-storage';
import { postYouTubeToTwitter } from '@/lib/social-platforms/twitter-poster';
import { postYouTubeToLinkedIn } from '@/lib/social-platforms/linkedin-poster';
import { postContentToFacebook } from '@/lib/social-platforms/facebook-poster';
import { sendFailureAlert } from '@/lib/notifications/email-alerts';

export const runtime = 'nodejs';
export const maxDuration = 60;

interface PostedResult {
  platform: string;
  postId: string;
  url: string;
}

/**
 * Retry operation with exponential backoff
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
        delayMs *= 2;
      }
    }
  }
  
  throw lastError;
}

/**
 * Platform routing logic
 */
function getTargetPlatforms(sourceId: string): string[] {
  if (sourceId === 'youtube' || sourceId === 'rumble') {
    return ['twitter', 'twitter-ainow', 'linkedin'];
  }
  
  if (sourceId === 'spotify') {
    return ['twitter', 'twitter-ainow', 'facebook', 'facebook-ainow', 'threads'];
  }
  
  return [];
}

/**
 * POST /api/automation/manual-post
 * Manually trigger posting to all Level 2 platforms for testing
 * 
 * Body:
 * {
 *   "videoId": "abc123",
 *   "title": "Video Title",
 *   "url": "https://youtube.com/watch?v=abc123",
 *   "thumbnailUrl": "https://...",
 *   "source": "youtube" | "spotify" | "rumble",
 *   "skipDuplicateCheck": true  // Optional: post even if already posted
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
      videoId: string;
      title: string;
      url: string;
      thumbnailUrl?: string;
      source?: string;
      skipDuplicateCheck?: boolean;
    };
    
    const { 
      videoId, 
      title, 
      url, 
      thumbnailUrl = '', 
      source = 'youtube',
      skipDuplicateCheck = false 
    } = body;

    if (!videoId || !title || !url) {
      return NextResponse.json(
        { error: 'Missing required fields: videoId, title, url' },
        { status: 400 }
      );
    }

    // Check if already posted (unless skipped)
    if (!skipDuplicateCheck) {
      const alreadyPosted = await kvStorage.hasPostedVideo(videoId);
      if (alreadyPosted) {
        return NextResponse.json(
          { 
            error: 'Video already posted. Use skipDuplicateCheck: true to post anyway',
            videoId 
          },
          { status: 400 }
        );
      }
    }

    console.log(`📤 Manual posting triggered for: ${title}`);
    console.log(`Source: ${source}, URL: ${url}`);

    // Get Level 2 configuration
    const level2Config = await kvStorage.getLevel2Config();

    // Get target platforms based on source
    const targetPlatforms = getTargetPlatforms(source);
    console.log(`Posting to target platforms: ${targetPlatforms.join(', ')}`);

    const results = {
      videoId,
      title,
      url,
      source,
      posted: [] as PostedResult[],
      errors: [] as string[]
    };

    // Track failures for email alert
    const postingFailures: { platform: string; error: string }[] = [];
    const postingSuccesses: string[] = [];

    // Post to enabled Level 2 platforms
    for (const [l2Id, l2Config] of Object.entries(level2Config)) {
      // Skip if not enabled, not configured, or not in target list
      if (!l2Config.enabled || !l2Config.configured) {
        console.log(`Skipping ${l2Id} - not enabled or configured`);
        continue;
      }
      
      if (targetPlatforms.length > 0 && !targetPlatforms.includes(l2Id)) {
        console.log(`Skipping ${l2Id} - not a target for ${source} content`);
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
                title,
                url,
                thumbnailUrl
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
                title,
                url,
                thumbnailUrl
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
                accessToken: l2Config.credentials.accessToken || ''
              },
              {
                title,
                url,
                thumbnailUrl
              },
              source === 'spotify' // Is Spotify content
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

    // Mark video as posted
    await kvStorage.markVideoAsPosted(videoId);

    // Send email alert if there were any failures
    if (postingFailures.length > 0) {
      await sendFailureAlert({
        timestamp: new Date().toISOString(),
        contentTitle: title,
        contentUrl: url,
        contentSource: source,
        failures: postingFailures,
        successes: postingSuccesses,
      });
    }

    console.log('✅ Manual posting complete:', results);

    return NextResponse.json({
      success: true,
      results,
      successCount: postingSuccesses.length,
      failureCount: postingFailures.length,
      message: `Posted to ${postingSuccesses.length} platforms${postingFailures.length > 0 ? `, ${postingFailures.length} failed` : ''}`
    });

  } catch (error) {
    console.error('❌ Manual posting failed:', error);
    return NextResponse.json(
      { 
        error: 'Manual posting failed',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
