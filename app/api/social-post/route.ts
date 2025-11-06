import { NextRequest, NextResponse } from 'next/server';
import { TwitterApi } from 'twitter-api-v2';

export const runtime = 'nodejs';

interface Episode {
  id?: string;
  title: string;
  description: string;
  youtubeUrl?: string;
  rumbleUrl?: string;
  spotifyUrl?: string;
  category: string;
  publishDate: string;
}

interface PostRequest {
  platforms: string[];
  episode: Episode;
  customMessage?: string;
  scheduled?: boolean;
  scheduledTime?: string;
}

interface PostResult {
  success: boolean;
  postId?: string;
  platform: string;
  url?: string;
  postedAt: string;
  error?: string;
}

/**
 * POST /api/social-post
 * Cross-post episode links to Level 2 social platforms
 */
export async function POST(request: NextRequest) {
  try {
    const body: PostRequest = await request.json();
    const { platforms, episode, customMessage } = body;

    if (!platforms || platforms.length === 0) {
      return NextResponse.json(
        { error: 'No platforms specified' },
        { status: 400 }
      );
    }

    const results: Record<string, PostResult> = {};

    // Post to each selected platform
    for (const platform of platforms) {
      try {
        switch (platform.toLowerCase()) {
          case 'twitter':
          case 'x':
            results[platform] = await postToTwitter(episode, customMessage);
            break;

          case 'facebook':
            results[platform] = await postToFacebook(episode, customMessage);
            break;

          case 'linkedin':
            results[platform] = await postToLinkedIn(episode, customMessage);
            break;

          case 'instagram':
            results[platform] = await postToInstagram(episode, customMessage);
            break;

          case 'threads':
            results[platform] = await postToThreads(episode, customMessage);
            break;

          default:
            results[platform] = {
              success: false,
              platform,
              postedAt: new Date().toISOString(),
              error: `Platform ${platform} not supported`
            };
        }
      } catch (error) {
        results[platform] = {
          success: false,
          platform,
          postedAt: new Date().toISOString(),
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    }

    // Check if any posts succeeded
    const successCount = Object.values(results).filter(r => r.success).length;
    const totalCount = platforms.length;

    return NextResponse.json({
      success: successCount > 0,
      results,
      summary: {
        total: totalCount,
        succeeded: successCount,
        failed: totalCount - successCount
      }
    });

  } catch (error) {
    console.error('Social post API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process social post request',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * Post to Twitter/X
 */
async function postToTwitter(episode: Episode, customMessage?: string): Promise<PostResult> {
  try {
    const apiKey = process.env.TWITTER_API_KEY;
    const apiSecret = process.env.TWITTER_API_SECRET;
    const accessToken = process.env.TWITTER_ACCESS_TOKEN;
    const accessSecret = process.env.TWITTER_ACCESS_SECRET;

    console.log('Twitter credentials check:', {
      hasApiKey: !!apiKey,
      hasApiSecret: !!apiSecret,
      hasAccessToken: !!accessToken,
      hasAccessSecret: !!accessSecret
    });

    if (!apiKey || !apiSecret || !accessToken || !accessSecret) {
      throw new Error('Twitter credentials not configured');
    }

    const client = new TwitterApi({
      appKey: apiKey,
      appSecret: apiSecret,
      accessToken,
      accessSecret,
    });

    // Generate post content
    const primaryUrl = episode.youtubeUrl || episode.rumbleUrl || episode.spotifyUrl || '';
    const content = customMessage || generateTwitterContent(episode, primaryUrl);

    console.log('Attempting to post tweet:', { contentLength: content.length });

    // Post tweet
    const tweet = await client.v2.tweet(content);
    
    console.log('Tweet posted successfully:', tweet.data.id);

    return {
      success: true,
      postId: tweet.data.id,
      platform: 'twitter',
      url: `https://twitter.com/i/web/status/${tweet.data.id}`,
      postedAt: new Date().toISOString()
    };

  } catch (error) {
    console.error('Twitter posting error:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    throw error;
  }
}

/**
 * Post to Facebook
 */
async function postToFacebook(episode: Episode, customMessage?: string): Promise<PostResult> {
  try {
    const accessToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
    const pageId = process.env.FACEBOOK_PAGE_ID;

    if (!accessToken || !pageId) {
      throw new Error('Facebook credentials not configured');
    }

    const primaryUrl = episode.youtubeUrl || episode.rumbleUrl || episode.spotifyUrl || '';
    const message = customMessage || generateFacebookContent(episode, primaryUrl);

    // Post to Facebook Page
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${pageId}/feed`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          link: primaryUrl,
          access_token: accessToken
        })
      }
    );

    if (!response.ok) {
      const error = await response.json() as { error?: { message?: string } };
      throw new Error(error.error?.message || 'Facebook API error');
    }

    const data = await response.json() as { id: string };

    return {
      success: true,
      postId: data.id,
      platform: 'facebook',
      postedAt: new Date().toISOString()
    };

  } catch (error) {
    console.error('Facebook posting error:', error);
    throw error;
  }
}

/**
 * Post to LinkedIn
 */
async function postToLinkedIn(episode: Episode, customMessage?: string): Promise<PostResult> {
  try {
    const accessToken = process.env.LINKEDIN_ACCESS_TOKEN;
    const personUrn = process.env.LINKEDIN_PERSON_URN;

    if (!accessToken || !personUrn) {
      throw new Error('LinkedIn credentials not configured');
    }

    const primaryUrl = episode.youtubeUrl || episode.rumbleUrl || episode.spotifyUrl || '';
    const content = customMessage || generateLinkedInContent(episode, primaryUrl);

    // Create LinkedIn post
    const response = await fetch(
      'https://api.linkedin.com/v2/ugcPosts',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'X-Restli-Protocol-Version': '2.0.0'
        },
        body: JSON.stringify({
          author: personUrn,
          lifecycleState: 'PUBLISHED',
          specificContent: {
            'com.linkedin.ugc.ShareContent': {
              shareCommentary: {
                text: content
              },
              shareMediaCategory: 'ARTICLE',
              media: [
                {
                  status: 'READY',
                  originalUrl: primaryUrl
                }
              ]
            }
          },
          visibility: {
            'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
          }
        })
      }
    );

    if (!response.ok) {
      const error = await response.json() as { message?: string };
      throw new Error(error.message || 'LinkedIn API error');
    }

    const data = await response.json() as { id: string };

    return {
      success: true,
      postId: data.id,
      platform: 'linkedin',
      postedAt: new Date().toISOString()
    };

  } catch (error) {
    console.error('LinkedIn posting error:', error);
    throw error;
  }
}

/**
 * Post to Instagram (via Graph API - requires Business account)
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function postToInstagram(_episode: Episode, _customMessage?: string): Promise<PostResult> {
  try {
    // Instagram doesn't support link posts in the same way
    // This would require creating a media post and putting link in bio
    // or using Instagram Stories with link stickers (requires 10k+ followers)
    
    throw new Error('Instagram link posting requires manual implementation via Instagram Business API');

  } catch (error) {
    console.error('Instagram posting error:', error);
    throw error;
  }
}

/**
 * Post to Threads (Meta's Twitter alternative)
 */
async function postToThreads(episode: Episode, customMessage?: string): Promise<PostResult> {
  try {
    const accessToken = process.env.THREADS_ACCESS_TOKEN;
    const userId = process.env.THREADS_USER_ID;

    if (!accessToken || !userId) {
      throw new Error('Threads credentials not configured');
    }

    const primaryUrl = episode.youtubeUrl || episode.rumbleUrl || episode.spotifyUrl || '';
    const content = customMessage || generateThreadsContent(episode, primaryUrl);

    // Create Threads post
    const response = await fetch(
      `https://graph.threads.net/v1.0/${userId}/threads`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          media_type: 'TEXT',
          text: content,
          access_token: accessToken
        })
      }
    );

    if (!response.ok) {
      const error = await response.json() as { error?: { message?: string } };
      throw new Error(error.error?.message || 'Threads API error');
    }

    const data = await response.json() as { id: string };

    // Publish the thread
    const publishResponse = await fetch(
      `https://graph.threads.net/v1.0/${userId}/threads_publish`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          creation_id: data.id,
          access_token: accessToken
        })
      }
    );

    const publishData = await publishResponse.json() as { id: string };

    return {
      success: true,
      postId: publishData.id,
      platform: 'threads',
      postedAt: new Date().toISOString()
    };

  } catch (error) {
    console.error('Threads posting error:', error);
    throw error;
  }
}

