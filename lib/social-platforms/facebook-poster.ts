/**
 * Facebook API Helper
 * Posts to Facebook Pages using Meta Graph API
 * Based on news-collector/facebook-poster.js pattern
 */

interface FacebookCredentials {
  pageId: string
  accessToken: string
}

interface PostContent {
  title: string
  url: string
  thumbnailUrl?: string
  description?: string
}

/**
 * Create a formatted Facebook post about new content
 */
export function formatFacebookPost(content: PostContent, isSpotify: boolean = false): string {
  const emoji = isSpotify ? '🎙️' : '🎥'
  const prefix = isSpotify ? 'New Episode:' : 'New Video:'
  
  let postText = `${emoji} ${prefix} ${content.title}\n\n`
  postText += `${isSpotify ? 'Latest podcast episode' : 'New video'} is now available!\n\n`
  
  // Add description excerpt if available
  if (content.description) {
    const excerpt = content.description.substring(0, 300)
    postText += `${excerpt}${content.description.length > 300 ? '...' : ''}\n\n`
  }
  
  postText += `🔗 ${isSpotify ? 'Listen' : 'Watch'} now: ${content.url}\n\n`
  
  // Add hashtags
  postText += '#AI #ArtificialIntelligence #MachineLearning #Technology #Innovation'
  
  // Facebook allows long posts but keep it reasonable
  if (postText.length > 2000) {
    postText = postText.substring(0, 1997) + '...'
  }
  
  return postText
}

/**
 * Post to a Facebook Page using Graph API v21.0
 */
export async function postToFacebook(
  credentials: FacebookCredentials,
  message: string,
  link?: string
): Promise<string> {
  const { pageId, accessToken } = credentials

  if (!pageId || !accessToken) {
    throw new Error('Facebook Page ID and Access Token are required')
  }

  try {
    // Build request body
    const body: Record<string, string> = {
      message,
      access_token: accessToken,
    }
    
    if (link) {
      body.link = link
    }

    // Post to Facebook Page using Graph API
    const response = await fetch(
      `https://graph.facebook.com/v21.0/${pageId}/feed`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(body).toString(),
      }
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Facebook API error: ${JSON.stringify(error)}`)
    }

    const data = await response.json() as { id: string }
    
    console.log('✅ Facebook post published successfully:', data.id)
    
    return data.id
  } catch (error) {
    console.error('❌ Error posting to Facebook:', error)
    throw error
  }
}

/**
 * Post content announcement to Facebook
 */
export async function postContentToFacebook(
  credentials: FacebookCredentials,
  content: PostContent,
  isSpotify: boolean = false
): Promise<string> {
  const postText = formatFacebookPost(content, isSpotify)
  return await postToFacebook(credentials, postText, content.url)
}
