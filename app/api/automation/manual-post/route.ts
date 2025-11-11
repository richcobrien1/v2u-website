import { NextRequest, NextResponse } from 'next/server';
import { kvStorage } from '@/lib/kv-storage';
import { postYouTubeToTwitter } from '@/lib/social-platforms/twitter-poster';
import { postYouTubeToLinkedIn } from '@/lib/social-platforms/linkedin-poster';
import { postContentToFacebook } from '@/lib/social-platforms/facebook-poster';
import { sendFailureAlert } from '@/lib/notifications/email-alerts';
// Video upload utilities (for Instagram/TikTok)
// import { downloadYouTubeVideo, cleanupVideoFile } from '@/lib/video-downloader';
// import { uploadVideoToInstagram } from '@/lib/social-platforms/instagram-video-uploader';
// import { uploadVideoToTikTok } from '@/lib/social-platforms/tiktok-video-uploader';

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
                accessToken: l2Config.credentials.pageAccessToken || l2Config.credentials.accessToken || ''
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
          } else if (l2Id === 'instagram') {
            console.log(`⚠️ Instagram requires video upload - skipping for now`);
            throw new Error('Instagram requires video file upload. Please implement cloud storage integration first.');
            
            /* Uncomment when video upload is ready:
            console.log(`Posting to Instagram (video upload required)...`);
            
            // Download video from YouTube
            console.log(`📥 Downloading video for Instagram...`);
            const downloadResult = await downloadYouTubeVideo(url, {
              quality: '720p',
              maxFileSize: 100 // 100MB limit
            });

            if (!downloadResult.success || !downloadResult.filePath) {
              throw new Error(`Video download failed: ${downloadResult.error}`);
            }

            try {
              // Note: Instagram requires video to be publicly accessible
              // You'll need to upload to R2/S3 first to get a public URL
              console.log(`⚠️ Instagram requires public video URL - upload to cloud storage needed`);
              throw new Error('Instagram requires video to be hosted at public URL. Please implement cloud storage upload first.');
              
              const result = await uploadVideoToInstagram(
                {
                  accessToken: l2Config.credentials.accessToken || '',
                  userId: l2Config.credentials.userId || ''
                },
                downloadResult.filePath,
                `${title}\n\n🎥 Watch full episode: ${url}\n\n#AINow #AI #Technology`,
                publicVideoUrl // Upload to R2/S3 first
              );

              if (!result.success) {
                throw new Error(result.error || 'Instagram upload failed');
              }

              results.posted.push({
                platform: l2Id,
                postId: result.postId || '',
                url: result.url || ''
              });
              console.log(`✅ Posted to Instagram: ${result.postId}`);
            } finally {
              // Cleanup downloaded file
              await cleanupVideoFile(downloadResult.filePath);
            }
            */
          } else if (l2Id === 'tiktok') {
            console.log(`⚠️ TikTok requires API approval - skipping`);
            throw new Error('TikTok Content Posting API requires developer approval. Please post manually or apply for API access.');
            
            /* Uncomment when TikTok API is approved:
            console.log(`Posting to TikTok (video upload required)...`);
            
            const downloadResult = await downloadYouTubeVideo(url, {
              quality: '720p',
              maxFileSize: 100
            });

            if (!downloadResult.success || !downloadResult.filePath) {
              throw new Error(`Video download failed: ${downloadResult.error}`);
            }

            try {
              const result = await uploadVideoToTikTok(
                {
                  accessToken: l2Config.credentials.accessToken || '',
                  openId: l2Config.credentials.openId || ''
                },
                downloadResult.filePath,
                title,
                `Watch full episode: ${url}`
              );

              if (!result.success) {
                throw new Error(result.error || 'TikTok upload failed');
              }

              results.posted.push({
                platform: l2Id,
                postId: result.postId || '',
                url: result.shareUrl || ''
              });
              console.log(`✅ Posted to TikTok: ${result.postId}`);
            } finally {
              await cleanupVideoFile(downloadResult.filePath);
            }
            */
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
