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
 * Get recent videos from a YouTube channel (for backfilling missed posts)
 * @param credentials - YouTube API credentials
 * @param maxResults - Maximum number of videos to fetch (default: 10)
 * @param daysBack - How many days back to check (default: 7)
 * @returns Array of recent videos, sorted oldest to newest
 */
export async function getRecentYouTubeVideos(
  credentials: YouTubeCredentials,
  maxResults: number = 10,
  daysBack: number = 7
): Promise<YouTubeVideo[]> {
  const { apiKey, channelId } = credentials

  if (!apiKey || !channelId) {
    throw new Error('YouTube API key and channel ID are required')
  }

  try {
    // Get the uploads playlist ID (it's always UC... replaced with UU...)
    const uploadsPlaylistId = channelId.replace('UC', 'UU')

    // Fetch recent videos from the uploads playlist
    const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=${maxResults}&order=date&key=${apiKey}`
    
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
      return []
    }

    // Filter videos published within daysBack
    const cutoffDate = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000)
    
    const recentVideos = data.items
      .filter(item => {
        const publishedDate = new Date(item.snippet.publishedAt)
        return publishedDate >= cutoffDate
      })
      .map(item => ({
        id: item.snippet.resourceId.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        publishedAt: item.snippet.publishedAt,
        thumbnailUrl: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url || '',
        url: `https://www.youtube.com/watch?v=${item.snippet.resourceId.videoId}`
      }))

    // Sort oldest to newest (so we post in chronological order)
    return recentVideos.sort((a, b) => 
      new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime()
    )
  } catch (error) {
    console.error('Error fetching recent YouTube videos:', error)
    throw error
  }
}

/**
 * Check if a video was published within the last N hours
 */
export function isVideoRecent(publishedAt: string, hoursAgo: number = 24): boolean {
  const publishedDate = new Date(publishedAt)
  const cutoffDate = new Date(Date.now() - hoursAgo * 60 * 60 * 1000)
  return publishedDate >= cutoffDate
}

/**
 * Check if we've already posted about this video
 */
export async function hasPostedVideo(videoId: string, kvStorage: { hasPostedVideo: (id: string) => Promise<boolean> }): Promise<boolean> {
  return await kvStorage.hasPostedVideo(videoId)
}

/**
 * Mark a video as posted
 */
export async function markVideoAsPosted(videoId: string, kvStorage: { markVideoAsPosted: (id: string) => Promise<void> }): Promise<void> {
  await kvStorage.markVideoAsPosted(videoId)
}
