import { NextRequest, NextResponse } from 'next/server';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import jwt from 'jsonwebtoken';

// Configure R2 client using your existing pattern from uploadToR2.ts
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
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing authorization header' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Verify JWT token
    try {
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        console.error('JWT_SECRET not configured');
        return NextResponse.json(
          { error: 'Server configuration error' },
          { status: 500 }
        );
      }

      const decoded = jwt.verify(token, jwtSecret) as {
        customerId: string;
        iat: number;
        exp: number;
        [key: string]: unknown;
      };

      // TODO: Add subscription status verification here
      console.log('JWT verified for customer:', decoded.customerId);
      
    } catch (jwtError) {
      console.error('JWT verification failed:', jwtError);
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Construct file path from URL params
    const filePath = resolvedParams.path.join('/');
    
    // Generate presigned URL for secure R2 access
    const command = new GetObjectCommand({
      Bucket: process.env.R2_BUCKET!,
      Key: filePath,
    });

    const presignedUrl = await getSignedUrl(r2Client, command, {
      expiresIn: 3600, // 1 hour
    });

    return NextResponse.json({
      success: true,
      url: presignedUrl,
      path: filePath,
      expires: new Date(Date.now() + 3600000).toISOString(),
      message: 'Secure R2 access granted'
    });

  } catch (error) {
    console.error('R2 access error:', error);
    return NextResponse.json(
      { error: 'File access failed' },
      { status: 500 }
    );
  }
}
