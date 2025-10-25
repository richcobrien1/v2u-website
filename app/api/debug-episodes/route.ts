import { NextResponse } from 'next/server'
import { fetchR2Episodes, checkR2Configuration } from '@/lib/r2-episodes'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'

export async function GET() {
  try {
    // Check R2 configuration
    const isR2Configured = await checkR2Configuration()

    // Get all episodes
    const allEpisodes = await fetchR2Episodes()

    // Check user auth
    const cookieStore = await cookies()
    const tokenCookie = cookieStore.get('v2u-token')
    let userInfo = null

    if (tokenCookie) {
      try {
        const decoded = jwt.verify(
          tokenCookie.value,
          process.env.JWT_SECRET || 'your-jwt-secret'
        ) as { customerId: string; subscription: string; firstName?: string }

        userInfo = {
          customerId: decoded.customerId,
          subscription: decoded.subscription,
          firstName: decoded.firstName,
        }
      } catch {
        userInfo = { error: 'Invalid token' }
      }
    }

    const premiumEpisodes = allEpisodes.filter(ep => ep.isPremium)
    const publicEpisodes = allEpisodes.filter(ep => !ep.isPremium)

    return NextResponse.json({
      r2Configured: isR2Configured,
      userAuthenticated: !!userInfo,
      userInfo,
      totalEpisodes: allEpisodes.length,
      premiumCount: premiumEpisodes.length,
      publicCount: publicEpisodes.length,
      environment: {
        R2_ENDPOINT: process.env.R2_ENDPOINT ? 'Set' : 'Not set',
        R2_ACCESS_KEY: process.env.R2_ACCESS_KEY ? 'Set' : 'Not set',
        R2_SECRET_KEY: process.env.R2_SECRET_KEY ? 'Set' : 'Not set',
        R2_BUCKET_PUBLIC: process.env.R2_BUCKET_PUBLIC || 'public (default)',
        R2_BUCKET_PRIVATE: process.env.R2_BUCKET_PRIVATE || 'private (default)',
      },
      samplePremiumEpisode: premiumEpisodes[0] || null,
      samplePublicEpisode: publicEpisodes[0] || null,
      allEpisodeSummary: allEpisodes.map(ep => ({
        title: ep.title,
        isPremium: ep.isPremium,
        audioUrl: ep.audioUrl,
        r2Key: ep.r2Key,
      })),
    })
  } catch (error) {
    return NextResponse.json({
      error: 'Debug failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}
