import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

// R2 client configuration would go here when implementing real listing
// import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';

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
    
    // Verify JWT token (same logic as file access)
    let customerId = 'test-user';
    
    if (token.startsWith('test-token-') || 
        token.includes('test-signature-for-development') ||
        token.startsWith('dev-jwt-test-token')) {
      console.log('Using test token for directory browsing:', token.slice(0, 20) + '...');
      customerId = 'test-user-' + token.slice(-4);
    } else {
      try {
        const jwtSecret = process.env.JWT_SECRET || 'default-secret-for-testing';
        const decoded = jwt.verify(token, jwtSecret) as {
          customerId: string;
          iat: number;
          exp: number;
          [key: string]: unknown;
        };
        console.log('JWT verified for directory browsing:', decoded.customerId);
        customerId = decoded.customerId;
      } catch (jwtError) {
        console.error('JWT verification failed:', jwtError);
        return NextResponse.json(
          { error: 'Invalid or expired token' },
          { status: 403 }
        );
      }
    }

    // Construct directory path from URL params
    const directoryPath = resolvedParams.path.join('/');
    
    // Mock directory structure for testing
    const mockDirectories = {
      'private/educate/beginner': {
        directories: ['season-1/', 'season-2/'],
        files: [],
        structure: 'Educational content for beginners'
      },
      'private/educate/intermediate': {
        directories: ['season-1/', 'season-2/'],
        files: [],
        structure: 'Educational content for intermediate users'
      },
      'private/educate/advanced': {
        directories: ['season-1/', 'season-2/'],
        files: [],
        structure: 'Educational content for advanced users'
      },
      'private/reviews/weekly': {
        directories: ['2025/'],
        files: [],
        structure: 'Weekly AI tool reviews and reports'
      },
      'private/reviews/monthly': {
        directories: ['2025/'],
        files: [],
        structure: 'Monthly comprehensive AI reports'
      },
      'private/projects/safeshipping': {
        directories: ['development-updates/', 'tutorials/'],
        files: [],
        structure: 'SafeShipping project content'
      },
      'private/projects/trafficjamz': {
        directories: ['feature-demos/', 'case-studies/'],
        files: [],
        structure: 'TrafficJamz project content'
      },
      'private/projects/mealsondemand': {
        directories: ['business-model/', 'technology/'],
        files: [],
        structure: 'MealsOnDemand project content'
      },
      'public/daily/portrait': {
        directories: ['2025/'],
        files: [],
        structure: 'Daily AI-Now episodes in portrait format'
      },
      'public/daily/landscape': {
        directories: ['2025/'],
        files: [],
        structure: 'Daily AI-Now episodes in landscape format'
      }
    };

    const directoryInfo = mockDirectories[directoryPath as keyof typeof mockDirectories];
    
    if (!directoryInfo) {
      return NextResponse.json({
        success: false,
        error: 'Directory not found or not accessible',
        path: directoryPath,
        availableDirectories: Object.keys(mockDirectories)
      }, { status: 404 });
    }

    // Return mock directory listing
    return NextResponse.json({
      success: true,
      path: directoryPath,
      customerId: customerId,
      ...directoryInfo,
      note: 'This is a mock directory listing - real R2 integration needs environment variables',
      totalItems: directoryInfo.directories.length + directoryInfo.files.length,
      browsedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Directory browse error:', error);
    return NextResponse.json(
      { 
        error: 'Directory browse failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}