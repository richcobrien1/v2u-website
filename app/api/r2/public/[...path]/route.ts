import { NextRequest, NextResponse } from 'next/server';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Configure R2 client
const r2Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY!,
    secretAccessKey: process.env.R2_SECRET_KEY!,
  },
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const resolvedParams = await params;
    
    // Public content doesn't require authentication, but we can still check for optional auth
    const authHeader = request.headers.get('authorization');
    let hasAuth = false;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '');
      // For public content, any valid token format is accepted
      if (token.startsWith('test-token-') || 
          token.includes('test-signature-for-development') ||
          token.startsWith('dev-jwt-test-token') ||
          token.length > 10) {
        hasAuth = true;
      }
    }

    // Construct file path from URL params
    const filePath = resolvedParams.path.join('/');
    
    console.log('Public R2 access request:', {
      filePath,
      hasAuth,
      userAgent: request.headers.get('user-agent')?.slice(0, 50) + '...'
    });

    // For public content, we can provide direct access or signed URLs
    const bucketName = process.env.R2_BUCKET || 'v2u-assets';
    
    // Create the full key path for R2
    // The path from URL already includes the structure: daily/landscape/2025/10/02/filename.mp4
    const r2Key = filePath;

    console.log('Attempting R2 access:', {
      bucket: bucketName,
      key: r2Key
    });

    try {
      // Generate a signed URL for the file
      const command = new GetObjectCommand({
        Bucket: bucketName,
        Key: r2Key,
      });

      const signedUrl = await getSignedUrl(r2Client, command, { 
        expiresIn: 3600 // 1 hour
      });

      console.log('✅ Generated signed URL for public content:', r2Key);

      // Return a redirect to the signed URL
      return NextResponse.redirect(signedUrl);

    } catch (r2Error) {
      console.error('R2 access error:', r2Error);
      
      // Fallback: Return mock response for testing
      return NextResponse.json({
        error: 'File not found in R2',
        details: 'This is a mock response - R2 credentials may not be configured',
        filePath,
        r2Key,
        bucket: bucketName,
        hasAuth,
        mockAudioUrl: '/test-audio-file.mp3',
        note: 'Using mock audio for testing - configure R2 credentials for real files'
      }, { status: 404 });
    }

  } catch (error) {
    console.error('Public R2 route error:', error);
    return NextResponse.json(
      { 
        error: 'Public file access failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}