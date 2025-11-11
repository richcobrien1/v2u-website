/**
 * Instagram Video Upload via Graph API
 * Using Container-based media publishing
 */

export interface InstagramCredentials {
  accessToken: string;
  userId?: string;
}

export interface InstagramUploadResult {
  success: boolean;
  postId?: string;
  url?: string;
  error?: string;
  containerId?: string;
}

/**
 * Upload video to Instagram using Graph API Media Publishing
 * 
 * Process:
 * 1. Upload video file to hosting (need public URL)
 * 2. Create media container
 * 3. Wait for processing
 * 4. Publish container
 */
export async function uploadVideoToInstagram(
  credentials: InstagramCredentials,
  videoFilePath: string,
  caption: string,
  videoUrl?: string // If already hosted
): Promise<InstagramUploadResult> {
  try {
    const { accessToken, userId } = credentials;

    if (!accessToken) {
      return { success: false, error: 'Missing Instagram access token' };
    }

    if (!userId) {
      return { success: false, error: 'Missing Instagram user ID' };
    }

    // Instagram requires a publicly accessible video URL
    // We need to either:
    // 1. Upload to temporary hosting (S3, R2, etc.)
    // 2. Use existing video URL from YouTube/etc
    
    if (!videoUrl) {
      return {
        success: false,
        error: 'Instagram requires a public video URL. Please provide videoUrl parameter or upload to cloud storage first.'
      };
    }

    // Step 1: Create media container
    console.log('📸 Creating Instagram media container...');
    
    const containerResponse = await fetch(
      `https://graph.facebook.com/v18.0/${userId}/media`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          media_type: 'VIDEO',
          video_url: videoUrl,
          caption: caption,
          access_token: accessToken
        })
      }
    );

    const containerData = await containerResponse.json() as {
      id?: string;
      error?: { message: string; code: number };
    };

    if (!containerResponse.ok || containerData.error) {
      return {
        success: false,
        error: containerData.error?.message || 'Failed to create media container',
        containerId: containerData.id
      };
    }

    const containerId = containerData.id;
    console.log(`✅ Container created: ${containerId}`);

    // Step 2: Check container status (video processing)
    console.log('⏳ Waiting for video processing...');
    
    const isReady = await waitForContainerReady(userId, containerId!, accessToken);
    
    if (!isReady) {
      return {
        success: false,
        error: 'Video processing timeout or failed',
        containerId
      };
    }

    // Step 3: Publish the container
    console.log('📤 Publishing to Instagram...');
    
    const publishResponse = await fetch(
      `https://graph.facebook.com/v18.0/${userId}/media_publish`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          creation_id: containerId,
          access_token: accessToken
        })
      }
    );

    const publishData = await publishResponse.json() as {
      id?: string;
      error?: { message: string };
    };

    if (!publishResponse.ok || publishData.error) {
      return {
        success: false,
        error: publishData.error?.message || 'Failed to publish media',
        containerId
      };
    }

    const mediaId = publishData.id;
    console.log(`✅ Published to Instagram: ${mediaId}`);

    return {
      success: true,
      postId: mediaId,
      url: `https://www.instagram.com/p/${mediaId}/`,
      containerId
    };

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Check if container is ready for publishing
 * Polls status every 5 seconds, max 2 minutes
 */
async function waitForContainerReady(
  userId: string,
  containerId: string,
  accessToken: string,
  maxAttempts: number = 24 // 2 minutes max
): Promise<boolean> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const statusResponse = await fetch(
        `https://graph.facebook.com/v18.0/${containerId}?fields=status_code&access_token=${accessToken}`
      );

      const statusData = await statusResponse.json() as {
        status_code?: string;
        error?: { message: string };
      };

      if (statusData.error) {
        console.error('Status check error:', statusData.error.message);
        return false;
      }

      const status = statusData.status_code;
      console.log(`Container status: ${status}`);

      // Status codes:
      // - EXPIRED: container expired
      // - ERROR: processing error
      // - FINISHED: ready to publish
      // - IN_PROGRESS: still processing
      // - PUBLISHED: already published

      if (status === 'FINISHED') {
        return true;
      }

      if (status === 'ERROR' || status === 'EXPIRED') {
        console.error(`Container processing failed: ${status}`);
        return false;
      }

      if (status === 'PUBLISHED') {
        console.warn('Container already published');
        return false;
      }

      // Wait 5 seconds before next check
      await new Promise(resolve => setTimeout(resolve, 5000));

    } catch (error) {
      console.error('Status check error:', error);
      return false;
    }
  }

  console.error('Container processing timeout');
  return false;
}

/**
 * Post a photo to Instagram (alternative for thumbnails)
 */
export async function uploadPhotoToInstagram(
  credentials: InstagramCredentials,
  imageUrl: string,
  caption: string
): Promise<InstagramUploadResult> {
  try {
    const { accessToken, userId } = credentials;

    if (!accessToken || !userId) {
      return { success: false, error: 'Missing Instagram credentials' };
    }

    // Create image container
    const containerResponse = await fetch(
      `https://graph.facebook.com/v18.0/${userId}/media`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          image_url: imageUrl,
          caption: caption,
          access_token: accessToken
        })
      }
    );

    const containerData = await containerResponse.json() as {
      id?: string;
      error?: { message: string };
    };

    if (!containerResponse.ok || containerData.error) {
      return {
        success: false,
        error: containerData.error?.message || 'Failed to create image container'
      };
    }

    const containerId = containerData.id;

    // Publish immediately (images don't need processing time)
    const publishResponse = await fetch(
      `https://graph.facebook.com/v18.0/${userId}/media_publish`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          creation_id: containerId,
          access_token: accessToken
        })
      }
    );

    const publishData = await publishResponse.json() as {
      id?: string;
      error?: { message: string };
    };

    if (!publishResponse.ok || publishData.error) {
      return {
        success: false,
        error: publishData.error?.message || 'Failed to publish image'
      };
    }

    return {
      success: true,
      postId: publishData.id,
      url: `https://www.instagram.com/p/${publishData.id}/`,
      containerId
    };

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
