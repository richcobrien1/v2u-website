// Comprehensive R2 Upload System for v2u
// Consolidates all upload functionality in one place

import { S3Client, PutObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// R2 Configuration
const r2Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY!,
    secretAccessKey: process.env.R2_SECRET_KEY!,
  },
});

export interface UploadOptions {
  localPath: string;
  remotePath?: string;
  contentType?: string;
  bucket?: string;
  metadata?: Record<string, string>;
}

export interface EpisodeMetadata {
  title: string;
  description: string;
  category: 'ai-deep-dive' | 'ai-deep-dive-educate' | 'ai-deep-dive-commercial' | 'ai-deep-dive-conceptual' | 'ai-deep-dive-reviews';
  format: 'portrait' | 'landscape';
  isPremium: boolean;
  duration?: string;
  publishDate?: string;
}

// Main upload function
export async function uploadToR2(options: UploadOptions): Promise<string | null> {
  const {
    localPath,
    remotePath,
    contentType = 'video/mp4',
    bucket = process.env.R2_BUCKET || 'v2u-private',
    metadata = {}
  } = options;

  console.log('🚀 Starting R2 upload...');
  console.log('📁 Local:', localPath);

  try {
    // Verify file exists
    if (!fs.existsSync(localPath)) {
      throw new Error(`File not found: ${localPath}`);
    }

    // Generate remote path if not provided
    const finalRemotePath = remotePath || path.basename(localPath);
    
    // Get file stats
    const stats = fs.statSync(localPath);
    console.log(`📊 File size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
    console.log('☁️  Remote path:', finalRemotePath);

    const fileStream = fs.createReadStream(localPath);
    
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: finalRemotePath,
      Body: fileStream,
      ContentType: contentType,
      Metadata: metadata,
    });

    await r2Client.send(command);
    
    console.log('✅ Upload successful!');
    console.log('🔗 R2 Key:', finalRemotePath);
    
    return finalRemotePath;
    
  } catch (error) {
    console.error('❌ Upload failed:', error);
    return null;
  }
}

// Episode-specific upload function
export async function uploadEpisode(
  localPath: string, 
  metadata: EpisodeMetadata
): Promise<{ success: boolean; r2Path?: string; apiPath?: string }> {
  
  // Generate organized path based on metadata
  const datePart = metadata.publishDate || new Date().toISOString().split('T')[0];
  const [year, month] = datePart.split('-');
  
  let directory: string;
  
  if (metadata.isPremium) {
    // Premium content goes to private directories
    if (metadata.category === 'ai-deep-dive-educate') {
      directory = `private/educate/advanced/${year}/${month}`;
    } else if (metadata.category === 'ai-deep-dive-commercial') {
      directory = `private/categories/commercial/${year}/${month}`;
    } else if (metadata.category === 'ai-deep-dive-conceptual') {
      directory = `private/categories/conceptual/${year}/${month}`;
    } else if (metadata.category === 'ai-deep-dive-reviews') {
      directory = `private/reviews/monthly/${year}/${month}`;
    } else {
      directory = `private/premium/${year}/${month}`;
    }
  } else {
    // Free content goes to public directories
    directory = `public/daily/${metadata.format}/${year}/${month}`;
  }
  
  // Clean filename
  const originalName = path.basename(localPath, path.extname(localPath));
  const extension = path.extname(localPath);
  const cleanName = originalName
    .replace(/[^a-zA-Z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .toLowerCase();
  
  const fileName = `${cleanName}${extension}`;
  const remotePath = `${directory}/${fileName}`;
  
  console.log('🎬 Uploading episode...');
  console.log('📝 Title:', metadata.title);
  console.log('📂 Category:', metadata.category);
  console.log('🎯 Format:', metadata.format);
  console.log('🔒 Premium:', metadata.isPremium);
  
  const uploadResult = await uploadToR2({
    localPath,
    remotePath,
    metadata: {
      title: metadata.title,
      description: metadata.description,
      category: metadata.category,
      format: metadata.format,
      premium: metadata.isPremium.toString(),
      duration: metadata.duration || '',
      publishDate: metadata.publishDate || new Date().toISOString(),
    }
  });
  
  if (uploadResult) {
    const apiPath = `/api/r2/${metadata.isPremium ? 'private' : 'public'}/${uploadResult}`;
    
    console.log('🎉 Episode upload complete!');
    console.log('🔗 API Path:', apiPath);
    console.log('🧪 Test at: http://localhost:3000/r2-test');
    
    return {
      success: true,
      r2Path: uploadResult,
      apiPath
    };
  }
  
  return { success: false };
}

// Browse R2 contents
export async function browseR2(prefix: string = '', bucket?: string): Promise<string[]> {
  try {
    const command = new ListObjectsV2Command({
      Bucket: bucket || process.env.R2_BUCKET || 'v2u-private',
      Prefix: prefix,
      MaxKeys: 100,
    });
    
    const response = await r2Client.send(command);
    return response.Contents?.map(obj => obj.Key || '') || [];
    
  } catch (error) {
    console.error('❌ Browse failed:', error);
    return [];
  }
}

// CLI interface for quick uploads
if (import.meta.url === `file://${process.argv[1]}`) {
  const [,, action, ...args] = process.argv;
  
  switch (action) {
    case 'upload':
      const [localPath, remotePath] = args;
      if (!localPath) {
        console.log('Usage: npm run upload [localPath] [remotePath]');
        process.exit(1);
      }
      uploadToR2({ localPath, remotePath });
      break;
      
    case 'browse':
      const [prefix] = args;
      browseR2(prefix || '').then(files => {
        console.log('📁 R2 Contents:');
        files.forEach(file => console.log(`  ${file}`));
      });
      break;
      
    default:
      console.log('Available commands:');
      console.log('  upload [localPath] [remotePath] - Upload file to R2');
      console.log('  browse [prefix] - List R2 contents');
  }
}