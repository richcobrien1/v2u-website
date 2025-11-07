import { NextRequest, NextResponse } from 'next/server';
import { kvStorage } from '@/lib/kv-storage';
import { postYouTubeToTwitter } from '@/lib/social-platforms/twitter-poster';

export const runtime = 'nodejs';

/**
 * POST /api/automation/manual-post
 * Manually post a specific YouTube video to Twitter
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
      videoId: string;
      title: string;
      url: string;
    };

    const { videoId, title, url } = body;

    if (!videoId || !title || !url) {
      return NextResponse.json({
        error: 'Missing required fields: videoId, title, url'
      }, { status: 400 });
    }

    // Get Twitter config
    const level2Config = await kvStorage.getLevel2Config();
    const twitterConfig = level2Config?.twitter;

    if (!twitterConfig?.configured || !twitterConfig?.enabled) {
      return NextResponse.json({
        error: 'Twitter not configured or not enabled'
      }, { status: 400 });
    }

    // Check if already posted
    const alreadyPosted = await kvStorage.hasPostedVideo(videoId);
    if (alreadyPosted) {
      return NextResponse.json({
        error: 'Video already posted',
        videoId
      }, { status: 400 });
    }

    // Post to Twitter
    console.log(`Manually posting video ${videoId} to Twitter...`);
    const tweetId = await postYouTubeToTwitter(
      {
        appKey: twitterConfig.credentials.appKey || '',
        appSecret: twitterConfig.credentials.appSecret || '',
        accessToken: twitterConfig.credentials.accessToken || '',
        accessSecret: twitterConfig.credentials.accessSecret || ''
      },
      {
        title,
        url,
        thumbnailUrl: ''
      }
    );

    // Mark as posted
    await kvStorage.markVideoAsPosted(videoId);

    console.log(`✅ Successfully posted to Twitter: ${tweetId}`);

    return NextResponse.json({
      success: true,
      videoId,
      tweetId,
      message: 'Posted to Twitter successfully'
    });

  } catch (error) {
    console.error('❌ Manual post failed:', error);
    return NextResponse.json({
      error: 'Manual post failed',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
