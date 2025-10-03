import { NextResponse } from 'next/server';
import { S3Client, HeadObjectCommand } from '@aws-sdk/client-s3';

const r2Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || process.env.R2_ACCESS_KEY!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || process.env.R2_SECRET_KEY!,
  },
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const videoKey = searchParams.get('video');
  
  if (!videoKey) {
    return NextResponse.json({ error: 'Missing video parameter' }, { status: 400 });
  }

  const bucketName = process.env.R2_BUCKET_NAME || process.env.R2_BUCKET || 'v2u-assets';
  
  // Generate potential thumbnail paths
  const basePath = videoKey.replace(/\.(mp4|mov|avi|mkv)$/i, '');
  const thumbnailOptions = [
    `${basePath}.jpg`,
    `${basePath}.jpeg`,
    `${basePath}.png`,
    `${basePath}.webp`,
  ];

  const results = [];

  for (const thumbnailPath of thumbnailOptions) {
    try {
      const command = new HeadObjectCommand({
        Bucket: bucketName,
        Key: thumbnailPath,
      });

      await r2Client.send(command);
      results.push({
        path: thumbnailPath,
        exists: true,
        url: `/api/r2/public/${thumbnailPath}`
      });
    } catch (error) {
      results.push({
        path: thumbnailPath,
        exists: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  return NextResponse.json({
    video: videoKey,
    thumbnails: results,
    recommendation: results.find(r => r.exists)?.url || '/Ai-Now-Educate-YouTube.jpg'
  });
}