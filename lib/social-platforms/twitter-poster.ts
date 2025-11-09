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

interface PostResult {
  id: string
  url: string
}

/**
 * Get Twitter username from credentials (needed for URL construction)
 * This is a helper that extracts username from the access token or uses default
 */
function getTwitterUsername(accountType: 'v2u' | 'ainow'): string {
  return accountType === 'v2u' ? 'V2U_now' : 'AI_Now'
}

/**
 * Post a tweet to Twitter/X
 */
export async function postTweet(
  credentials: TwitterCredentials, 
  text: string, 
  accountType: 'v2u' | 'ainow' = 'v2u'
): Promise<PostResult> {
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
    
    const username = getTwitterUsername(accountType)
    const url = `https://twitter.com/${username}/status/${tweet.data.id}`
    
    console.log('✅ Tweet posted successfully:', tweet.data.id, url)
    
    return {
      id: tweet.data.id,
      url
    }
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
  video: TweetContent,
  accountType: 'v2u' | 'ainow' = 'v2u'
): Promise<PostResult> {
  const tweetText = formatYouTubeTweet(video)
  return await postTweet(credentials, tweetText, accountType)
}
