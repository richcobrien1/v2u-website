import { NextRequest, NextResponse } from 'next/server';
import { uploadVideoToYouTube } from '@/lib/platforms/youtube-uploader';
import { kvStorage } from '@/lib/kv-storage';

export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutes for large uploads

interface UploadRequest {
  episodeId: string;
  videoUrl: string;
  title: string;
  description: string;
  tags?: string[];
  categoryId?: string;
  privacyStatus?: 'public' | 'private' | 'unlisted';
  thumbnailUrl?: string;
}

/**
 * POST /api/youtube/upload
 * Upload episode to YouTube
 * 
 * Body:
 * {
 *   "episodeId": "2026-01-08-ai-now",
 *   "videoUrl": "https://r2.../episode.mp4",
 *   "title": "AI Now: Episode Title",
 *   "description": "Full description with timestamps...",
 *   "tags": ["AI", "Technology", "Podcast"],
 *   "categoryId": "28",
 *   "privacyStatus": "public",
 *   "thumbnailUrl": "https://r2.../thumbnail.jpg"
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body: UploadRequest = await request.json();
    const { episodeId, videoUrl, title, description, tags, categoryId, privacyStatus, thumbnailUrl } = body;

    if (!episodeId || !videoUrl || !title || !description) {
      return NextResponse.json({
        error: 'Missing required fields',
        required: ['episodeId', 'videoUrl', 'title', 'description'],
      }, { status: 400 });
    }

    console.log(`🎬 YouTube upload requested for episode: ${episodeId}`);
    console.log(`📝 Title: ${title}`);
    console.log(`🔗 Video URL: ${videoUrl}`);

    // Get YouTube config from KV
    const level1Config = await kvStorage.getLevel1Config();
    const youtubeConfig = level1Config?.youtube;

    if (!youtubeConfig?.credentials?.accessToken) {
      return NextResponse.json({
        error: 'YouTube not authenticated',
        message: 'Please complete YouTube OAuth flow first at /api/youtube/auth',
      }, { status: 401 });
    }

    const credentials = {
      clientId: youtubeConfig.credentials.clientId,
      clientSecret: youtubeConfig.credentials.clientSecret,
      redirectUri: youtubeConfig.credentials.redirectUri || 'https://www.v2u.us/api/youtube/callback',
      accessToken: youtubeConfig.credentials.accessToken,
      refreshToken: youtubeConfig.credentials.refreshToken,
      expiryDate: youtubeConfig.credentials.expiryDate,
    };

    // Create upload record in KV for tracking
    const uploadId = `${episodeId}-${Date.now()}`;
    await kvStorage.saveToKV(`youtube:upload:${uploadId}`, JSON.stringify({
      episodeId,
      status: 'uploading',
      startedAt: new Date().toISOString(),
      progress: 0,
    }));

    console.log('📤 Starting YouTube upload...');

    // Upload video
    const result = await uploadVideoToYouTube(
      credentials,
      videoUrl,
      {
        title,
        description,
        tags,
        categoryId,
        privacyStatus,
        thumbnailUrl,
      },
      (progress) => {
        console.log(`⏳ Upload progress: ${progress}%`);
        // Update progress in KV (optional, for UI tracking)
        kvStorage.saveToKV(`youtube:upload:${uploadId}`, JSON.stringify({
          episodeId,
          status: 'uploading',
          startedAt: new Date().toISOString(),
          progress,
        })).catch(console.error);
      }
    );

    if (!result.success) {
      // Update upload record with failure
      await kvStorage.saveToKV(`youtube:upload:${uploadId}`, JSON.stringify({
        episodeId,
        status: 'failed',
        startedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        error: result.error,
      }));

      return NextResponse.json({
        success: false,
        error: result.error,
        uploadId,
      }, { status: 500 });
    }

    console.log(`✅ YouTube upload successful: ${result.videoId}`);
    console.log(`🔗 URL: ${result.url}`);

    // Update upload record with success
    await kvStorage.saveToKV(`youtube:upload:${uploadId}`, JSON.stringify({
      episodeId,
      status: 'completed',
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      videoId: result.videoId,
      url: result.url,
      progress: 100,
    }));

    // Update episode platforms data
    try {
      const platformsKey = `episode:platforms:${episodeId}`;
      const existingData = await kvStorage.getFromKV(platformsKey);
      const platforms = existingData ? JSON.parse(existingData) : {};
      
      platforms.youtube = {
        status: 'uploaded',
        videoId: result.videoId,
        url: result.url,
        uploadedAt: new Date().toISOString(),
      };

      await kvStorage.saveToKV(platformsKey, JSON.stringify(platforms));
      console.log('💾 Episode platforms data updated');
    } catch (updateError) {
      console.warn('⚠️ Failed to update episode platforms:', updateError);
      // Don't fail the entire upload if this fails
    }

    return NextResponse.json({
      success: true,
      uploadId,
      videoId: result.videoId,
      url: result.url,
      message: 'Video uploaded successfully to YouTube',
    });
  } catch (error) {
    console.error('❌ YouTube upload endpoint error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

/**
 * GET /api/youtube/upload?uploadId=xxx
 * Check upload status
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const uploadId = searchParams.get('uploadId');

    if (!uploadId) {
      return NextResponse.json({
        error: 'Missing uploadId parameter',
      }, { status: 400 });
    }

    const uploadData = await kvStorage.getFromKV(`youtube:upload:${uploadId}`);
    
    if (!uploadData) {
      return NextResponse.json({
        error: 'Upload not found',
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      upload: JSON.parse(uploadData),
    });
  } catch (error) {
    console.error('❌ Failed to get upload status:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
