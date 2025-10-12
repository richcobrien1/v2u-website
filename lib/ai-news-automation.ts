import { aiContentGenerator } from './ai-content-generator'
import { twitterService } from './twitter-service'

interface AutomationResult {
  success: boolean
  topicsGenerated?: number
  tweetsPosted?: number
  errors?: string[]
  details?: string
}

class AINewsAutomation {
  async runAutomation(): Promise<AutomationResult> {
    const result: AutomationResult = {
      success: false,
      topicsGenerated: 0,
      tweetsPosted: 0,
      errors: []
    }

    try {
      console.log('Starting AI News automation...')

      // Step 1: Generate AI news topics
      console.log('Gathering and processing real AI/tech news articles...')
      const contentResult = await aiContentGenerator.generateNewsTopics(8) // Gather 8-10 articles

      if (!contentResult.success || !contentResult.articles) {
        result.errors?.push(`Content generation failed: ${contentResult.error}`)
        return result
      }

      result.topicsGenerated = contentResult.articles.length
      console.log(`Processed ${result.topicsGenerated} real news articles from ${new Set(contentResult.articles.map(a => a.source)).size} sources`)

      // Step 2: Post to Twitter
      if (twitterService.isReady()) {
        console.log('Posting to Twitter...')

        for (const article of contentResult.articles) {
          try {
            // Generate tweet content for this article
            const tweetContent = await aiContentGenerator.generateTweetContent(article)
            console.log(`Generated tweet: ${tweetContent.substring(0, 50)}...`)

            // Post the tweet
            const tweetResult = await twitterService.postTweet(tweetContent)

            if (tweetResult.success) {
              result.tweetsPosted = (result.tweetsPosted || 0) + 1
              console.log(`Posted tweet successfully: ${tweetResult.tweetId}`)
            } else {
              result.errors?.push(`Twitter posting failed: ${tweetResult.error}`)
              console.error(`Failed to post tweet: ${tweetResult.error}`)
            }

            // Small delay between tweets
            await new Promise(resolve => setTimeout(resolve, 2000))
          } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown tweet error'
            result.errors?.push(`Tweet generation/posting error: ${errorMessage}`)
            console.error('Tweet processing error:', errorMessage)
          }
        }
      } else {
        result.errors?.push('Twitter service not available')
        console.warn('Twitter service not initialized, skipping Twitter posting')
      }

      // Step 3: Send email notifications (placeholder for now)
      console.log('Sending email notifications...')
      // TODO: Implement email notifications

      result.success = (result.tweetsPosted || 0) > 0
      result.details = `Generated ${result.topicsGenerated} topics, posted ${result.tweetsPosted} tweets`

      console.log(`Automation completed: ${result.details}`)
      return result

    } catch (error: unknown) {
      console.error('Automation error:', error)
      result.errors?.push(`Automation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      return result
    }
  }

  async runManualAutomation(): Promise<AutomationResult> {
    // For manual runs, we can be more verbose and include more details
    console.log('Running manual AI News automation...')
    return await this.runAutomation()
  }
}

// Export singleton instance
export const aiNewsAutomation = new AINewsAutomation()
export default aiNewsAutomation