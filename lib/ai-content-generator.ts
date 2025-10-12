import OpenAI from 'openai'

interface NewsTopic {
  title: string
  summary: string
  content: string
  tags: string[]
}

interface ContentGenerationResult {
  success: boolean
  topics?: NewsTopic[]
  error?: string
}

class AIContentGenerator {
  private client: OpenAI | null = null
  private isInitialized = false

  constructor() {
    this.initializeClient()
  }

  private initializeClient() {
    try {
      const apiKey = process.env.OPENAI_API_KEY
      if (!apiKey) {
        console.warn('OpenAI API key not configured')
        return
      }

      this.client = new OpenAI({
        apiKey: apiKey
      })
      this.isInitialized = true
      console.log('OpenAI client initialized successfully')
    } catch (error) {
      console.error('Failed to initialize OpenAI client:', error)
    }
  }

  async generateNewsTopics(count: number = 3): Promise<ContentGenerationResult> {
    if (!this.isInitialized || !this.client) {
      return {
        success: false,
        error: 'OpenAI client not initialized'
      }
    }

    try {
      const prompt = `Generate ${count} current AI and technology news topics that would be interesting for a tech-savvy audience. For each topic, provide:

1. A compelling headline (under 100 characters)
2. A brief summary (2-3 sentences)
3. Key discussion points or insights
4. Relevant hashtags/tags

Focus on emerging trends, breakthroughs, and industry developments in AI, machine learning, robotics, and related technologies. Make the content engaging and suitable for social media sharing.

Format your response as a JSON array of objects with keys: title, summary, content, tags.`

      const completion = await this.client.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert AI and technology journalist who creates engaging, accurate content about emerging tech trends.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.7
      })

      const response = completion.choices[0]?.message?.content
      if (!response) {
        return {
          success: false,
          error: 'No response from OpenAI'
        }
      }

      // Parse the JSON response
      const topics: NewsTopic[] = JSON.parse(response)

      // Validate the response structure
      if (!Array.isArray(topics) || topics.length === 0) {
        return {
          success: false,
          error: 'Invalid response format from OpenAI'
        }
      }

      return {
        success: true,
        topics: topics.slice(0, count) // Ensure we don't exceed requested count
      }
    } catch (error: unknown) {
      console.error('OpenAI API error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate content'
      }
    }
  }

  async generateTweetContent(topic: NewsTopic): Promise<string> {
    if (!this.isInitialized || !this.client) {
      throw new Error('OpenAI client not initialized')
    }

    try {
      const prompt = `Create an engaging tweet about this AI/tech topic:

Title: ${topic.title}
Summary: ${topic.summary}

Create a tweet (under 280 characters) that:
- Hooks the reader immediately
- Includes key insights
- Uses relevant hashtags
- Encourages engagement

Make it conversational and exciting!`

      const completion = await this.client.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a social media expert who creates viral tech tweets.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 150,
        temperature: 0.8
      })

      const tweet = completion.choices[0]?.message?.content?.trim()
      if (!tweet) {
        throw new Error('No tweet content generated')
      }

      return tweet
    } catch (error: unknown) {
      console.error('Tweet generation error:', error)
      throw error instanceof Error ? error : new Error('Tweet generation failed')
    }
  }

  isReady(): boolean {
    return this.isInitialized
  }
}

// Export singleton instance
export const aiContentGenerator = new AIContentGenerator()
export default aiContentGenerator