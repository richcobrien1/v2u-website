import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Configure R2 client
const r2Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || process.env.R2_ACCESS_KEY!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || process.env.R2_SECRET_KEY!,
  },
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const resolvedParams = await params;
    const authHeader = request.headers.get('authorization');
    
    // For development/testing, allow access without strict auth
    let customerId = 'test-user';
    let hasValidAuth = false;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '');
      
      if (token.startsWith('test-token-') || 
          token.includes('test-signature-for-development') ||
          token.startsWith('dev-jwt-test-token')) {
        // Handle test tokens for development
        console.log('Using test token for development:', token.slice(0, 20) + '...');
        customerId = 'test-user-' + token.slice(-4);
        hasValidAuth = true;
      } else {
        // Verify real JWT token
        try {
          const jwtSecret = process.env.JWT_SECRET || 'default-secret-for-testing';
          
          const decoded = jwt.verify(token, jwtSecret) as {
            customerId: string;
            iat: number;
            exp: number;
            [key: string]: unknown;
          };

          console.log('JWT verified for customer:', decoded.customerId);
          customerId = decoded.customerId;
          hasValidAuth = true;
          
        } catch (jwtError) {
          console.error('JWT verification failed:', jwtError);
          // Don't fail immediately - allow test access for now
        }
      }
    }
    
    // For development, allow access even without auth
    if (!hasValidAuth) {
      console.log('⚠️ Allowing test access to private content without auth');
      customerId = 'test-user-no-auth';
    }

    // Construct file path from URL params
    const filePath = resolvedParams.path.join('/');
    
    console.log('Private R2 access request:', {
      filePath,
      customerId,
      userAgent: request.headers.get('user-agent')?.slice(0, 50) + '...'
    });

    // Access private content from R2
    const bucketName = process.env.R2_BUCKET_NAME || process.env.R2_BUCKET || 'v2u-assets';
    
    // For private content, the key should include the private/ prefix
    const r2Key = `private/${filePath}`;

    console.log('Attempting private R2 access:', {
      bucket: bucketName,
      key: r2Key,
      customerId
    });

    try {
      // Generate a signed URL for the private file
      const command = new GetObjectCommand({
        Bucket: bucketName,
        Key: r2Key,
      });

      const signedUrl = await getSignedUrl(r2Client, command, { 
        expiresIn: 3600 // 1 hour
      });

      console.log('✅ Generated signed URL for private content:', r2Key);

      // Return a redirect to the signed URL (just like public route)
      return NextResponse.redirect(signedUrl);

    } catch (r2Error) {
      console.error('Private R2 access error:', r2Error);
      
      // Fallback: Return mock response for testing
      return NextResponse.json({
        error: 'Private file not found in R2',
        details: 'This is a mock response - R2 credentials may not be configured',
        filePath,
        r2Key,
        bucket: bucketName,
        customerId,
        mockAudioUrl: '/test-audio-file.mp3',
        note: 'Using mock audio for testing - configure R2 credentials for real files'
      }, { status: 404 });
    }

  } catch (error) {
    console.error('Private R2 access error details:', error);
    return NextResponse.json(
      { 
        error: 'Private file access failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
