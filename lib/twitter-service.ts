import { TwitterApi } from 'twitter-api-v2'

interface TwitterConfig {
  appKey: string
  appSecret: string
  accessToken: string
  accessSecret: string
}

interface TweetResult {
  success: boolean
  tweetId?: string
  error?: string
}

class TwitterService {
  private client: TwitterApi | null = null
  private isInitialized = false

  constructor() {
    this.initializeClient()
  }

  private initializeClient() {
    try {
      const config: TwitterConfig = {
        appKey: process.env.TWITTER_API_KEY!,
        appSecret: process.env.TWITTER_API_SECRET!,
        accessToken: process.env.TWITTER_ACCESS_TOKEN!,
        accessSecret: process.env.TWITTER_ACCESS_SECRET!
      }

      // Check if all required environment variables are set
      if (!config.appKey || !config.appSecret || !config.accessToken || !config.accessSecret) {
        console.warn('Twitter API credentials not fully configured')
        return
      }

      this.client = new TwitterApi(config)
      this.isInitialized = true
      console.log('Twitter API client initialized successfully')
    } catch (error) {
      console.error('Failed to initialize Twitter API client:', error)
    }
  }

  async postTweet(content: string): Promise<TweetResult> {
    if (!this.isInitialized || !this.client) {
      return {
        success: false,
        error: 'Twitter API client not initialized'
      }
    }

    try {
      // Validate tweet content
      if (!content || content.length === 0) {
        return {
          success: false,
          error: 'Tweet content cannot be empty'
        }
      }

      if (content.length > 280) {
        return {
          success: false,
          error: `Tweet content too long: ${content.length}/280 characters`
        }
      }

      // Post the tweet
      const tweet = await this.client.v2.tweet(content)

      return {
        success: true,
        tweetId: tweet.data.id
      }
    } catch (error: unknown) {
      console.error('Twitter API error:', error)

      // Handle specific Twitter API errors
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      if (errorMessage.includes('429') || errorMessage.includes('rate limit')) {
        return {
          success: false,
          error: 'Rate limit exceeded. Please try again later.'
        }
      }

      if (errorMessage.includes('403') || errorMessage.includes('duplicate')) {
        return {
          success: false,
          error: 'Tweet was rejected by Twitter (possibly duplicate content or spam)'
        }
      }

      return {
        success: false,
        error: errorMessage
      }
    }
  }

  async postThread(tweets: string[]): Promise<TweetResult[]> {
    if (!this.isInitialized || !this.client) {
      return tweets.map(() => ({
        success: false,
        error: 'Twitter API client not initialized'
      }))
    }

    const results: TweetResult[] = []
    let previousTweetId: string | undefined

    for (const content of tweets) {
      try {
        const tweet = previousTweetId
          ? await this.client.v2.reply(content, previousTweetId)
          : await this.client.v2.tweet(content)

        results.push({
          success: true,
          tweetId: tweet.data.id
        })

        previousTweetId = tweet.data.id

        // Small delay between tweets to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 1000))
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to post tweet in thread'
        results.push({
          success: false,
          error: errorMessage
        })
        break // Stop the thread if one tweet fails
      }
    }

    return results
  }

  isReady(): boolean {
    return this.isInitialized
  }
}

// Export singleton instance
export const twitterService = new TwitterService()
export default twitterService