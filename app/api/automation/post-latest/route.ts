import { NextRequest, NextResponse } from 'next/server';
import { kvStorage } from '@/lib/kv-storage';
import { postTweet } from '@/lib/twitter-oauth';
import { generateEpisodeImage, postToInstagramWithImage } from '@/lib/image-generator';
import { sendEmailNotification, sendSMSNotification, saveNotificationLog } from '@/lib/notification-service';

export const runtime = 'nodejs';

interface EpisodeMetadata {
  youtubeUrl?: string;
  youtubeTitle?: string;
  spotifyUrl?: string;
  spotifyTitle?: string;
  rumbleUrl?: string;
  rumbleTitle?: string;
  title: string;
  description: string;
  publishedAt: string;
  episodeNumber?: number;
}

/**
 * POST /api/automation/post-latest
 * Fetch latest content and post to all enabled level 2 platforms
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function POST(_request: NextRequest) {
  const executionLog: Array<{ timestamp: string; level: string; platform?: string; message: string; data?: unknown }> = [];
  
  function log(level: 'info' | 'error' | 'warn', message: string, platform?: string, data?: unknown) {
    const entry = { timestamp: new Date().toISOString(), level, platform, message, data };
    executionLog.push(entry);
    console.log(`[${level.toUpperCase()}] ${platform ? `[${platform}] ` : ''}${message}`, data || '');
  }

  try {
    log('info', 'Starting post-latest execution');
    
    // Get latest episode metadata
    const latestEpisode = await getLatestEpisode();
    
    if (!latestEpisode) {
      log('error', 'No episode metadata found');
      return NextResponse.json(
        { error: 'No episode metadata found', logs: executionLog },
        { status: 404 }
      );
    }
    
    log('info', 'Retrieved episode metadata', undefined, { 
      title: latestEpisode.title,
      youtubeUrl: latestEpisode.youtubeUrl,
      spotifyUrl: latestEpisode.spotifyUrl,
      rumbleUrl: latestEpisode.rumbleUrl
    });

    // Get level 2 configuration
    const level2Config = await kvStorage.getLevel2Config();
    log('info', `Loaded ${Object.keys(level2Config).length} platform configurations`);
    
    // Build post content
    const postContent = buildPostContent(latestEpisode);
    log('info', 'Built post content', undefined, { length: postContent.length, preview: postContent.substring(0, 100) });
    
    // Post to all enabled platforms
    const results: Record<string, { success: boolean; skipped?: boolean; reason?: string; error?: string; postUrl?: string; timestamp?: string }> = {};
    
    for (const [platformId, config] of Object.entries(level2Config)) {
      log('info', `Checking platform: ${platformId}`, platformId, { 
        enabled: config.enabled, 
        validated: config.validated,
        hasCredentials: !!config.credentials,
        credentialKeys: config.credentials ? Object.keys(config.credentials) : []
      });

      if (!config.enabled || !config.validated) {
        const reason = !config.enabled ? 'Platform disabled' : 'Not validated';
        log('warn', `Skipping: ${reason}`, platformId);
        results[platformId] = {
          success: false,
          skipped: true,
          reason
        };
        continue;
      }

      log('info', 'Attempting to post', platformId, { contentLength: postContent.length });
      try {
        const result = await postToPlatform(platformId, config.credentials, postContent, latestEpisode);
        results[platformId] = {
          ...result,
          timestamp: new Date().toISOString()
        };

        if (result.success) {
          log('info', '✅ Post successful', platformId, { postUrl: 'postUrl' in result ? result.postUrl : undefined });
        } else {
          log('error', '❌ Post failed', platformId, { 
            error: 'error' in result ? result.error : 'Unknown error',
            details: 'details' in result ? result.details : undefined
          });
        }

        // Save result to KV for display in admin panel
        await kvStorage.savePostResult(platformId, {
          success: result.success,
          error: 'error' in result ? result.error : undefined,
          postUrl: 'postUrl' in result ? result.postUrl : undefined,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        log('error', `Exception thrown: ${errorMsg}`, platformId, { stack: error instanceof Error ? error.stack : undefined });
        results[platformId] = {
          success: false,
          error: errorMsg,
          timestamp: new Date().toISOString()
        };

        await kvStorage.savePostResult(platformId, {
          success: false,
          error: errorMsg,
          timestamp: new Date().toISOString()
        });
      }
    }

    log('info', 'Posting completed', undefined, { 
      total: Object.keys(results).length,
      successful: Object.values(results).filter(r => r.success).length,
      failed: Object.values(results).filter(r => !r.success && !r.skipped).length,
      skipped: Object.values(results).filter(r => r.skipped).length
    });

    return NextResponse.json({
      success: true,
      episode: {
        title: latestEpisode.title,
        youtubeUrl: latestEpisode.youtubeUrl,
        spotifyUrl: latestEpisode.spotifyUrl,
        rumbleUrl: latestEpisode.rumbleUrl
      },
      results,
      logs: executionLog
    });

  } catch (error) {
    log('error', 'Fatal error in post-latest', undefined, { 
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    console.error('Post latest error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to post latest episode',
        details: error instanceof Error ? error.message : 'Unknown error',
        logs: executionLog
      },
      { status: 500 }
    );
  }
}

/**
 * Get latest episode metadata from KV or YouTube API
 */
