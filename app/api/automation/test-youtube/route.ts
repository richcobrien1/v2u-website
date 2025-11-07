import { NextResponse } from 'next/server';
import { kvStorage } from '@/lib/kv-storage';
import { getLatestYouTubeVideo, isVideoRecent } from '@/lib/social-platforms/youtube-checker';

export const runtime = 'nodejs';

/**
 * GET /api/automation/test-youtube
 * Test YouTube checker to see latest video
 */
export async function GET() {
  try {
    const level1Config = await kvStorage.getLevel1Config();
    const youtubeConfig = level1Config?.youtube;

    if (!youtubeConfig?.configured) {
      return NextResponse.json({
        error: 'YouTube not configured',
        config: youtubeConfig
      }, { status: 400 });
    }

    console.log('Fetching latest YouTube video...');
    const latestVideo = await getLatestYouTubeVideo({
      apiKey: youtubeConfig.credentials.apiKey || '',
      channelId: youtubeConfig.credentials.channelId || ''
    });

    if (!latestVideo) {
      return NextResponse.json({
        error: 'No video found',
        channelId: youtubeConfig.credentials.channelId
      });
    }

    const isRecent = isVideoRecent(latestVideo.publishedAt, 2);
    const alreadyPosted = await kvStorage.hasPostedVideo(latestVideo.id);

    return NextResponse.json({
      video: latestVideo,
      isRecent,
      alreadyPosted,
      publishedAt: latestVideo.publishedAt,
      now: new Date().toISOString(),
      hoursSincePublished: (Date.now() - new Date(latestVideo.publishedAt).getTime()) / (1000 * 60 * 60),
      willPost: isRecent && !alreadyPosted
    });
  } catch (error) {
    return NextResponse.json({
      error: 'Test failed',
      details: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
