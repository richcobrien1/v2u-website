/**
 * Facebook Pages API Integration
 */

interface FacebookCredentials {
  pageId: string;
  pageAccessToken: string;
}

interface PostContent {
  platform: string;
  title: string;
  description: string;
  url: string;
  thumbnail?: string;
}

/**
 * Post to Facebook Page
 */
export async function postToFacebook(
  credentials: FacebookCredentials,
  content: PostContent
): Promise<{ success: boolean; postId?: string; url?: string; error?: string }> {
  try {
    const { pageId, pageAccessToken } = credentials;

    // Validate credentials
    if (!pageId || !pageAccessToken) {
      return { success: false, error: 'Missing Facebook credentials' };
    }

    // Generate post message
    const emoji = content.platform === 'youtube' ? '🎥' : content.platform === 'spotify' ? '🎙️' : '📹';
    const platformName = content.platform === 'youtube' ? 'YouTube' : 
                        content.platform === 'spotify' ? 'Spotify' : 
                        'Rumble';
    
    let message = `${emoji} New on ${platformName}: ${content.title}\n\n`;
    message += content.description + '\n\n';
    message += `Watch here: ${content.url}\n\n`;
    message += `#AINow #AI #Technology #Podcast`;

    // Facebook Graph API endpoint
    const apiUrl = `https://graph.facebook.com/v18.0/${pageId}/feed`;

    // Post to page feed
    const params = new URLSearchParams({
      message: message,
      link: content.url,
      access_token: pageAccessToken
    });

    const response = await fetch(apiUrl, {
      method: 'POST',
      body: params
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Facebook API error:', errorData);
      return { 
        success: false, 
        error: `Facebook API error: ${response.status} - ${JSON.stringify(errorData)}` 
      };
    }

    const data = await response.json() as { id: string };
    const postId = data.id;

    // Extract post ID from format "pageId_postId"
    const actualPostId = postId.split('_')[1] || postId;

    return {
      success: true,
      postId: actualPostId,
      url: `https://www.facebook.com/${pageId}/posts/${actualPostId}`
    };
  } catch (error) {
    console.error('Facebook posting error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
