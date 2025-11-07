/**
 * YouTube API Helper
 * Checks for new videos and retrieves metadata
 */

interface YouTubeVideo {
  id: string
  title: string
  description: string
  publishedAt: string
  thumbnailUrl: string
  url: string
}

interface YouTubeCredentials {
  apiKey: string
  channelId: string
}

/**
 * Get the latest video from a YouTube channel
 */
export async function getLatestYouTubeVideo(credentials: YouTubeCredentials): Promise<YouTubeVideo | null> {
  const { apiKey, channelId } = credentials

  if (!apiKey || !channelId) {
    throw new Error('YouTube API key and channel ID are required')
  }

  try {
    // Get the uploads playlist ID (it's always UC... replaced with UU...)
    const uploadsPlaylistId = channelId.replace('UC', 'UU')

    // Fetch the latest video from the uploads playlist
    const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=1&order=date&key=${apiKey}`
    
    const response = await fetch(url)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('YouTube API error:', response.status, errorText)
      throw new Error(`YouTube API request failed: ${response.status}`)
    }

    const data = await response.json() as {
      items?: Array<{
        snippet: {
          resourceId: { videoId: string }
          title: string
          description: string
          publishedAt: string
          thumbnails?: {
            high?: { url: string }
            default?: { url: string }
          }
        }
      }>
    }

    if (!data.items || data.items.length === 0) {
      return null
    }

    const item = data.items[0]
    const snippet = item.snippet

    return {
      id: snippet.resourceId.videoId,
      title: snippet.title,
      description: snippet.description,
      publishedAt: snippet.publishedAt,
      thumbnailUrl: snippet.thumbnails?.high?.url || snippet.thumbnails?.default?.url || '',
      url: `https://www.youtube.com/watch?v=${snippet.resourceId.videoId}`
    }
  } catch (error) {
    console.error('Error fetching YouTube video:', error)
    throw error
  }
}

/**
 * Check if a video was published within the last N hours
 */
export function isVideoRecent(publishedAt: string, hoursAgo: number = 2): boolean {
  const publishedDate = new Date(publishedAt)
  const cutoffDate = new Date(Date.now() - hoursAgo * 60 * 60 * 1000)
  return publishedDate >= cutoffDate
}

/**
 * Check if we've already posted about this video
 */
export async function hasPostedVideo(videoId: string, kv: any): Promise<boolean> {
  const key = `posted:youtube:${videoId}`
  const posted = await kv.get(key)
  return !!posted
}

/**
 * Mark a video as posted
 */
export async function markVideoAsPosted(videoId: string, kv: any): Promise<void> {
  const key = `posted:youtube:${videoId}`
  const data = {
    videoId,
    postedAt: new Date().toISOString()
  }
  await kv.set(key, JSON.stringify(data))
}
