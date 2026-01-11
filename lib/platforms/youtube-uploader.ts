/**
 * YouTube Video Upload via YouTube Data API v3
 * Handles OAuth and resumable video uploads
 */

import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { Readable } from 'stream';

export interface YouTubeCredentials {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  accessToken?: string;
  refreshToken?: string;
  expiryDate?: number;
}

export interface YouTubeVideoMetadata {
  title: string;
  description: string;
  tags?: string[];
  categoryId?: string; // Default: "28" (Science & Technology)
  privacyStatus?: 'public' | 'private' | 'unlisted';
  thumbnailUrl?: string;
}

export interface YouTubeUploadResult {
  success: boolean;
  videoId?: string;
  url?: string;
  error?: string;
  uploadProgress?: number;
}

/**
 * Create OAuth2 client
 */
export function createOAuth2Client(credentials: YouTubeCredentials): OAuth2Client {
  const oauth2Client = new google.auth.OAuth2(
    credentials.clientId,
    credentials.clientSecret,
    credentials.redirectUri
  );

  if (credentials.accessToken) {
    oauth2Client.setCredentials({
      access_token: credentials.accessToken,
      refresh_token: credentials.refreshToken,
      expiry_date: credentials.expiryDate,
    });
  }

  return oauth2Client;
}

/**
 * Generate OAuth authorization URL
 */
export function getAuthorizationUrl(credentials: YouTubeCredentials): string {
  const oauth2Client = createOAuth2Client(credentials);

  const scopes = [
    'https://www.googleapis.com/auth/youtube.upload',
    'https://www.googleapis.com/auth/youtube.force-ssl',
  ];

  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent', // Force consent to get refresh token
  });
}

/**
 * Exchange authorization code for tokens
 */
export async function getTokensFromCode(
  credentials: YouTubeCredentials,
  code: string
): Promise<{
  accessToken: string;
  refreshToken: string;
  expiryDate: number;
}> {
  const oauth2Client = createOAuth2Client(credentials);
  const { tokens } = await oauth2Client.getToken(code);

  if (!tokens.access_token || !tokens.refresh_token || !tokens.expiry_date) {
    throw new Error('Failed to obtain complete token set from Google');
  }

  return {
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
    expiryDate: tokens.expiry_date,
  };
}

/**
 * Refresh access token using refresh token
 */
export async function refreshAccessToken(
  credentials: YouTubeCredentials
): Promise<{
  accessToken: string;
  expiryDate: number;
}> {
  if (!credentials.refreshToken) {
    throw new Error('No refresh token available');
  }

  const oauth2Client = createOAuth2Client(credentials);
  const { credentials: newCredentials } = await oauth2Client.refreshAccessToken();

  if (!newCredentials.access_token || !newCredentials.expiry_date) {
    throw new Error('Failed to refresh access token');
  }

  return {
    accessToken: newCredentials.access_token,
    expiryDate: newCredentials.expiry_date,
  };
}

/**
 * Upload video to YouTube using resumable upload
 */
