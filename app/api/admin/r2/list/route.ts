// website/app/api/admin/r2/list/route.ts
// List files in R2 buckets

import { NextRequest, NextResponse } from 'next/server'
import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'

const r2Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY!,
    secretAccessKey: process.env.R2_SECRET_KEY!,
  },
})

// Validate R2 credentials on startup
if (!process.env.R2_ACCESS_KEY || !process.env.R2_SECRET_KEY) {
  console.error('❌ CRITICAL: R2_ACCESS_KEY or R2_SECRET_KEY missing!')
  console.error('   Run: npm run sync:r2-credentials')
}

export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    const cookieStore = await cookies()
    const token = cookieStore.get('v2u_admin_token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const jwtSecret = process.env.JWT_SECRET || 'your-jwt-secret'
    const decoded = jwt.verify(token, jwtSecret) as { adminId: string; role: string }

    if (!decoded.adminId || decoded.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    // Get bucket from query params
    const searchParams = request.nextUrl.searchParams
    const bucket = searchParams.get('bucket') || 'public'
    const bucketName = bucket === 'private' 
      ? (process.env.R2_BUCKET_PRIVATE || 'private')
      : (process.env.R2_BUCKET_PUBLIC || 'public')

    const command = new ListObjectsV2Command({
      Bucket: bucketName,
      MaxKeys: 1000,
    })

    const response = await r2Client.send(command)

    const files = (response.Contents || []).map(file => ({
      key: file.Key || '',
      size: file.Size || 0,
      lastModified: file.LastModified?.toISOString() || '',
      bucket,
    }))

    const totalSize = files.reduce((sum, file) => sum + file.size, 0)

    return NextResponse.json({
      files,
      count: files.length,
      totalSize,
      bucket: bucketName,
    })
  } catch (error) {
    console.error('R2 list error:', error)
    
    // Log more details for debugging
    if (error instanceof Error) {
      console.error('Error name:', error.name)
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to list files', 
        details: error instanceof Error ? error.message : 'Unknown error',
        name: error instanceof Error ? error.name : undefined,
      },
      { status: 500 }
    )
  }
}