async function getLatestEpisode(): Promise<EpisodeMetadata | null> {
  try {
    // Try to get from KV storage first
    const stored = await kvStorage.getLatestEpisode();
    if (stored && typeof stored === 'object' && 'title' in stored && 'description' in stored && 'publishedAt' in stored) {
      return stored as unknown as EpisodeMetadata;
    }

    // Fallback: Fetch from YouTube API
    const level1Config = await kvStorage.getLevel1Config();
    const youtubeApiKey = level1Config.youtube?.credentials?.apiKey || process.env.YOUTUBE_API_KEY;
    const channelId = level1Config.youtube?.credentials?.channelId || process.env.YOUTUBE_CHANNEL_ID;

    if (!youtubeApiKey || !channelId) {
      return null;
    }

    // Get latest video from YouTube
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?key=${youtubeApiKey}&channelId=${channelId}&part=snippet&order=date&maxResults=1&type=video`
    );

    if (!response.ok) {
      console.error('YouTube API error:', response.status);
      return null;
    }

    const data = await response.json() as {
      items?: Array<{
        id: { videoId: string };
        snippet: {
          title: string;
          description: string;
          publishedAt: string;
        };
      }>;
    };
    const video = data.items?.[0];

    if (!video) {
      return null;
    }

    return {
      title: video.snippet.title,
      description: video.snippet.description,
      youtubeUrl: `https://www.youtube.com/watch?v=${video.id.videoId}`,
      youtubeTitle: video.snippet.title,
      publishedAt: video.snippet.publishedAt
    };

  } catch (error) {
    console.error('Error getting latest episode:', error);
    return null;
  }
}

/**
 * Build post content with all platform links
 */
function buildPostContent(episode: EpisodeMetadata): string {
  let content = `🎙️ New Episode: ${episode.title}\n\n`;
  
  const links: string[] = [];
  
  if (episode.youtubeUrl) {
    links.push(`🎥 YouTube: ${episode.youtubeUrl}`);
  }
  
  if (episode.spotifyUrl) {
    links.push(`🎵 Spotify: ${episode.spotifyUrl}`);
  }
  
  if (episode.rumbleUrl) {
    links.push(`📹 Rumble: ${episode.rumbleUrl}`);
  }

  if (links.length > 0) {
    content += links.join('\n');
    content += '\n\n';
  }

  content += '#Podcast #NewEpisode';

  return content;
}

/**
 * Post to a specific platform
 */
