// R2 Episode Data Interface
// Replaces mock data with real R2 bucket contents

import { S3Client, ListObjectsV2Command, HeadObjectCommand } from '@aws-sdk/client-s3';

interface R2Episode {
  id: string;
  title: string;
  description: string;
  duration: string;
  publishDate: string;
  thumbnail: string;
  thumbnailFallbacks?: string[]; // Array of fallback thumbnail URLs
  category: 'ai-now' | 'ai-now-educate' | 'ai-now-commercial' | 'ai-now-conceptual' | 'ai-now-reviews';
  isPremium: boolean;
  audioUrl: string;
  isNew?: boolean;
  r2Key: string;
  fileSize?: number;
  lastModified?: string;
}

// Configure R2 client
const r2Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY || process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_KEY || process.env.R2_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = process.env.R2_BUCKET || 'v2u-assets';

// Extract episode metadata from R2 object key
// Generate video thumbnail URL (landscape 16:9 aspect ratio)
function generateThumbnailUrl(key: string, isPremium: boolean, category: string): string {
  // Defensive programming - ensure category is valid
  const safeCategory = category || 'ai-now';
  // For now, start with local thumbnails since they exist and R2 thumbnails don't yet
  return `/v2u-${safeCategory}.jpg`;
}

// Generate fallback thumbnail options for video (landscape only)
function getThumbnailFallbacks(key: string, category: string): string[] {
  const basePath = key.replace(/\.(mp4|mov|avi|mkv)$/i, '');
  const apiPath = key.includes('/private/') ? 'private' : 'public';
  const safeCategory = category || 'ai-now';
  
  return [
    // Local thumbnails first (these actually exist)
    `/v2u-${safeCategory}.jpg`,               // Category-specific thumbnail
    '/v2u-ai-now.jpg',                        // Your main AI-Now thumbnail
    '/v2u-ai-now-educate.jpg',                // Your education thumbnail  
    '/v2u.png',                               // Your V2U brand thumbnail
    '/Ai-Now-Educate-YouTube.jpg',             // Original fallback
    // R2 thumbnails (for when you add them later)
    `/api/r2/${apiPath}/${basePath}.jpg`,      // Same name as video with .jpg
    `/api/r2/${apiPath}/${basePath}.jpeg`,     // JPEG variant
    `/api/r2/${apiPath}/${basePath}.png`,      // PNG variant
  ];
}

function parseEpisodeFromKey(key: string, size?: number, lastModified?: Date): R2Episode | null {
  // Skip directory markers and non-video files
  if (key.endsWith('/') || key.endsWith('.keep') || !key.match(/\.(mp4|mov|avi|mkv)$/i)) {
    return null;
  }

  // Extract path components
  const pathParts = key.split('/');
  const filename = pathParts[pathParts.length - 1];
  const nameWithoutExt = filename.replace(/\.[^/.]+$/, '');

  // Determine if premium based on path
  const isPremium = key.includes('/private/');
  
  // Extract category from path
  let category: R2Episode['category'] = 'ai-now';
  if (key.includes('educate')) category = 'ai-now-educate';
  else if (key.includes('commercial')) category = 'ai-now-commercial';
  else if (key.includes('conceptual')) category = 'ai-now-conceptual';
  else if (key.includes('reviews')) category = 'ai-now-reviews';

  // Extract date from path or filename
  let publishDate = new Date().toISOString().split('T')[0];
  const dateMatch = key.match(/(\d{4})\/(\d{2})\/(\d{2})/);
  if (dateMatch) {
    publishDate = `${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}`;
  }

  // Generate title from filename
  const title = nameWithoutExt
    .replace(/^\d{4}-\d{2}-\d{2}-/, '') // Remove date prefix
    .replace(/-+/g, ' ') // Replace dashes with spaces
    .replace(/\b\w/g, l => l.toUpperCase()) // Title case
    .replace(/\s+/g, ' ') // Clean up spaces
    .replace(/\s+[a-f0-9]{8,}$/i, '') // Remove trailing hash codes
    .replace(/\s+\d+$/, '') // Remove trailing numbers
    .trim();

  // Generate description
  const description = `${category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())} episode: ${title}`;

  // Estimate duration (you could enhance this with actual metadata)
  let duration = '30:00'; // Default
  if (size) {
    // Rough estimate: 1MB per minute for standard quality
    const estimatedMinutes = Math.round(size / (1024 * 1024));
    const minutes = estimatedMinutes % 60;
    const hours = Math.floor(estimatedMinutes / 60);
    duration = hours > 0 ? `${hours}:${minutes.toString().padStart(2, '0')}:00` : `${minutes}:00`;
  }

  // Check if new (within last 7 days)
  const isNew = lastModified ? (Date.now() - lastModified.getTime()) < (7 * 24 * 60 * 60 * 1000) : false;

  // Generate API URL
  const apiPath = isPremium ? 'private' : 'public';
  const audioUrl = `/api/r2/${apiPath}/${key}`;

  // Generate smart thumbnail URL and fallbacks
  const thumbnailUrl = generateThumbnailUrl(key, isPremium, category);
  const thumbnailFallbacks = getThumbnailFallbacks(key, category);

  return {
    id: btoa(key), // Base64 encode key as ID
    title,
    description,
    duration,
    publishDate,
    thumbnail: thumbnailUrl,
    thumbnailFallbacks, // Add fallback options
    category,
    isPremium,
    audioUrl,
    isNew,
    r2Key: key,
    fileSize: size,
    lastModified: lastModified?.toISOString()
  };
}