export async function uploadVideoToYouTube(
  credentials: YouTubeCredentials,
  videoUrl: string,
  metadata: YouTubeVideoMetadata,
  onProgress?: (progress: number) => void
): Promise<YouTubeUploadResult> {
  try {
    const oauth2Client = createOAuth2Client(credentials);

    // Check if token needs refresh
    if (credentials.expiryDate && credentials.expiryDate < Date.now()) {
      console.log('🔄 Access token expired, refreshing...');
      const refreshed = await refreshAccessToken(credentials);
      oauth2Client.setCredentials({
        access_token: refreshed.accessToken,
        refresh_token: credentials.refreshToken,
        expiry_date: refreshed.expiryDate,
      });
    }

    const youtube = google.youtube({
      version: 'v3',
      auth: oauth2Client,
    });

    console.log(`📥 Downloading video from R2: ${videoUrl}`);
    
    // Fetch video from R2
    const videoResponse = await fetch(videoUrl);
    if (!videoResponse.ok) {
      throw new Error(`Failed to fetch video: ${videoResponse.statusText}`);
    }

    if (!videoResponse.body) {
      throw new Error('Video response has no body');
    }

    // Convert Web ReadableStream to Node.js Readable stream
    const nodeStream = Readable.fromWeb(videoResponse.body as any);

    // Get content length for progress tracking
    const contentLength = parseInt(videoResponse.headers.get('content-length') || '0', 10);
    let uploadedBytes = 0;

    // Track upload progress
    nodeStream.on('data', (chunk: Buffer) => {
      uploadedBytes += chunk.length;
      if (contentLength > 0 && onProgress) {
        const progress = Math.round((uploadedBytes / contentLength) * 100);
        onProgress(progress);
      }
    });

    console.log('🎬 Starting YouTube upload...');
    console.log(`📝 Title: ${metadata.title}`);
    console.log(`📊 Privacy: ${metadata.privacyStatus || 'public'}`);

    // Upload video
    const response = await youtube.videos.insert({
      part: ['snippet', 'status'],
      requestBody: {
        snippet: {
          title: metadata.title.substring(0, 100), // YouTube limit: 100 chars
          description: metadata.description.substring(0, 5000), // YouTube limit: 5000 chars
          tags: metadata.tags || [],
          categoryId: metadata.categoryId || '28', // Science & Technology
        },
        status: {
          privacyStatus: metadata.privacyStatus || 'public',
          selfDeclaredMadeForKids: false,
        },
      },
      media: {
        body: nodeStream,
      },
    });

    const videoId = response.data.id;
    if (!videoId) {
      throw new Error('Upload succeeded but no video ID returned');
    }

    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

    console.log('✅ YouTube upload complete!');
    console.log(`🎥 Video ID: ${videoId}`);
    console.log(`🔗 URL: ${videoUrl}`);

    // Upload custom thumbnail if provided
    if (metadata.thumbnailUrl) {
      try {
        console.log('🖼️ Uploading custom thumbnail...');
        const thumbnailResponse = await fetch(metadata.thumbnailUrl);
        if (thumbnailResponse.ok && thumbnailResponse.body) {
          const thumbnailStream = Readable.fromWeb(thumbnailResponse.body as any);
          
          await youtube.thumbnails.set({
            videoId,
            media: {
              body: thumbnailStream,
            },
          });
          console.log('✅ Thumbnail uploaded');
        }
      } catch (thumbError) {
        console.warn('⚠️ Failed to upload thumbnail:', thumbError);
        // Don't fail the entire upload if thumbnail fails
      }
    }

    return {
      success: true,
      videoId,
      url: videoUrl,
    };
  } catch (error) {
    console.error('❌ YouTube upload failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get channel information
 */
export async function getChannelInfo(
  credentials: YouTubeCredentials,
  channelId: string
): Promise<{
  id: string;
  title: string;
  description: string;
  subscriberCount?: number;
  videoCount?: number;
}> {
  const oauth2Client = createOAuth2Client(credentials);
  const youtube = google.youtube({
    version: 'v3',
    auth: oauth2Client,
  });

  const response = await youtube.channels.list({
    part: ['snippet', 'statistics'],
    id: [channelId],
  });

  const channel = response.data.items?.[0];
  if (!channel) {
    throw new Error('Channel not found');
  }

  return {
    id: channel.id || channelId,
    title: channel.snippet?.title || '',
    description: channel.snippet?.description || '',
    subscriberCount: parseInt(channel.statistics?.subscriberCount || '0', 10),
    videoCount: parseInt(channel.statistics?.videoCount || '0', 10),
  };
}

/**
 * Validate YouTube credentials
 */
export async function validateYouTubeUploadCredentials(
  credentials: YouTubeCredentials
): Promise<{ valid: boolean; error?: string; channel?: any }> {
  try {
    const oauth2Client = createOAuth2Client(credentials);
    
    if (!credentials.accessToken) {
      return { valid: false, error: 'No access token available' };
    }

    const youtube = google.youtube({
      version: 'v3',
      auth: oauth2Client,
    });

    // Try to get user's channel
    const response = await youtube.channels.list({
      part: ['snippet'],
      mine: true,
    });

    const channel = response.data.items?.[0];
    if (!channel) {
      return { valid: false, error: 'No channel found for this account' };
    }

    return {
      valid: true,
      channel: {
        id: channel.id,
        title: channel.snippet?.title,
        description: channel.snippet?.description,
      },
    };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
