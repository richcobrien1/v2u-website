/**
 * R2 Image Upload for Instagram Automation
 * 
 * Uploads generated episode images to Cloudflare R2 for use with Instagram Graph API.
 * Images are stored in the 'promos' bucket and made publicly accessible.
 */

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

// Initialize R2 client (S3-compatible)
const r2Client = new S3Client({
  region: process.env.R2_REGION || 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY!,
    secretAccessKey: process.env.R2_SECRET_KEY!,
  },
});

/**
 * Convert base64 data URL to Buffer
 */
function dataUrlToBuffer(dataUrl: string): Buffer {
  // Extract base64 data from data URL (e.g., "data:image/png;base64,iVBORw0KG...")
  const base64Data = dataUrl.split(',')[1];
  if (!base64Data) {
    throw new Error('Invalid data URL format');
  }
  return Buffer.from(base64Data, 'base64');
}

/**
 * Extract content type from data URL
 */
function getContentTypeFromDataUrl(dataUrl: string): string {
  const match = dataUrl.match(/data:([^;]+);/);
  return match ? match[1] : 'image/png';
}

/**
 * Upload image to Cloudflare R2 and return public URL
 * 
 * @param dataUrl - Base64 data URL of the image (from image-generator.ts)
 * @param filename - Desired filename (e.g., "episode-123456.png")
 * @returns Public URL of the uploaded image
 */
export async function uploadImageToR2(
  dataUrl: string,
  filename: string
): Promise<string> {
  console.log(`[R2 Upload] Starting upload: ${filename}`);

  // Convert data URL to buffer
  const imageBuffer = dataUrlToBuffer(dataUrl);
  const contentType = getContentTypeFromDataUrl(dataUrl);

  // Use promos bucket for social media images
  const bucket = process.env.R2_BUCKET_PROMOS || 'promos';
  const key = `instagram/${filename}`;

  console.log(`[R2 Upload] Uploading to bucket: ${bucket}, key: ${key}`);
  console.log(`[R2 Upload] Content-Type: ${contentType}, Size: ${imageBuffer.length} bytes`);

  try {
    // Upload to R2
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: imageBuffer,
      ContentType: contentType,
      // Make publicly accessible
      ACL: 'public-read',
      // Add cache control for social media crawlers
      CacheControl: 'public, max-age=31536000', // 1 year
    });

    await r2Client.send(command);

    // Construct public URL
    // Format: https://{bucket}.{account_id}.r2.cloudflarestorage.com/{key}
    // Or if you have a custom domain, use that instead
    const publicUrl = constructPublicUrl(bucket, key);

    console.log(`[R2 Upload] ✅ Upload successful: ${publicUrl}`);
    return publicUrl;

  } catch (error) {
    console.error(`[R2 Upload] ❌ Upload failed:`, error);
    throw new Error(`Failed to upload image to R2: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Construct public URL for R2 object
 * 
 * Note: R2 buckets need to be configured with public access.
 * You can either:
 * 1. Use R2 public buckets: https://{bucket}.{account_id}.r2.cloudflarestorage.com/{key}
 * 2. Use a custom domain configured in Cloudflare dashboard
 * 
 * For now, we'll construct the direct R2 URL. If you have a custom domain,
 * set R2_PUBLIC_DOMAIN in your environment variables.
 */
function constructPublicUrl(bucket: string, key: string): string {
  // Check if custom domain is configured
  const customDomain = process.env.R2_PUBLIC_DOMAIN;
  if (customDomain) {
    return `${customDomain}/${key}`;
  }

  // Extract account ID from endpoint
  // Format: https://{account_id}.r2.cloudflarestorage.com
  const endpoint = process.env.R2_ENDPOINT || '';
  const accountIdMatch = endpoint.match(/https:\/\/([^.]+)\.r2\.cloudflarestorage\.com/);
  
  if (!accountIdMatch) {
    throw new Error('Cannot determine R2 account ID from endpoint');
  }

  const accountId = accountIdMatch[1];
  
  // R2 public URL format (requires bucket to have public access enabled)
  return `https://${bucket}.${accountId}.r2.cloudflarestorage.com/${key}`;
}

/**
 * Generate unique filename for Instagram episode image
 */
export function generateInstagramFilename(episodeNumber?: number): string {
  const timestamp = Date.now();
  const episodePrefix = episodeNumber ? `episode-${episodeNumber}` : 'episode';
  return `${episodePrefix}-${timestamp}.png`;
}

/**
 * Delete image from R2 (cleanup old images)
 */
export async function deleteImageFromR2(filename: string): Promise<void> {
  const bucket = process.env.R2_BUCKET_PROMOS || 'promos';
  const key = `instagram/${filename}`;

  console.log(`[R2 Delete] Deleting: ${key}`);

  try {
    const { DeleteObjectCommand } = await import('@aws-sdk/client-s3');
    const command = new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    await r2Client.send(command);
    console.log(`[R2 Delete] ✅ Deleted: ${key}`);
  } catch (error) {
    console.error(`[R2 Delete] ❌ Delete failed:`, error);
    // Don't throw - deletion is non-critical
  }
}
