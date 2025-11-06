/**
 * LinkedIn API Integration
 */

interface LinkedInCredentials {
  clientId: string;
  clientSecret: string;
  accessToken: string;
}

interface PostContent {
  platform: string;
  title: string;
  description: string;
  url: string;
  thumbnail?: string;
}

/**
 * Get LinkedIn user ID (person URN)
 */
async function getLinkedInUserId(accessToken: string): Promise<string | null> {
  try {
    const response = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      console.error('LinkedIn userinfo error:', response.status);
      return null;
    }

    const data = await response.json() as { sub: string };
    return data.sub;
  } catch (error) {
    console.error('Failed to get LinkedIn user ID:', error);
    return null;
  }
}

/**
 * Post to LinkedIn
 */
export async function postToLinkedIn(
  credentials: LinkedInCredentials,
  content: PostContent
): Promise<{ success: boolean; postId?: string; url?: string; error?: string }> {
  try {
    const { accessToken } = credentials;

    // Validate credentials
    if (!accessToken) {
      return { success: false, error: 'Missing LinkedIn credentials' };
    }

    // Get user ID
    const userId = await getLinkedInUserId(accessToken);
    if (!userId) {
      return { success: false, error: 'Failed to get LinkedIn user ID' };
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

    // LinkedIn API v2 endpoint
    const apiUrl = 'https://api.linkedin.com/v2/ugcPosts';

    // Create post payload
    const postData = {
      author: `urn:li:person:${userId}`,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: {
            text: message
          },
          shareMediaCategory: 'ARTICLE',
          media: [
            {
              status: 'READY',
              originalUrl: content.url,
              title: {
                text: content.title
              },
              description: {
                text: content.description.substring(0, 256)
              }
            }
          ]
        }
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
      }
    };

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0'
      },
      body: JSON.stringify(postData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('LinkedIn API error:', errorData);
      return { 
        success: false, 
        error: `LinkedIn API error: ${response.status} - ${JSON.stringify(errorData)}` 
      };
    }

    const data = await response.json() as { id: string };
    const postId = data.id;

    return {
      success: true,
      postId,
      url: `https://www.linkedin.com/feed/update/${postId}`
    };
  } catch (error) {
    console.error('LinkedIn posting error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