// Fetch episodes from R2 bucket
export async function fetchR2Episodes(): Promise<R2Episode[]> {
  try {
    const episodes: R2Episode[] = [];

    // List objects in bucket
    const command = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      MaxKeys: 1000, // Adjust as needed
    });

    const response = await r2Client.send(command);
    
    if (response.Contents) {
      for (const object of response.Contents) {
        if (object.Key) {
          const episode = parseEpisodeFromKey(
            object.Key, 
            object.Size,
            object.LastModified
          );
          
          if (episode) {
            episodes.push(episode);
          }
        }
      }
    }

    // Sort by publish date (newest first)
    episodes.sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime());

    console.log(`📺 Loaded ${episodes.length} episodes from R2 bucket: ${BUCKET_NAME}`);
    return episodes;

  } catch (error) {
    console.error('❌ Failed to fetch R2 episodes:', error);
    
    // Return fallback mock data if R2 fails
    return [
      {
        id: 'fallback-1',
        title: 'AI-Now Daily: October 2nd - Practical AI & Advanced Robotics',
        description: 'Deep dive into practical AI applications and cutting-edge robotics with Alex and Jessica.',
        duration: '45:32',
        publishDate: '2025-10-02',
        thumbnail: '/Ai-Now-Educate-YouTube.jpg',
        category: 'ai-now',
        audioUrl: '/api/r2/public/daily/landscape/2025/10/02/october-2-2025-ai-now---practical-ai-advanced-robotics---deep-dive-with-alex-and-jessica-216b7799.mp4',
        isPremium: false,
        isNew: true,
        r2Key: '2025/10/02/october-2-2025-ai-now---practical-ai-advanced-robotics---deep-dive-with-alex-and-jessica-216b7799.mp4'
      }
    ];
  }
}

// Get episode by ID
export async function getR2Episode(id: string): Promise<R2Episode | null> {
  try {
    const key = atob(id); // Decode base64 ID back to key
    
    const headCommand = new HeadObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });
    
    const response = await r2Client.send(headCommand);
    
    return parseEpisodeFromKey(
      key,
      response.ContentLength,
      response.LastModified
    );
    
  } catch (error) {
    console.error('❌ Failed to get R2 episode:', error);
    return null;
  }
}

// Check if R2 is properly configured
export async function checkR2Configuration(): Promise<boolean> {
  try {
    const command = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      MaxKeys: 1,
    });
    
    await r2Client.send(command);
    return true;
  } catch (error) {
    console.error('❌ R2 configuration check failed:', error);
    return false;
  }
}