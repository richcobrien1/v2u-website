import OpenAI from 'openai'
import Parser from 'rss-parser'
import { google } from 'googleapis'

interface NewsArticle {
  title: string
  summary: string
  content: string
  url: string
  source: string
  publishedAt: string
  tags: string[]
}

interface ContentGenerationResult {
  success: boolean
  articles?: NewsArticle[]
  error?: string
}

interface NewsSource {
  name: string
  type: 'rss' | 'scrape' | 'youtube'
  url: string
  rssUrl?: string
  selectors?: {
    title?: string
    content?: string
    date?: string
  }
}

class RealNewsGatherer {
  private rssParser = new Parser()
  private youtubeClient: ReturnType<typeof google.youtube> | null = null
  private isInitialized = false

  constructor() {
    this.initializeServices()
  }

  private initializeServices() {
    try {
      // Initialize YouTube API if key is available
      const youtubeApiKey = process.env.YOUTUBE_API_KEY
      if (youtubeApiKey) {
        this.youtubeClient = google.youtube({
          version: 'v3',
          auth: youtubeApiKey
        })
      }

      this.isInitialized = true
      console.log('Real news gatherer initialized')
    } catch (error) {
      console.error('Failed to initialize news gatherer:', error)
    }
  }

  // Define AI/tech news sources
  private newsSources: NewsSource[] = [
    // RSS feeds
    {
      name: 'MIT Technology Review',
      type: 'rss',
      url: 'https://www.technologyreview.com',
      rssUrl: 'https://www.technologyreview.com/topnews.rss'
    },
    {
      name: 'VentureBeat AI',
      type: 'rss',
      url: 'https://venturebeat.com',
      rssUrl: 'https://feeds.venturebeat.com/VentureBeat-AI'
    },
    {
      name: 'Ars Technica',
      type: 'rss',
      url: 'https://arstechnica.com',
      rssUrl: 'https://feeds.arstechnica.com/arstechnica/index'
    },
    // YouTube channels
    {
      name: 'MIT Technology Review',
      type: 'youtube',
      url: 'https://www.youtube.com/@MITTechnologyReview'
    },
    {
      name: 'Two Minute Papers',
      type: 'youtube',
      url: 'https://www.youtube.com/@TwoMinutePapers'
    },
    {
      name: 'AI Explained',
      type: 'youtube',
      url: 'https://www.youtube.com/@AIExplainedOfficial'
    }
  ]

  async gatherNewsArticles(): Promise<ContentGenerationResult> {
    if (!this.isInitialized) {
      return {
        success: false,
        error: 'News gatherer not initialized'
      }
    }

    try {
      const allArticles: NewsArticle[] = []

      // Gather from RSS feeds
      for (const source of this.newsSources.filter(s => s.type === 'rss')) {
        try {
          const rssArticles = await this.gatherFromRSS(source)
          allArticles.push(...rssArticles)
        } catch (error) {
          console.warn(`Failed to gather from ${source.name}:`, error)
        }
      }

      // Gather from YouTube
      for (const source of this.newsSources.filter(s => s.type === 'youtube')) {
        try {
          const youtubeArticles = await this.gatherFromYouTube(source)
          allArticles.push(...youtubeArticles)
        } catch (error) {
          console.warn(`Failed to gather from ${source.name} YouTube:`, error)
        }
      }

      // Sort by date and deduplicate
      const uniqueArticles = this.deduplicateArticles(
        allArticles.sort((a, b) =>
          new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
        )
      )

      // Take top 10-12 most recent articles
      const topArticles = uniqueArticles.slice(0, 12)

      console.log(`Gathered ${topArticles.length} unique AI/tech news articles`)

      return {
        success: true,
        articles: topArticles
      }
    } catch (error: unknown) {
      console.error('News gathering error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to gather news'
      }
    }
  }

