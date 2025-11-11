/**
 * Video Downloader Utility
 * Downloads YouTube videos for re-uploading to platforms that don't support link sharing
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import { writeFile, unlink } from 'fs/promises';
import path from 'path';
import os from 'os';

const execAsync = promisify(exec);

export interface VideoDownloadResult {
  success: boolean;
  filePath?: string;
  error?: string;
  fileSize?: number;
  duration?: number;
  format?: string;
}

/**
 * Download a YouTube video using yt-dlp
 * Falls back to using YouTube Data API to get video stream URL
 */
export async function downloadYouTubeVideo(
  videoUrl: string,
  options: {
    maxFileSize?: number; // in MB
    format?: 'mp4' | 'webm';
    quality?: '720p' | '1080p' | 'best';
  } = {}
): Promise<VideoDownloadResult> {
  const {
    maxFileSize = 100, // 100MB default
    format = 'mp4',
    quality = '720p'
  } = options;

  try {
    // Generate temporary file path
    const tempDir = os.tmpdir();
    const fileName = `v2u-video-${Date.now()}.${format}`;
    const filePath = path.join(tempDir, fileName);

    // Check if yt-dlp is available
    try {
      await execAsync('yt-dlp --version');
    } catch {
      return {
        success: false,
        error: 'yt-dlp not installed. Install with: pip install yt-dlp'
      };
    }

    // Build yt-dlp command
    const qualityFormat = quality === 'best' 
      ? 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]'
      : `bestvideo[height<=${quality.replace('p', '')}][ext=mp4]+bestaudio[ext=m4a]/best[height<=${quality.replace('p', '')}][ext=mp4]`;

    const command = [
      'yt-dlp',
      '-f', qualityFormat,
      '--max-filesize', `${maxFileSize}M`,
      '-o', filePath,
      '--no-playlist',
      '--quiet',
      '--no-warnings',
      videoUrl
    ].join(' ');

    console.log(`📥 Downloading video: ${videoUrl}`);
    console.log(`📂 Output path: ${filePath}`);

    // Execute download
    const { stderr } = await execAsync(command, {
      timeout: 300000 // 5 minutes timeout
    });

    if (stderr && !stderr.includes('WARNING')) {
      console.error('Download stderr:', stderr);
    }

    // Verify file exists and get stats
    const fs = await import('fs/promises');
    const stats = await fs.stat(filePath);

    if (!stats.isFile()) {
      return {
        success: false,
        error: 'Downloaded file not found'
      };
    }

    console.log(`✅ Video downloaded: ${(stats.size / 1024 / 1024).toFixed(2)}MB`);

    return {
      success: true,
      filePath,
      fileSize: stats.size,
      format
    };

  } catch (error) {
    console.error('Video download error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown download error'
    };
  }
}

/**
 * Alternative: Download video from direct URL (for non-YouTube sources)
 */
export async function downloadVideoFromUrl(
  videoUrl: string,
  outputPath?: string
): Promise<VideoDownloadResult> {
  try {
    const response = await fetch(videoUrl);
    
    if (!response.ok) {
      return {
        success: false,
        error: `HTTP ${response.status}: ${response.statusText}`
      };
    }

    const buffer = await response.arrayBuffer();
    const filePath = outputPath || path.join(os.tmpdir(), `v2u-video-${Date.now()}.mp4`);
    
    await writeFile(filePath, Buffer.from(buffer));

    return {
      success: true,
      filePath,
      fileSize: buffer.byteLength
    };

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Clean up temporary video file
 */
export async function cleanupVideoFile(filePath: string): Promise<void> {
  try {
    await unlink(filePath);
    console.log(`🗑️  Cleaned up video file: ${filePath}`);
  } catch (error) {
    console.error('Failed to cleanup video file:', error);
  }
}

/**
 * Get video metadata without downloading
 */
export async function getVideoMetadata(videoUrl: string): Promise<{
  title?: string;
  duration?: number;
  thumbnail?: string;
  description?: string;
  error?: string;
}> {
  try {
    const command = `yt-dlp --dump-json --no-playlist ${videoUrl}`;
    const { stdout } = await execAsync(command, { timeout: 30000 });
    
    const metadata = JSON.parse(stdout);
    
    return {
      title: metadata.title,
      duration: metadata.duration,
      thumbnail: metadata.thumbnail,
      description: metadata.description
    };

  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to fetch metadata'
    };
  }
}
