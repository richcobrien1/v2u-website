/**
 * LinkedIn API Helper
 * Posts to LinkedIn using LinkedIn Share API
 * Based on news-collector/linkedin-poster.js pattern
 */

interface LinkedInCredentials {
  accessToken: string
}

interface PostContent {
  title: string
  url: string
  thumbnailUrl?: string
  description?: string
}

/**
 * Create a formatted LinkedIn post about new content
 */
export function formatLinkedInPost(content: PostContent): string {
  let postText = `🎥 New Video: ${content.title}\n\n`
  postText += `Latest insights in AI and emerging technologies.\n\n`
  
  // Add description excerpt if available
  if (content.description) {
    const excerpt = content.description.split('\n')[0].substring(0, 150)
    postText += `${excerpt}...\n\n`
  }
  
  postText += `▶️ Watch the full episode: ${content.url}\n\n`
  postText += `#AI #ArtificialIntelligence #MachineLearning #Technology #Innovation`
  postText += `\n\n#TechInnovation #ProfessionalDevelopment`
  
  // LinkedIn has a 3000 character limit
  if (postText.length > 3000) {
    postText = postText.substring(0, 2997) + '...'
  }
  
  return postText
}

/**
 * Get LinkedIn user profile (person URN)
 */
async function getLinkedInUserProfile(accessToken: string): Promise<string> {
  try {
    const response = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`LinkedIn API error: ${JSON.stringify(error)}`)
    }

    const data = await response.json() as { sub: string }
    return data.sub // Returns person URN like "urn:li:person:abc123"
  } catch (error) {
    console.error('❌ Error fetching LinkedIn profile:', error)
    throw error
  }
}

/**
 * Post to LinkedIn using UGC Posts API
 */
export async function postToLinkedIn(
  credentials: LinkedInCredentials,
  text: string
): Promise<string> {
  const { accessToken } = credentials

  if (!accessToken) {
    throw new Error('LinkedIn Access Token is required')
  }

  try {
    // Get user profile to get person URN
    const personUrn = await getLinkedInUserProfile(accessToken)

    // Create post using LinkedIn UGC API
    const response = await fetch('https://api.linkedin.com/v2/ugcPosts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0',
      },
      body: JSON.stringify({
        author: personUrn,
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: {
              text,
            },
            shareMediaCategory: 'NONE',
          },
        },
        visibility: {
          'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
        },
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`LinkedIn API error: ${JSON.stringify(error)}`)
    }

    const data = await response.json() as { id: string }
    
    console.log('✅ LinkedIn post published successfully:', data.id)
    
    return data.id
  } catch (error) {
    console.error('❌ Error posting to LinkedIn:', error)
    throw error
  }
}

/**
 * Post YouTube video announcement to LinkedIn
 */
export async function postYouTubeToLinkedIn(
  credentials: LinkedInCredentials,
  video: PostContent
): Promise<string> {
  const postText = formatLinkedInPost(video)
  return await postToLinkedIn(credentials, postText)
}
