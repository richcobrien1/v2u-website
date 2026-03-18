import { NextRequest, NextResponse } from 'next/server';
import { kvStorage } from '@/lib/kv-storage';
import { postYouTubeToTwitter } from '@/lib/social-platforms/twitter-poster';
import { postYouTubeToLinkedIn } from '@/lib/social-platforms/linkedin-poster';
import { postContentToFacebook } from '@/lib/social-platforms/facebook-poster';
import { addLogEntry } from '@/lib/automation-logger';

export const runtime = 'nodejs';
export const maxDuration = 60;

const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY_HOURS = 2; // Wait 2 hours between retries

interface RetryResult {
  platform: string;
  contentId: string;
  success: boolean;
  removed: boolean; // true if removed from queue (either success or max retries)
  error?: string;
  postUrl?: string;
}

/**
 * Calculate next retry time with exponential backoff
 */
function calculateNextRetry(retryCount: number): string {
  const hours = RETRY_DELAY_HOURS * Math.pow(2, retryCount); // 2h, 4h, 8h
  const nextRetry = new Date(Date.now() + hours * 60 * 60 * 1000);
  return nextRetry.toISOString();
}

/**
 * POST /api/automation/retry-failed
 * Retry all failed posts in the queue that are due for retry
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    console.log('🔄 Starting failed post retry process...');
    
    await addLogEntry({
      type: 'retry',
      level: 'info',
      message: 'Retry process started',
      details: { source: 'system' }
    });

    // Get failed posts queue
    const failedPosts = await kvStorage.getFailedPostsQueue();
    
    if (failedPosts.length === 0) {
      console.log('✅ No failed posts to retry');
      return NextResponse.json({
        success: true,
        message: 'No failed posts in queue',
        results: []
      });
    }

    console.log(`📋 Found ${failedPosts.length} failed posts in queue`);

    const now = new Date();
    const results: RetryResult[] = [];

    // Filter posts that are due for retry
    const dueForRetry = failedPosts.filter(post => {
      // If no nextRetry set, retry immediately
      if (!post.nextRetry) return true;
      
      // Check if nextRetry time has passed
      const nextRetryTime = new Date(post.nextRetry);
      return nextRetryTime <= now;
    });

    console.log(`⏰ ${dueForRetry.length} posts due for retry`);

    if (dueForRetry.length === 0) {
      const nextDue = failedPosts
        .filter(p => p.nextRetry)
        .map(p => new Date(p.nextRetry!))
        .sort((a, b) => a.getTime() - b.getTime())[0];
      
      return NextResponse.json({
        success: true,
        message: 'No posts due for retry yet',
        nextRetryAt: nextDue?.toISOString(),
        queueSize: failedPosts.length,
        results: []
      });
    }

    // Retry each failed post
    for (const failedPost of dueForRetry) {
      const { platform, contentId, contentType, title, url, thumbnailUrl, retryCount } = failedPost;
      
      console.log(`\n🔄 Retrying ${platform} for ${contentType} ${contentId} (attempt ${retryCount + 1}/${MAX_RETRY_ATTEMPTS})`);

      try {
        // Get platform configuration for credentials
        const level2Config = await kvStorage.getLevel2Config();
        const platformConfig = level2Config[platform];
        
        if (!platformConfig || !platformConfig.configured) {
          throw new Error(`Platform ${platform} not configured`);
        }

        let postResult: { id: string; url: string } | null = null;

        // Route to appropriate platform poster
        switch (platform.toLowerCase()) {
          case 'twitter':
          case 'twitter-ainow':
            const accountType = platform === 'twitter-ainow' ? 'ainow' : 'v2u';
            postResult = await postYouTubeToTwitter(
              {
                appKey: platformConfig.credentials.appKey || '',
                appSecret: platformConfig.credentials.appSecret || '',
                accessToken: platformConfig.credentials.accessToken || '',
                accessSecret: platformConfig.credentials.accessSecret || ''
              },
              { title, url, thumbnailUrl: thumbnailUrl || '' },
              accountType as 'v2u' | 'ainow'
            );
            break;

          case 'linkedin':
            postResult = await postYouTubeToLinkedIn(
              {
                accessToken: platformConfig.credentials.accessToken || ''
              },
              { title, url, thumbnailUrl: thumbnailUrl || '' }
            );
            break;

          case 'facebook':
          case 'facebook-ainow':
            postResult = await postContentToFacebook(
              {
                pageId: platformConfig.credentials.pageId || '',
                accessToken: platformConfig.credentials.pageAccessToken || platformConfig.credentials.accessToken || ''
              },
              { title, url, thumbnailUrl: thumbnailUrl || '' },
              contentType === 'spotify'
            );
            break;

          default:
            console.log(`⚠️ Platform ${platform} not supported for retry`);
            continue;
        }

        if (postResult) {
          console.log(`✅ Retry successful for ${platform}: ${postResult.url}`);
          
          // Save successful result
          await kvStorage.savePostResult(platform, {
            success: true,
            postUrl: postResult.url,
            timestamp: new Date().toISOString()
          });

          // Remove from failed queue
          await kvStorage.removeFailedPost(platform, contentId);

          await addLogEntry({
            type: 'retry',
            level: 'success',
            message: `Retry successful for ${platform}`,
            details: {
              platform,
              contentId,
              contentType,
              title,
              postUrl: postResult.url,
              retryAttempt: retryCount + 1
            }
          });

          results.push({
            platform,
            contentId,
            success: true,
            removed: true,
            postUrl: postResult.url
          });
        }

      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.error(`❌ Retry failed for ${platform}:`, errorMsg);

        const newRetryCount = retryCount + 1;

        if (newRetryCount >= MAX_RETRY_ATTEMPTS) {
          // Max retries reached, remove from queue
          console.log(`🛑 Max retries (${MAX_RETRY_ATTEMPTS}) reached for ${platform}. Removing from queue.`);
          
          await kvStorage.removeFailedPost(platform, contentId);
          
          await kvStorage.savePostResult(platform, {
            success: false,
            error: `Failed after ${MAX_RETRY_ATTEMPTS} attempts: ${errorMsg}`,
            timestamp: new Date().toISOString()
          });

          await addLogEntry({
            type: 'retry',
            level: 'error',
            message: `Max retries exceeded for ${platform}`,
            details: {
              platform,
              contentId,
              contentType,
              title,
              error: errorMsg,
              retryAttempts: MAX_RETRY_ATTEMPTS
            }
          });

          results.push({
            platform,
            contentId,
            success: false,
            removed: true,
            error: `Max retries (${MAX_RETRY_ATTEMPTS}) exceeded`
          });

        } else {
          // Schedule next retry
          const nextRetry = calculateNextRetry(newRetryCount);
          console.log(`⏰ Scheduling retry ${newRetryCount + 1}/${MAX_RETRY_ATTEMPTS} for ${nextRetry}`);

          await kvStorage.addFailedPost({
            ...failedPost,
            retryCount: newRetryCount,
            lastAttempt: new Date().toISOString(),
            nextRetry,
            error: errorMsg
          });

          await addLogEntry({
            type: 'retry',
            level: 'warn',
            message: `Retry failed for ${platform}, will retry again`,
            details: {
              platform,
              contentId,
              error: errorMsg,
              retryAttempt: newRetryCount,
              nextRetry
            }
          });

          results.push({
            platform,
            contentId,
            success: false,
            removed: false,
            error: errorMsg
          });
        }
      }
    }

    const successCount = results.filter(r => r.success).length;
    const removedCount = results.filter(r => r.removed).length;
    const duration = Date.now() - startTime;

    console.log(`\n✅ Retry process complete: ${successCount}/${dueForRetry.length} succeeded, ${removedCount} removed from queue`);

    await addLogEntry({
      type: 'retry',
      level: successCount > 0 ? 'success' : 'warn',
      message: `Retry process complete: ${successCount}/${dueForRetry.length} succeeded`,
      details: {
        attempted: dueForRetry.length,
        succeeded: successCount,
        removed: removedCount,
        duration
      }
    });

    return NextResponse.json({
      success: true,
      results,
      summary: {
        attempted: dueForRetry.length,
        succeeded: successCount,
        removed: removedCount,
        remainingInQueue: failedPosts.length - removedCount
      }
    });

  } catch (error) {
    console.error('❌ Retry process failed:', error);
    
    await addLogEntry({
      type: 'retry',
      level: 'error',
      message: 'Retry process failed',
      details: {
        error: error instanceof Error ? error.message : String(error)
      }
    });

    return NextResponse.json(
      { 
        error: 'Retry process failed',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/automation/retry-failed
 * Get current retry queue status
 */
export async function GET() {
  try {
    const failedPosts = await kvStorage.getFailedPostsQueue();
    
    const now = new Date();
    const dueNow = failedPosts.filter(post => {
      if (!post.nextRetry) return true;
      return new Date(post.nextRetry) <= now;
    });

    return NextResponse.json({
      success: true,
      queue: failedPosts,
      summary: {
        total: failedPosts.length,
        dueForRetry: dueNow.length,
        platforms: [...new Set(failedPosts.map(p => p.platform))]
      }
    });

  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Failed to get retry queue',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
