import { NextRequest, NextResponse } from 'next/server'
import { kvClient } from '@/lib/kv-client'
import { fetchR2Episodes, R2Episode } from '@/lib/r2-episodes'

const RESEND_API_KEY = process.env.RESEND_API_KEY
const EMAIL_FROM = process.env.EMAIL_FROM || 'Alex & Jessica <alex@v2u.us>'
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'dev-secret-2025'

export const runtime = 'nodejs'
export const maxDuration = 300 // 5 minutes for batch email sending

/**
 * Shared handler for sending weekly digest
 */
async function handleSendDigest(request: NextRequest) {
  try {
    // Verify admin authorization
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${ADMIN_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!RESEND_API_KEY) {
      return NextResponse.json({ 
        error: 'RESEND_API_KEY not configured' 
      }, { status: 500 })
    }

    // Get all subscribers
    const subscribersRaw = await kvClient.get('subscribers:list')
    const subscribers = subscribersRaw ? JSON.parse(subscribersRaw) as string[] : []

    if (subscribers.length === 0) {
      return NextResponse.json({ 
        success: true, 
        message: 'No subscribers to send to',
        sent: 0 
      })
    }

    // Get latest episodes for the digest
    const latestEpisodes = await getLatestEpisodesForDigest()

    if (latestEpisodes.length === 0) {
      return NextResponse.json({ 
        error: 'No episodes available for digest' 
      }, { status: 400 })
    }

    // Generate digest HTML
    const digestHtml = generateWeeklyDigestHtml(latestEpisodes)

    // Track sent emails
    const results = {
      sent: 0,
      failed: 0,
      errors: [] as string[]
    }

    // Send to all subscribers (batch in groups of 50 to avoid rate limits)
    const batchSize = 50
    for (let i = 0; i < subscribers.length; i += batchSize) {
      const batch = subscribers.slice(i, i + batchSize)
      
      await Promise.allSettled(
        batch.map(async (email) => {
          try {
            await sendDigestEmail(email, digestHtml)
            results.sent++
          } catch (error) {
            results.failed++
            const errorMsg = error instanceof Error ? error.message : String(error)
            results.errors.push(`${email}: ${errorMsg}`)
            console.error(`Failed to send to ${email}:`, error)
          }
        })
      )

      // Small delay between batches to respect rate limits
      if (i + batchSize < subscribers.length) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }

    // Log the digest send to KV
    await logDigestSend(results.sent, results.failed)

    return NextResponse.json({
      success: true,
      sent: results.sent,
      failed: results.failed,
      total: subscribers.length,
      episodes: latestEpisodes.length,
      errors: results.errors.length > 0 ? results.errors.slice(0, 10) : undefined
    })

  } catch (error) {
    console.error('Weekly digest send error:', error)
    return NextResponse.json({
      error: 'Failed to send weekly digest',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}

/**
 * GET /api/send-weekly-digest
 * Send weekly digest to all subscribers
 * Requires admin auth header for security
 */
export async function GET(request: NextRequest) {
  return handleSendDigest(request)
}

/**
 * POST /api/send-weekly-digest
 * Send weekly digest to all subscribers
 * Requires admin auth header for security
 */
export async function POST(request: NextRequest) {
  return handleSendDigest(request)
}

/**
 * Get latest episodes published in the last 7 days
 */
async function getLatestEpisodesForDigest(): Promise<R2Episode[]> {
  try {
    const allEpisodes = await fetchR2Episodes()
    
    // Filter to episodes from the last 7 days
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const recentEpisodes = allEpisodes
      .filter(ep => {
        const publishDate = new Date(ep.publishDate)
        return publishDate >= sevenDaysAgo
      })
      .sort((a, b) => 
        new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime()
      )
      .slice(0, 5) // Top 5 recent episodes

    return recentEpisodes
  } catch (error) {
    console.error('Error fetching episodes for digest:', error)
    return []
  }
}

/**
 * Send digest email to a single subscriber
 */
async function sendDigestEmail(email: string, html: string): Promise<void> {
  const resp = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: EMAIL_FROM,
      to: [email],
      subject: "🎙️ Your Weekly AI Digest - Latest Episodes from AI-Now",
      html,
    }),
  })

  if (!resp.ok) {
    const text = await resp.text().catch(() => '')
    throw new Error(`Resend API error: ${resp.status} ${resp.statusText} ${text}`)
  }
}