  private async gatherFromRSS(source: NewsSource): Promise<NewsArticle[]> {
    if (!source.rssUrl) return []

    try {
      const feed = await this.rssParser.parseURL(source.rssUrl)
      const articles: NewsArticle[] = []

      for (const item of feed.items?.slice(0, 5) || []) { // Take latest 5 from each source
        if (item.title && item.link && item.contentSnippet) {
          // Check if it's AI/tech related
          const content = `${item.title} ${item.contentSnippet}`.toLowerCase()
          if (this.isAIRelated(content)) {
            articles.push({
              title: item.title,
              summary: item.contentSnippet,
              content: item.content || item.contentSnippet,
              url: item.link,
              source: source.name,
              publishedAt: item.pubDate || new Date().toISOString(),
              tags: this.extractTags(content)
            })
          }
        }
      }

      return articles
    } catch (error) {
      console.error(`RSS gathering error for ${source.name}:`, error)
      return []
    }
  }

  private async gatherFromYouTube(source: NewsSource): Promise<NewsArticle[]> {
    if (!this.youtubeClient) return []

    try {
      // Extract channel ID from URL
      const channelId = this.extractYouTubeChannelId(source.url)
      if (!channelId) return []

      const response = await this.youtubeClient.search.list({
        part: ['snippet'],
        channelId: channelId,
        order: 'date',
        type: ['video'],
        maxResults: 3,
        publishedAfter: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      })

      const articles: NewsArticle[] = []

      for (const item of response.data.items || []) {
        const title = item.snippet?.title || ''
        const description = item.snippet?.description || ''

        // Check if AI/tech related
        const content = `${title} ${description}`.toLowerCase()
        if (this.isAIRelated(content)) {
          articles.push({
            title: title,
            summary: description.substring(0, 200) + '...',
            content: description,
            url: `https://www.youtube.com/watch?v=${item.id?.videoId}`,
            source: `${source.name} (YouTube)`,
            publishedAt: item.snippet?.publishedAt || new Date().toISOString(),
            tags: this.extractTags(content)
          })
        }
      }

      return articles
    } catch (error) {
      console.error(`YouTube gathering error for ${source.name}:`, error)
      return []
    }
  }

  private extractYouTubeChannelId(url: string): string | null {
    // Handle different YouTube URL formats
    const patterns = [
      /youtube\.com\/@([^\/\?]+)/,
      /youtube\.com\/channel\/([^\/\?]+)/,
      /youtube\.com\/user\/([^\/\?]+)/
    ]

    for (const pattern of patterns) {
      const match = url.match(pattern)
      if (match) return match[1]
    }

    return null
  }

  private isAIRelated(content: string): boolean {
    const aiKeywords = [
      'artificial intelligence', 'ai', 'machine learning', 'ml', 'deep learning',
      'neural network', 'robotics', 'automation', 'gpt', 'llm', 'large language model',
      'computer vision', 'nlp', 'natural language processing', 'reinforcement learning',
      'generative ai', 'chatgpt', 'claude', 'gemini', 'anthropic', 'openai'
    ]

    return aiKeywords.some(keyword => content.includes(keyword))
  }

  private extractTags(content: string): string[] {
    const tags: string[] = []
    const contentLower = content.toLowerCase()

    // Extract relevant hashtags
    if (contentLower.includes('artificial intelligence') || contentLower.includes('ai')) tags.push('#AI')
    if (contentLower.includes('machine learning') || contentLower.includes('ml')) tags.push('#MachineLearning')
    if (contentLower.includes('deep learning')) tags.push('#DeepLearning')
    if (contentLower.includes('robotics')) tags.push('#Robotics')
    if (contentLower.includes('automation')) tags.push('#Automation')
    if (contentLower.includes('gpt') || contentLower.includes('llm')) tags.push('#LLM')
    if (contentLower.includes('openai')) tags.push('#OpenAI')
    if (contentLower.includes('anthropic')) tags.push('#Anthropic')

    return tags.slice(0, 3) // Max 3 tags
  }

