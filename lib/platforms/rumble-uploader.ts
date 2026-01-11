/**
 * Rumble Upload Helper
 * Prepares episode packages for manual upload to Rumble
 * (Rumble has no official API - browser automation could be added later)
 */

export interface RumbleMetadata {
  title: string;
  description: string;
  tags?: string[];
  category?: string;
  visibility?: 'public' | 'unlisted' | 'private';
}

export interface RumbleUploadPackage {
  episodeId: string;
  videoUrl: string;
  downloadUrl: string;
  metadata: RumbleMetadata;
  uploadInstructions: string;
  preparedAt: string;
}

/**
 * Prepare episode for Rumble upload
 * Generates upload package with metadata and instructions
 */
export function prepareRumbleUpload(
  episodeId: string,
  videoUrl: string,
  metadata: RumbleMetadata
): RumbleUploadPackage {
  const uploadInstructions = `
RUMBLE UPLOAD INSTRUCTIONS
==========================

Episode ID: ${episodeId}
Prepared: ${new Date().toISOString()}

STEP 1: Download Video
-----------------------
Video URL: ${videoUrl}

STEP 2: Upload to Rumble
-------------------------
1. Go to: https://rumble.com/upload.php
2. Sign in to your Rumble account
3. Click "Select video to upload"
4. Choose the downloaded video file

STEP 3: Fill in Metadata
-------------------------
Title: ${metadata.title}

Description:
${metadata.description}

Tags: ${metadata.tags?.join(', ') || 'AI, Technology, Podcast'}

Category: ${metadata.category || 'Science & Technology'}

Visibility: ${metadata.visibility || 'Public'}

Additional Settings:
- Monetization: Enable if desired
- Comments: Enable
- Allow Rumbles: Yes
- License: Standard Rumble License

STEP 4: Publish
---------------
1. Review all settings
2. Click "Upload Video"
3. Wait for processing to complete
4. Copy the video URL
5. Update episode record with Rumble URL

STEP 5: Update Episode Record
------------------------------
Use the following API call to save the Rumble URL:

curl -X PUT https://www.v2u.us/api/episodes/${episodeId}/rumble-url \\
  -H "Content-Type: application/json" \\
  -d '{"url": "https://rumble.com/v...YOUR_VIDEO_ID"}'

==========================
`;

  return {
    episodeId,
    videoUrl,
    downloadUrl: videoUrl,
    metadata,
    uploadInstructions,
    preparedAt: new Date().toISOString(),
  };
}

/**
 * Format Rumble description with timestamps
 */
export function formatRumbleDescription(
  description: string,
  timestamps?: Array<{ time: string; title: string }>,
  hashtags?: string[]
): string {
  let formatted = description;

  // Add timestamps if provided
  if (timestamps && timestamps.length > 0) {
    formatted += '\n\n⏱️ TIMESTAMPS:\n';
    timestamps.forEach((ts) => {
      formatted += `${ts.time} - ${ts.title}\n`;
    });
  }

  // Add hashtags if provided
  if (hashtags && hashtags.length > 0) {
    formatted += '\n\n' + hashtags.join(' ');
  }

  return formatted;
}

/**
 * Generate Rumble-optimized title
 * Rumble has a 60 character limit for titles in search results
 */
export function formatRumbleTitle(title: string): string {
  // Rumble allows longer titles but truncates in search
  // Keep it concise and front-load important keywords
  if (title.length <= 60) {
    return title;
  }

  // Truncate intelligently at word boundary
  const truncated = title.substring(0, 57);
  const lastSpace = truncated.lastIndexOf(' ');
  
  if (lastSpace > 40) {
    return truncated.substring(0, lastSpace) + '...';
  }

  return truncated + '...';
}

/**
 * Validate Rumble video requirements
 */
export function validateRumbleVideo(
  fileSizeBytes: number,
  durationSeconds: number
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Rumble file size limits
  const maxSizeGB = 10; // 10GB max
  const maxSizeBytes = maxSizeGB * 1024 * 1024 * 1024;

  if (fileSizeBytes > maxSizeBytes) {
    errors.push(`File size exceeds ${maxSizeGB}GB limit`);
  }

  // Rumble duration limits (typically very generous)
  const maxDurationHours = 24;
  const maxDurationSeconds = maxDurationHours * 60 * 60;

  if (durationSeconds > maxDurationSeconds) {
    errors.push(`Duration exceeds ${maxDurationHours} hour limit`);
  }

  // Minimum requirements
  if (fileSizeBytes < 1024) {
    errors.push('File size too small');
  }

  if (durationSeconds < 1) {
    errors.push('Duration too short');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
