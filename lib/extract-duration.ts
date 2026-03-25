/**
 * Video duration extraction utilities using ffprobe
 * Automatically extracts and caches video durations
 */

import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import path from 'path';

export interface DurationData {
  seconds: number;
  formatted: string;
  isPremium: boolean;
  extractedAt: string;
}

/**
 * Extract duration from video file using ffprobe
 */
export function getVideoDuration(filePath: string): Promise<number> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) {
        reject(err);
      } else {
        const duration = metadata.format.duration || 0;
        resolve(duration);
      }
    });
  });
}

/**
 * Format seconds to HH:MM:SS or MM:SS
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  } else {
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }
}

/**
 * Save duration to episode-durations.json cache
 * This is automatically loaded by r2-episodes.ts for RSS feed generation
 */
export function saveDuration(r2Key: string, durationData: DurationData): void {
  const durationsPath = path.join(process.cwd(), 'data/episode-durations.json');
  
  // Load existing durations
  let durations: Record<string, DurationData> = {};
  if (fs.existsSync(durationsPath)) {
    durations = JSON.parse(fs.readFileSync(durationsPath, 'utf8'));
  }
  
  // Add new duration
  durations[r2Key] = durationData;
  
  // Save back to file
  fs.writeFileSync(durationsPath, JSON.stringify(durations, null, 2));
  
  console.log(`💾 Duration cached: ${r2Key} → ${durationData.formatted}`);
}

/**
 * Extract duration from video file and save to cache
 * Call this during episode upload
 */
export async function extractAndCacheDuration(
  localVideoPath: string,
  r2Key: string,
  isPremium: boolean
): Promise<string> {
  try {
    console.log('⏱️  Extracting video duration...');
    
    const durationSeconds = await getVideoDuration(localVideoPath);
    const formatted = formatDuration(durationSeconds);
    
    const durationData: DurationData = {
      seconds: durationSeconds,
      formatted,
      isPremium,
      extractedAt: new Date().toISOString(),
    };
    
    saveDuration(r2Key, durationData);
    
    console.log(`✅ Duration: ${formatted} (${durationSeconds}s)`);
    
    return formatted;
    
  } catch (error) {
    console.warn('⚠️  Failed to extract duration:', error);
    console.log('   Using default duration: 20:00');
    return '20:00';
  }
}