  private deduplicateArticles(articles: NewsArticle[]): NewsArticle[] {
    const seen = new Set<string>()
    return articles.filter(article => {
      const key = `${article.title.toLowerCase()}-${article.source}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
  }
}

class AIContentGenerator {
  private client: OpenAI | null = null
  private newsGatherer: RealNewsGatherer
  private isInitialized = false

  constructor() {
    this.newsGatherer = new RealNewsGatherer()
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
    try {
      // First, gather real news articles
      console.log('Gathering real AI/tech news articles...')
      const newsResult = await this.newsGatherer.gatherNewsArticles()

      if (!newsResult.success || !newsResult.articles) {
        return {
          success: false,
          error: newsResult.error || 'Failed to gather news articles'
        }
      }

      const articles = newsResult.articles
      console.log(`Gathered ${articles.length} articles, selecting top ${count} for processing...`)

      // Select the most relevant articles (prioritize recent, diverse sources)
      const selectedArticles = this.selectBestArticles(articles, count)

      // Use OpenAI to create engaging summaries/tweets from real articles
      const processedTopics = await this.processArticlesWithAI(selectedArticles)

      return {
        success: true,
        articles: processedTopics
      }
    } catch (error: unknown) {
      console.error('Content generation error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate content'
      }
    }
  }

  private selectBestArticles(articles: NewsArticle[], count: number): NewsArticle[] {
    // Sort by recency and diversity
    const sorted = articles.sort((a, b) => {
      // Prefer more recent articles
      const dateDiff = new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      if (Math.abs(dateDiff) > 24 * 60 * 60 * 1000) { // More than 1 day difference
        return dateDiff
      }

      // Prefer diverse sources
      const sources = new Set([a.source, b.source])
      if (sources.size > 1) {
        return a.source < b.source ? -1 : 1
      }

      return 0
    })

    return sorted.slice(0, count)
  }

  private async processArticlesWithAI(articles: NewsArticle[]): Promise<NewsArticle[]> {
    if (!this.isInitialized || !this.client) {
      throw new Error('OpenAI client not initialized')
    }

    const processedArticles: NewsArticle[] = []

    for (const article of articles) {
      try {
        // Create an engaging summary using AI
        const prompt = `Take this AI/tech news article and create an engaging, concise summary suitable for social media:

Title: ${article.title}
Summary: ${article.summary}
Source: ${article.source}

Create a compelling summary (2-3 sentences) that:
- Captures the key breakthrough or development
- Explains why it matters
- Is engaging and shareable
- Maintains factual accuracy

Keep it under 200 characters.`

        const completion = await this.client.chat.completions.create({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: 'You are an expert AI/tech journalist who creates engaging, accurate summaries of complex technical topics.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 150,
          temperature: 0.3 // Lower temperature for more factual summaries
        })

        const aiSummary = completion.choices[0]?.message?.content?.trim()

        if (aiSummary) {
          processedArticles.push({
            ...article,
            summary: aiSummary,
            content: aiSummary // Use AI summary as main content
          })
        } else {
          // Fallback to original if AI fails
          processedArticles.push(article)
        }

        // Small delay to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 500))
      } catch (error) {
        console.error(`Failed to process article "${article.title}":`, error)
        // Include original article if AI processing fails
        processedArticles.push(article)
      }
    }

    return processedArticles
  }

  async generateTweetContent(article: NewsArticle): Promise<string> {
    if (!this.isInitialized || !this.client) {
      throw new Error('OpenAI client not initialized')
    }

    try {
      const prompt = `Create an engaging tweet about this AI/tech news:

Title: ${article.title}
Summary: ${article.summary}
Source: ${article.source}
Tags: ${article.tags.join(', ')}

Create a tweet (under 280 characters) that:
- Hooks the reader immediately with the breakthrough
- Includes key insights and why it matters
- Uses relevant hashtags from the tags provided
- Encourages engagement (questions, calls to action)
- Links to the source article

Make it conversational, exciting, and professional!`

      const completion = await this.client.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a social media expert who creates viral tech tweets that drive engagement and clicks.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 200,
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