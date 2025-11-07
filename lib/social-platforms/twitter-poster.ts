/**
 * Twitter/X API Helper
 * Posts tweets using Twitter API v2
 */

import { TwitterApi } from 'twitter-api-v2'

interface TwitterCredentials {
  appKey: string
  appSecret: string
  accessToken: string
  accessSecret: string
}

interface TweetContent {
  title: string
  url: string
  thumbnailUrl?: string
}

/**
 * Create a formatted tweet about new YouTube content
 */
export function formatYouTubeTweet(video: TweetContent): string {
  const maxLength = 280
  const urlLength = 23 // Twitter counts all URLs as 23 chars
  const ellipsis = '...'
  
  // Structure: "🎥 New Video: [TITLE]\n\n[URL]"
  const prefix = '🎥 New Video: '
  const newlines = '\n\n'
  
  // Calculate available space for title
  const availableForTitle = maxLength - prefix.length - newlines.length - urlLength
  
  let title = video.title
  if (title.length > availableForTitle) {
    title = title.substring(0, availableForTitle - ellipsis.length) + ellipsis
  }
  
  return `${prefix}${title}${newlines}${video.url}`
}

/**
 * Post a tweet to Twitter/X
 */
export async function postTweet(credentials: TwitterCredentials, text: string): Promise<string> {
  const { appKey, appSecret, accessToken, accessSecret } = credentials

  if (!appKey || !appSecret || !accessToken || !accessSecret) {
    throw new Error('All Twitter credentials are required')
  }

  try {
    // Initialize Twitter client
    const client = new TwitterApi({
      appKey,
      appSecret,
      accessToken,
      accessSecret,
    })

    // Post the tweet
    const tweet = await client.v2.tweet(text)
    
    console.log('✅ Tweet posted successfully:', tweet.data.id)
    
    return tweet.data.id
  } catch (error) {
    console.error('❌ Error posting tweet:', error)
    throw error
  }
}

/**
 * Post a YouTube video announcement to Twitter
 */
export async function postYouTubeToTwitter(
  credentials: TwitterCredentials,
  video: TweetContent
): Promise<string> {
  const tweetText = formatYouTubeTweet(video)
  return await postTweet(credentials, tweetText)
}
