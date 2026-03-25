#!/usr/bin/env node
/**
 * Extract actual video durations from R2 episodes using ffprobe
 * Saves durations to a JSON file for use in RSS feed generation
 */

const { S3Client, ListObjectsV2Command, HeadObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { GetObjectCommand } = require('@aws-sdk/client-s3');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env.local
dotenv.config({ path: path.join(__dirname, '../.env.local') });

// Configure ffprobe path (adjust if needed)
// On Windows, you might need to install ffmpeg and set the path
// ffmpeg.setFfprobePath('path/to/ffprobe');

const r2Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY,
    secretAccessKey: process.env.R2_SECRET_KEY,
  },
});

const PUBLIC_BUCKET = process.env.R2_BUCKET_PUBLIC || 'public';
const PRIVATE_BUCKET = process.env.R2_BUCKET_PRIVATE || 'private';
const OUTPUT_FILE = path.join(__dirname, '../data/episode-durations.json');

/**
 * Get signed URL for R2 object (valid for 1 hour)
 */
async function getPresignedUrl(bucket, key) {
  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
  });
  
  return await getSignedUrl(r2Client, command, { expiresIn: 3600 });
}

/**
 * Extract duration from video URL using ffprobe
 */
function getVideoDuration(url) {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(url, (err, metadata) => {
      if (err) {
        reject(err);
      } else {
        const duration = metadata.format.duration;
        resolve(duration); // Returns duration in seconds
      }
    });
  });
}

/**
 * Format seconds to HH:MM:SS or MM:SS
 */
function formatDuration(seconds) {
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
 * Fetch all video files from R2 buckets
 */
async function fetchAllVideos() {
  const videos = [];
  const buckets = [
    { name: PUBLIC_BUCKET, isPremium: false },
    { name: PRIVATE_BUCKET, isPremium: true },
  ];

  for (const { name: bucket, isPremium } of buckets) {
    try {
      console.log(`\n📂 Fetching videos from ${bucket} bucket...`);
      
      const command = new ListObjectsV2Command({
        Bucket: bucket,
        MaxKeys: 1000,
      });

      const response = await r2Client.send(command);

      if (response.Contents) {
        const videoFiles = response.Contents.filter(obj => 
          obj.Key && obj.Key.match(/\.(mp4|mov|avi|mkv)$/i) && 
          !obj.Key.endsWith('/') && 
          !obj.Key.endsWith('.keep')
        );

        console.log(`  Found ${videoFiles.length} video files`);

        for (const file of videoFiles) {
          videos.push({
            bucket,
            key: file.Key,
            isPremium,
            size: file.Size,
          });
        }
      }
    } catch (err) {
      console.warn(`⚠️ Could not access bucket ${bucket}:`, err.message);
    }
  }

  return videos;
}

/**
 * Extract durations for all videos
 */
async function extractDurations() {
  console.log('🎬 Starting video duration extraction...\n');

  // Load existing durations if they exist
  let durations = {};
  if (fs.existsSync(OUTPUT_FILE)) {
    durations = JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf8'));
    console.log(`📖 Loaded ${Object.keys(durations).length} existing durations\n`);
  }

  const videos = await fetchAllVideos();
  console.log(`\n🎥 Processing ${videos.length} total videos...\n`);

  let processed = 0;
  let skipped = 0;
  let errors = 0;

  for (const video of videos) {
    const key = video.key;

    // Skip if we already have duration
    if (durations[key]) {
      skipped++;
      if (skipped % 10 === 0) {
        console.log(`⏭️  Skipped ${skipped} videos with existing durations...`);
      }
      continue;
    }

    try {
      console.log(`\n🔍 Processing: ${key}`);

      // Get presigned URL for the video
      const url = await getPresignedUrl(video.bucket, key);

      // Extract duration using ffprobe
      const durationSeconds = await getVideoDuration(url);
      const formattedDuration = formatDuration(durationSeconds);

      // Store the duration
      durations[key] = {
        seconds: durationSeconds,
        formatted: formattedDuration,
        isPremium: video.isPremium,
        extractedAt: new Date().toISOString(),
      };

      console.log(`  ✅ Duration: ${formattedDuration} (${durationSeconds}s)`);
      processed++;

      // Save progress every 10 videos
      if (processed % 10 === 0) {
        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(durations, null, 2));
        console.log(`\n💾 Progress saved: ${processed}/${videos.length} videos processed\n`);
      }

    } catch (err) {
      console.error(`  ❌ Failed to extract duration: ${err.message}`);
      errors++;
    }
  }

  // Save final results
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(durations, null, 2));

  console.log('\n' + '='.repeat(60));
  console.log('✅ Duration extraction complete!');
  console.log('='.repeat(60));
  console.log(`📊 Results:`);
  console.log(`  • Processed: ${processed} videos`);
  console.log(`  • Skipped (already cached): ${skipped}`);
  console.log(`  • Errors: ${errors}`);
  console.log(`  • Total durations: ${Object.keys(durations).length}`);
  console.log(`\n💾 Saved to: ${OUTPUT_FILE}\n`);
}

// Run
if (require.main === module) {
  extractDurations().catch(err => {
    console.error('\n❌ Fatal error:', err);
    process.exit(1);
  });
}

module.exports = { extractDurations, getVideoDuration, formatDuration };
