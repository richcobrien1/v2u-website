import { NextRequest, NextResponse } from 'next/server';
import { kvStorage } from '@/lib/kv-storage';
import { postTweet } from '@/lib/twitter-oauth';

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
}

/**
 * POST /api/automation/post-latest
 * Fetch latest content and post to all enabled level 2 platforms
 */
export async function POST(request: NextRequest) {
  try {
    // Get latest episode metadata
    const latestEpisode = await getLatestEpisode();
    
    if (!latestEpisode) {
      return NextResponse.json(
        { error: 'No episode metadata found' },
        { status: 404 }
      );
    }

    // Get level 2 configuration
    const level2Config = await kvStorage.getLevel2Config();
    
    // Build post content
    const postContent = buildPostContent(latestEpisode);
    
    // Post to all enabled platforms
    const results: Record<string, any> = {};
    
    for (const [platformId, config] of Object.entries(level2Config)) {
      if (!config.enabled || !config.validated) {
        results[platformId] = {
          success: false,
          skipped: true,
          reason: !config.enabled ? 'Platform disabled' : 'Not validated'
        };
        continue;
      }

      try {
        const result = await postToPlatform(platformId, config.credentials, postContent);
        results[platformId] = {
          ...result,
          timestamp: new Date().toISOString()
        };

        // Save result to KV for display in admin panel
        await kvStorage.savePostResult(platformId, {
          success: result.success,
          error: result.error,
          postUrl: 'postUrl' in result ? result.postUrl : undefined,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
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

    return NextResponse.json({
      success: true,
      episode: {
        title: latestEpisode.title,
        youtubeUrl: latestEpisode.youtubeUrl,
        spotifyUrl: latestEpisode.spotifyUrl,
        rumbleUrl: latestEpisode.rumbleUrl
      },
      results
    });

  } catch (error) {
    console.error('Post latest error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to post latest episode',
        details: error instanceof Error ? error.message : 'Unknown error'
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
    if (stored) {
      return stored;
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

    const data = await response.json() as any;
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
async function postToPlatform(platformId: string, credentials: any, content: string) {
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
      return { success: false, error: 'Instagram requires media content' };
    
    case 'threads':
      return await postToThreads(credentials, content);
    
    default:
      return { success: false, error: `Platform ${platformId} not supported` };
  }
}

/**
 * Post to LinkedIn
 */
async function postToLinkedIn(credentials: any, content: string) {
  try {
    const { accessToken, personUrn } = credentials;

    if (!accessToken) {
      return { success: false, error: 'Missing access token' };
    }

    const shareData = {
      author: personUrn || 'urn:li:person:PLACEHOLDER',
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

    const responseText = await response.text();
    
    if (!response.ok) {
      let errorDetails = responseText;
      try {
        const errorData = JSON.parse(responseText);
        errorDetails = errorData.message || JSON.stringify(errorData);
      } catch (e) {
        // Keep original text
      }

      return {
        success: false,
        error: `LinkedIn API error: ${response.status}`,
        details: errorDetails
      };
    }

    const result = JSON.parse(responseText);
    const postId = result.id || 'unknown';

    return {
      success: true,
      postId,
      postUrl: `https://www.linkedin.com/feed/update/${postId}`
    };

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Post to Facebook
 */
async function postToFacebook(credentials: any, content: string) {
  try {
    const { pageAccessToken, pageId } = credentials;

    if (!pageAccessToken || !pageId) {
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

    const result = await response.json() as any;

    if (!response.ok || result.error) {
      return {
        success: false,
        error: result.error?.message || 'Facebook API error',
        details: JSON.stringify(result.error || result)
      };
    }

    return {
      success: true,
      postId: result.id,
      postUrl: `https://www.facebook.com/${result.id}`
    };

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Post to Twitter/X
 */
async function postToTwitter(credentials: any, content: string) {
  try {
    const { appKey, appSecret, accessToken, accessSecret } = credentials;

    if (!appKey || !appSecret || !accessToken || !accessSecret) {
      return { success: false, error: 'Missing Twitter credentials' };
    }

    // Truncate content to 280 characters for Twitter
    const tweetText = content.length > 280 ? content.substring(0, 277) + '...' : content;

    const result = await postTweet(
      tweetText,
      appKey,
      appSecret,
      accessToken,
      accessSecret
    );

    if (!result.success) {
      return {
        success: false,
        error: result.error || 'Failed to post tweet'
      };
    }

    return {
      success: true,
      postId: result.tweetId,
      postUrl: result.tweetId ? `https://twitter.com/i/web/status/${result.tweetId}` : undefined
    };

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Post to Threads
 */
async function postToThreads(credentials: any, content: string) {
  // Threads API not yet implemented
  return {
    success: false,
    error: 'Threads posting not yet implemented'
  };
}
