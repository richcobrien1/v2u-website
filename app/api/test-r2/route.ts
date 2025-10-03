import { NextResponse } from 'next/server';
import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';

export async function GET() {
  try {
    // Log environment variables (safely)
    const envCheck = {
      R2_ENDPOINT: process.env.R2_ENDPOINT ? 'configured' : 'missing',
      R2_ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID ? 'configured' : 'missing', 
      R2_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY ? 'configured' : 'missing',
      R2_BUCKET_NAME: process.env.R2_BUCKET_NAME ? 'configured' : 'missing',
      // Legacy checks
      R2_ACCESS_KEY: process.env.R2_ACCESS_KEY ? 'configured' : 'missing',
      R2_SECRET_KEY: process.env.R2_SECRET_KEY ? 'configured' : 'missing',
      R2_BUCKET: process.env.R2_BUCKET ? 'configured' : 'missing',
    };

    console.log('Environment variables check:', envCheck);

    // Test R2 connection
    const r2Client = new S3Client({
      region: 'auto',
      endpoint: process.env.R2_ENDPOINT,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID || process.env.R2_ACCESS_KEY!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || process.env.R2_SECRET_KEY!,
      },
    });

    const bucketName = process.env.R2_BUCKET_NAME || process.env.R2_BUCKET || 'v2u-assets';

    console.log('Testing R2 connection with bucket:', bucketName);

    // Try to list objects in bucket
    const command = new ListObjectsV2Command({
      Bucket: bucketName,
      MaxKeys: 1, // Just test connection
    });

    const result = await r2Client.send(command);

    return NextResponse.json({
      success: true,
      message: 'R2 connection successful!',
      environment: envCheck,
      bucket: bucketName,
      objectCount: result.KeyCount || 0,
      testTime: new Date().toISOString()
    });

  } catch (error) {
    console.error('R2 test error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      environment: {
        R2_ENDPOINT: process.env.R2_ENDPOINT ? 'configured' : 'missing',
        R2_ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID ? 'configured' : 'missing', 
        R2_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY ? 'configured' : 'missing',
        R2_BUCKET_NAME: process.env.R2_BUCKET_NAME ? 'configured' : 'missing',
      },
      testTime: new Date().toISOString()
    }, { status: 500 });
  }
}