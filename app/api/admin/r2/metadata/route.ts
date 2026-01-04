// Get file metadata from R2
import { NextRequest, NextResponse } from 'next/server'
import { S3Client, HeadObjectCommand } from '@aws-sdk/client-s3'

const r2Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY!,
    secretAccessKey: process.env.R2_SECRET_KEY!,
  },
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const key = searchParams.get('key')
    const bucket = searchParams.get('bucket') || 'public'

    if (!key) {
      return NextResponse.json({ error: 'key required' }, { status: 400 })
    }

    const bucketName = bucket === 'private' 
      ? (process.env.R2_BUCKET_PRIVATE || 'private')
      : (process.env.R2_BUCKET_PUBLIC || 'public')

    const command = new HeadObjectCommand({
      Bucket: bucketName,
      Key: key,
    })

    const response = await r2Client.send(command)

    return NextResponse.json({
      metadata: response.Metadata || {},
      contentType: response.ContentType,
      contentLength: response.ContentLength,
      lastModified: response.LastModified?.toISOString(),
    })
  } catch (error) {
    console.error('Error fetching metadata:', error)
    return NextResponse.json(
      { error: 'Failed to fetch metadata' },
      { status: 500 }
    )
  }
}