/**
 * Generate HTML for weekly digest email
 */
function generateWeeklyDigestHtml(episodes: R2Episode[]): string {
  const episodesList = episodes.map(ep => {
    const publishDate = new Date(ep.publishDate).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })

    return `
      <div style="margin-bottom: 30px; padding: 20px; background: #f9fafb; border-radius: 8px; border-left: 4px solid #3b82f6;">
        <h3 style="margin: 0 0 10px 0; color: #1f2937; font-size: 18px;">
          ${ep.title}
        </h3>
        <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">
          📅 ${publishDate}
        </p>
        <p style="margin: 0 0 15px 0; color: #374151; line-height: 1.6;">
          ${ep.description}
        </p>
        <a href="https://v2u.ai" style="display: inline-block; padding: 10px 20px; background: #3b82f6; color: white; text-decoration: none; border-radius: 6px; font-weight: 500;">
          Watch Now →
        </a>
      </div>
    `
  }).join('')

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Weekly AI Digest</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1f2937; max-width: 600px; margin: 0 auto; padding: 20px;">
  
  <!-- Header -->
  <div style="text-align: center; padding: 30px 0; border-bottom: 2px solid #e5e7eb;">
    <h1 style="margin: 0; color: #111827; font-size: 32px; font-weight: 700;">
      🎙️ AI-Now Weekly Digest
    </h1>
    <p style="margin: 10px 0 0 0; color: #6b7280; font-size: 16px;">
      Your weekly dose of AI insights
    </p>
  </div>

  <!-- Intro -->
  <div style="padding: 30px 0;">
    <p style="font-size: 16px; color: #374151; margin: 0 0 20px 0;">
      Hi there! 👋
    </p>
    <p style="font-size: 16px; color: #374151; margin: 0 0 20px 0;">
      Here's what's new this week in the AI world. Alex and Jessica have been diving deep into the latest developments, and we think you'll love these episodes.
    </p>
  </div>

  <!-- Episodes -->
  <div style="padding: 20px 0;">
    ${episodesList}
  </div>

  <!-- Footer CTA -->
  <div style="text-align: center; padding: 30px 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; margin: 30px 0;">
    <h2 style="margin: 0 0 15px 0; color: white; font-size: 24px;">
      Ready for More?
    </h2>
    <p style="margin: 0 0 20px 0; color: #e5e7eb; font-size: 16px;">
      Explore our full library of episodes and premium content
    </p>
    <a href="https://v2u.ai" style="display: inline-block; padding: 15px 40px; background: white; color: #667eea; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
      Visit v2u.ai
    </a>
  </div>

  <!-- Footer -->
  <div style="text-align: center; padding: 30px 0; border-top: 2px solid #e5e7eb; color: #9ca3af; font-size: 14px;">
    <p style="margin: 0 0 10px 0;">
      You&apos;re receiving this because you subscribed to AI-Now updates
    </p>
    <p style="margin: 0;">
      <a href="https://v2u.ai" style="color: #6b7280; text-decoration: none;">Visit our website</a> · 
      <a href="mailto:alex@v2u.us" style="color: #6b7280; text-decoration: none;">Contact us</a> · 
      <a href="https://v2u.ai/unsubscribe" style="color: #6b7280; text-decoration: none;">Unsubscribe</a>
    </p>
    <p style="margin: 15px 0 0 0; font-size: 12px;">
      © ${new Date().getFullYear()} AI-Now. All rights reserved.
    </p>
  </div>

</body>
</html>
  `
}

/**
 * Log digest send to KV for tracking
 */
async function logDigestSend(sent: number, failed: number): Promise<void> {
  try {
    const logEntry = {
      timestamp: new Date().toISOString(),
      sent,
      failed,
      total: sent + failed
    }

    const logsRaw = await kvClient.get('digest:logs')
    const logs = logsRaw ? JSON.parse(logsRaw) as typeof logEntry[] : []
    
    logs.unshift(logEntry)
    
    // Keep last 50 logs
    if (logs.length > 50) {
      logs.splice(50)
    }

    await kvClient.put('digest:logs', JSON.stringify(logs))
  } catch (error) {
    console.error('Error logging digest send:', error)
    // Don't throw - logging failure shouldn't fail the digest send
  }
}