async function postToPlatform(
  platformId: string, 
  credentials: Record<string, unknown>, 
  content: string,
  latestEpisode: EpisodeMetadata
) {
  switch (platformId) {
    case 'linkedin':
      return await postToLinkedIn(credentials, content);
    
    case 'facebook':
    case 'facebook-ainow':
      return await postToFacebook(credentials, content);
    
    case 'twitter':
    case 'twitter-ainow':
      return await postToTwitter(credentials, content);
    
    case 'instagram':
      return await postToInstagramWithImageGeneration(credentials, content, latestEpisode);
    
    case 'threads':
      return await postToThreads(credentials, content);
    
    case 'tiktok':
      return await postToTikTok(credentials, content, latestEpisode);
    
    case 'odysee':
      return await postToOdysee(credentials, content, latestEpisode);
    
    case 'vimeo':
      return await postToVimeo(credentials, content, latestEpisode);
    
    default:
      return { success: false, error: `Platform ${platformId} not supported` };
  }
}

/**
 * Post to LinkedIn
 */
async function postToLinkedIn(credentials: Record<string, unknown>, content: string) {
  try {
    const { accessToken, personUrn } = credentials as { accessToken?: string; personUrn?: string };

    console.log('[LinkedIn] Starting post attempt');
    console.log('[LinkedIn] Has accessToken:', !!accessToken);
    console.log('[LinkedIn] personUrn value:', personUrn);

    if (!accessToken) {
      console.error('[LinkedIn] Missing access token');
      return { success: false, error: 'Missing access token' };
    }

    if (!personUrn || personUrn === 'urn:li:person:PLACEHOLDER') {
      console.error('[LinkedIn] Missing or invalid personUrn');
      return { success: false, error: 'LinkedIn personUrn not configured. Please re-validate LinkedIn credentials in admin panel.' };
    }

    const shareData = {
      author: personUrn,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: {
            text: content
          },
          shareMediaCategory: 'NONE'
        }
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
      }
    };

    const response = await fetch('https://api.linkedin.com/v2/ugcPosts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0'
      },
      body: JSON.stringify(shareData)
    });

    console.log('[LinkedIn] API Response status:', response.status);
    const responseText = await response.text();
    console.log('[LinkedIn] API Response body:', responseText.substring(0, 500));
    
    if (!response.ok) {
      let errorDetails = responseText;
      try {
        const errorData = JSON.parse(responseText);
        errorDetails = errorData.message || JSON.stringify(errorData);
      } catch {
        // Keep original text
      }

      console.error('[LinkedIn] API Error:', response.status, errorDetails);
      return {
        success: false,
        error: `LinkedIn API error: ${response.status}`,
        details: errorDetails
      };
    }

    const result = JSON.parse(responseText);
    const postId = result.id || 'unknown';

    console.log('[LinkedIn] ✅ Post successful, ID:', postId);
    return {
      success: true,
      postId,
      postUrl: `https://www.linkedin.com/feed/update/${postId}`
    };

  } catch (error) {
    console.error('[LinkedIn] Exception:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Post to Facebook
 */
async function postToFacebook(credentials: Record<string, unknown>, content: string) {
  try {
    const { pageAccessToken, pageId } = credentials as { pageAccessToken?: string; pageId?: string };

    console.log('[Facebook] Starting post attempt');
    console.log('[Facebook] Has pageAccessToken:', !!pageAccessToken, 'length:', pageAccessToken?.length);
    console.log('[Facebook] Token preview:', pageAccessToken?.substring(0, 20) + '...');
    console.log('[Facebook] Has pageId:', !!pageId);

    if (!pageAccessToken || !pageId) {
      console.error('[Facebook] Missing credentials');
      return { success: false, error: 'Missing page access token or page ID' };
    }

    const response = await fetch(`https://graph.facebook.com/v18.0/${pageId}/feed`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: content,
        access_token: pageAccessToken
      })
    });

    console.log('[Facebook] API Response status:', response.status);
    const result = await response.json() as { 
      id?: string; 
      error?: { message?: string } 
    };
    console.log('[Facebook] API Response body:', JSON.stringify(result).substring(0, 500));

    if (!response.ok || result.error) {
      console.error('[Facebook] API Error:', result.error?.message);
      return {
        success: false,
        error: result.error?.message || 'Facebook API error',
        details: JSON.stringify(result.error || result)
      };
    }

    console.log('[Facebook] ✅ Post successful, ID:', result.id);
    return {
      success: true,
      postId: result.id,
      postUrl: `https://www.facebook.com/${result.id}`
    };

  } catch (error) {
    console.error('[Facebook] Exception:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Post to Twitter/X
 */
async function postToTwitter(credentials: Record<string, unknown>, content: string) {
  try {
    const { appKey, appSecret, accessToken, accessSecret } = credentials as {
      appKey?: string;
      appSecret?: string;
      accessToken?: string;
      accessSecret?: string;
    };

    console.log('[Twitter] Starting post attempt');
    console.log('[Twitter] Has credentials:', { appKey: !!appKey, appSecret: !!appSecret, accessToken: !!accessToken, accessSecret: !!accessSecret });

    if (!appKey || !appSecret || !accessToken || !accessSecret) {
      console.error('[Twitter] Missing credentials');
      return { success: false, error: 'Missing Twitter credentials' };
    }

    // Truncate content to 280 characters for Twitter
    const tweetText = content.length > 280 ? content.substring(0, 277) + '...' : content;
    console.log('[Twitter] Tweet text length:', tweetText.length);

    const result = await postTweet(
      tweetText,
      appKey,
      appSecret,
      accessToken,
      accessSecret
    );

    if (!result.success) {
      console.error('[Twitter] Post failed:', result.error);
      console.error('[Twitter] Debug info:', JSON.stringify(result.debugInfo, null, 2));
      return {
        success: false,
        error: result.error || 'Failed to post tweet',
        details: result.debugInfo // Include debug info in response
      };
    }

    console.log('[Twitter] ✅ Post successful, ID:', result.tweetId);
    console.log('[Twitter] Debug info:', JSON.stringify(result.debugInfo, null, 2));
    return {
      success: true,
      postId: result.tweetId,
      postUrl: result.tweetId ? `https://twitter.com/i/web/status/${result.tweetId}` : undefined,
      debugInfo: result.debugInfo
    };

  } catch (error) {
    console.error('[Twitter] Exception:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Post to Threads
 */
/**
 * Post to Threads
 */
async function postToThreads(credentials: Record<string, unknown>, content: string) {
  try {
    const { accessToken, userId, username } = credentials as { 
      accessToken?: string; 
      userId?: string;
      username?: string;
    };

    console.log('[Threads] Starting post attempt');
    console.log('[Threads] Has credentials:', { 
      hasAccessToken: !!accessToken, 
      hasUserId: !!userId,
      hasUsername: !!username,
      userId: userId,
      username: username
    });

    if (!accessToken) {
      return { success: false, error: 'Missing Threads access token' };
    }

    // Check if we have userId saved from validation
    let threadsUserId = userId;
    
    if (!threadsUserId) {
      console.log('[Threads] User ID not found in credentials, fetching...');
      // Threads uses Instagram Graph API
      // Fetch user ID if not already saved
      const userResponse = await fetch(
        `https://graph.threads.net/v1.0/me?fields=id&access_token=${accessToken}`
      );
      
      if (!userResponse.ok) {
        const errorText = await userResponse.text();
        console.error('[Threads] Failed to get user ID:', errorText);
        return { 
          success: false, 
          error: 'Failed to get Threads user ID. Please re-validate your Threads credentials in the admin panel.' 
        };
      }

      const userData = await userResponse.json() as { id?: string };
      threadsUserId = userData.id;
      
      if (!threadsUserId) {
        return { 
          success: false, 
          error: 'Could not retrieve Threads user ID. Please re-validate your credentials.' 
        };
      }
      
      console.log('[Threads] Fetched user ID:', threadsUserId);
    } else {
      console.log('[Threads] Using saved user ID:', threadsUserId);
    }

    console.log('[Threads] Creating thread container...');

    // Create a text post
    const response = await fetch(
      `https://graph.threads.net/v1.0/${threadsUserId}/threads`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          media_type: 'TEXT',
          text: content,
          access_token: accessToken
        })
      }
    );

    console.log('[Threads] Container creation response status:', response.status);
    const result = await response.json() as { 
      id?: string; 
      error?: { message?: string; code?: number } 
    };
    console.log('[Threads] Container creation response:', JSON.stringify(result));

    if (!response.ok || result.error) {
      console.error('[Threads] Container creation failed:', result.error);
      return {
        success: false,
        error: result.error?.message || 'Threads API error',
        details: JSON.stringify(result.error || result)
      };
    }

    const mediaId = result.id;
    console.log('[Threads] Thread container created, ID:', mediaId);

    // Publish the thread
    console.log('[Threads] Publishing thread...');
    const publishResponse = await fetch(
      `https://graph.threads.net/v1.0/${threadsUserId}/threads_publish`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          creation_id: mediaId,
          access_token: accessToken
        })
      }
    );

    console.log('[Threads] Publish response status:', publishResponse.status);
    const publishResult = await publishResponse.json() as { 
      id?: string; 
      error?: { message?: string; code?: number } 
    };
    console.log('[Threads] Publish response:', JSON.stringify(publishResult));

    if (!publishResponse.ok || publishResult.error) {
      console.error('[Threads] Publishing failed:', publishResult.error);
      return {
        success: false,
        error: publishResult.error?.message || 'Failed to publish thread'
      };
    }

    const postId = publishResult.id;
    console.log('[Threads] ✅ Thread published successfully, ID:', postId);

    // Build post URL using username if available
    const postUrl = username 
      ? `https://www.threads.net/@${username}/post/${postId}`
      : undefined;

    return {
      success: true,
      postId: postId,
      postUrl: postUrl
    };

  } catch (error) {
    console.error('[Threads] Exception:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Post to Instagram with auto-generated image
 * Instagram requires media, so we generate a simple episode image
 */
async function postToInstagramWithImageGeneration(
  credentials: Record<string, unknown>, 
  content: string,
  episode: EpisodeMetadata
) {
  try {
    const { accessToken, userId } = credentials as { accessToken?: string; userId?: string };

    console.log('[Instagram] Starting image-based post');

    if (!accessToken || !userId) {
      return { success: false, error: 'Missing Instagram credentials' };
    }

    // Generate episode image
    console.log('[Instagram] Generating episode image');
    const imageDataUrl = await generateEpisodeImage({
      title: episode.title,
      subtitle: '🎙️ New Episode',
      backgroundColor: '#1a1a2e',
      textColor: '#ffffff'
    });

    console.log('[Instagram] Image generated (SVG data URL)');
    
    // Upload image to R2
    console.log('[Instagram] Uploading image to R2');
    const { uploadImageToR2, generateInstagramFilename } = await import('@/lib/r2-image-upload');
    
    const filename = generateInstagramFilename(episode.episodeNumber);
    const publicUrl = await uploadImageToR2(imageDataUrl, filename);
    
    console.log('[Instagram] Image uploaded to R2:', publicUrl);

    // Post to Instagram with uploaded image
    console.log('[Instagram] Posting to Instagram with image URL');
    const result = await postToInstagramWithImage(accessToken, userId, publicUrl, content);
    
    if (result.success) {
      console.log('[Instagram] ✅ Posted successfully, Post ID:', result.postId);
    } else {
      console.error('[Instagram] ❌ Failed to post:', result.error);
    }

    return result;

  } catch (error) {
    console.error('[Instagram] Exception:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Post to TikTok (Manual)
 * Note: TikTok does not have a public text-only posting API
 * Sends email/SMS notification with ready-to-post content
 */
async function postToTikTok(
  credentials: Record<string, unknown>, 
  content: string,
  episode: EpisodeMetadata
) {
  console.log('[TikTok] Sending notification for manual posting');
  
  // Get notification config from environment or KV
  const notificationEmail = process.env.NOTIFICATION_EMAIL;
  const notificationPhone = process.env.NOTIFICATION_PHONE;

  if (!notificationEmail && !notificationPhone) {
    console.log('[TikTok] No notification settings configured');
    return {
      success: false,
      error: '⚠️ Manual posting required - TikTok does not support automated text posts. Set NOTIFICATION_EMAIL or NOTIFICATION_PHONE environment variable to receive posting notifications.'
    };
  }

  try {
    // Send notification
    const notification = {
      platform: 'TikTok' as const,
      title: episode.title,
      content,
      links: {
        youtube: episode.youtubeUrl,
        spotify: episode.spotifyUrl,
        rumble: episode.rumbleUrl
      }
    };

    // Send email if configured
    if (notificationEmail) {
      await sendEmailNotification(
        { email: notificationEmail, serviceName: 'TikTok' },
        notification
      );
      console.log('[TikTok] Email notification sent');
    }

    // Send SMS if configured
    if (notificationPhone) {
      await sendSMSNotification(
        { phone: notificationPhone, serviceName: 'TikTok' },
        notification
      );
      console.log('[TikTok] SMS notification sent');
    }

    // Save notification log
    await saveNotificationLog(notification);

    return {
      success: true,
      postUrl: undefined,
      message: '📧 Notification sent! Check your email/SMS for ready-to-post content.'
    };

  } catch (error) {
    console.error('[TikTok] Notification failed:', error);
    return {
      success: false,
      error: `Failed to send notification: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Post to Odysee
 * Note: Odysee uses LBRY protocol and doesn't have a simple REST API
 * Sends notification for manual posting
 */
async function postToOdysee(
  credentials: Record<string, unknown>, 
  content: string,
  episode: EpisodeMetadata
) {
  console.log('[Odysee] Sending notification for manual posting');
  
  const notificationEmail = process.env.NOTIFICATION_EMAIL;
  const notificationPhone = process.env.NOTIFICATION_PHONE;

  if (!notificationEmail && !notificationPhone) {
    return {
      success: false,
      error: '⚠️ Manual posting required - Odysee requires LBRY SDK or manual posting. Set NOTIFICATION_EMAIL to receive posting notifications.'
    };
  }

  try {
    const notification = {
      platform: 'Odysee' as const,
      title: episode.title,
      content,
      links: {
        youtube: episode.youtubeUrl,
        spotify: episode.spotifyUrl,
        rumble: episode.rumbleUrl
      }
    };

    if (notificationEmail) {
      await sendEmailNotification(
        { email: notificationEmail, serviceName: 'Odysee' },
        notification
      );
    }

    if (notificationPhone) {
      await sendSMSNotification(
        { phone: notificationPhone, serviceName: 'Odysee' },
        notification
      );
    }

    await saveNotificationLog(notification);

    return {
      success: true,
      message: '📧 Notification sent! Check your email/SMS for ready-to-post content.'
    };

  } catch (error) {
    return {
      success: false,
      error: `Failed to send notification: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Post to Vimeo
 * Note: Vimeo requires video content for posting
 * Sends notification for manual posting
 */
async function postToVimeo(
  credentials: Record<string, unknown>, 
  content: string,
  episode: EpisodeMetadata
) {
  console.log('[Vimeo] Sending notification for manual posting');
  
  const notificationEmail = process.env.NOTIFICATION_EMAIL;
  const notificationPhone = process.env.NOTIFICATION_PHONE;

  if (!notificationEmail && !notificationPhone) {
    return {
      success: false,
      error: '⚠️ Manual posting required - Vimeo requires video content, not text posts. Set NOTIFICATION_EMAIL to receive posting notifications.'
    };
  }

  try {
    const notification = {
      platform: 'Vimeo' as const,
      title: episode.title,
      content,
      links: {
        youtube: episode.youtubeUrl,
        spotify: episode.spotifyUrl,
        rumble: episode.rumbleUrl
      }
    };

    if (notificationEmail) {
      await sendEmailNotification(
        { email: notificationEmail, serviceName: 'Vimeo' },
        notification
      );
    }

    if (notificationPhone) {
      await sendSMSNotification(
        { phone: notificationPhone, serviceName: 'Vimeo' },
        notification
      );
    }

    await saveNotificationLog(notification);

    return {
      success: true,
      message: '📧 Notification sent! Check your email/SMS for ready-to-post content.'
    };

  } catch (error) {
    return {
      success: false,
      error: `Failed to send notification: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}