/**
 * Content generators for each platform
 */
function generateTwitterContent(episode: Episode, url: string): string {
  const hashtags = '#AINow #AI #Technology #Podcast';
  let content = `🎙️ ${episode.title}\n\n`;
  
  if (episode.description) {
    const excerpt = episode.description.substring(0, 150);
    content += `${excerpt}...\n\n`;
  }
  
  if (url) {
    content += `🔗 Watch: ${url}\n\n`;
  }
  
  content += hashtags;
  
  // Twitter max length is 280
  if (content.length > 280) {
    content = content.substring(0, 277) + '...';
  }
  
  return content;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function generateFacebookContent(episode: Episode, _url: string): string {
  let content = `🎙️ New Episode: ${episode.title}\n\n`;
  content += `${episode.description}\n\n`;
  content += `🔗 Watch the full episode at the link below!\n\n`;
  content += `#AINow #ArtificialIntelligence #Technology #Innovation #Podcast`;
  
  return content;
}

function generateLinkedInContent(episode: Episode, url: string): string {
  let content = `🎙️ New AI-Now Episode: ${episode.title}\n\n`;
  content += `${episode.description}\n\n`;
  content += `📊 This episode covers the latest developments in artificial intelligence, machine learning, and emerging technologies that are shaping our future.\n\n`;
  content += `🔗 Watch the full episode: ${url}\n\n`;
  content += `#AI #ArtificialIntelligence #Technology #Innovation #MachineLearning #FutureOfWork #DigitalTransformation`;
  
  return content;
}

function generateThreadsContent(episode: Episode, url: string): string {
  let content = `🎙️ ${episode.title}\n\n`;
  content += `${episode.description.substring(0, 200)}...\n\n`;
  content += `🔗 ${url}\n\n`;
  content += `#AINow #AI #Tech`;
  
  return content;
}

/**
 * GET /api/social-post
 * Get available platforms and their status
 */
export async function GET() {
  const platforms = [
    {
      id: 'twitter',
      name: 'X (Twitter)',
      configured: !!(process.env.TWITTER_API_KEY && process.env.TWITTER_ACCESS_TOKEN),
      icon: '𝕏'
    },
    {
      id: 'facebook',
      name: 'Facebook',
      configured: !!(process.env.FACEBOOK_PAGE_ACCESS_TOKEN && process.env.FACEBOOK_PAGE_ID),
      icon: '📘'
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      configured: !!(process.env.LINKEDIN_ACCESS_TOKEN && process.env.LINKEDIN_PERSON_URN),
      icon: '💼'
    },
    {
      id: 'instagram',
      name: 'Instagram',
      configured: false,
      icon: '📸',
      note: 'Requires manual setup'
    },
    {
      id: 'threads',
      name: 'Threads',
      configured: !!(process.env.THREADS_ACCESS_TOKEN && process.env.THREADS_USER_ID),
      icon: '🧵'
    }
  ];

  return NextResponse.json({
    platforms,
    configured: platforms.filter(p => p.configured).length,
    total: platforms.length
  });
}
