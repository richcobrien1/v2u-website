// Delete files from R2 buckets
import { NextRequest, NextResponse } from 'next/server'
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3'
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

export async function DELETE(request: NextRequest) {
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

    const body = await request.json() as {
      keys: string[]
      bucket: string
    }

    const { keys, bucket } = body

    if (!keys || !Array.isArray(keys) || keys.length === 0) {
      return NextResponse.json(
        { error: 'keys array required' },
        { status: 400 }
      )
    }

    if (!bucket || !['public', 'private'].includes(bucket)) {
      return NextResponse.json(
        { error: 'valid bucket required (public or private)' },
        { status: 400 }
      )
    }

    const bucketName = bucket === 'private'
      ? (process.env.R2_BUCKET_PRIVATE || 'private')
      : (process.env.R2_BUCKET_PUBLIC || 'public')

    const results = []

    // Delete each file
    for (const key of keys) {
      try {
        const command = new DeleteObjectCommand({
          Bucket: bucketName,
          Key: key,
        })

        await r2Client.send(command)
        results.push({ key, success: true })
        console.log(`🗑️ Deleted: ${key} from ${bucket}`)
      } catch (error) {
        console.error(`Failed to delete ${key}:`, error)
        results.push({
          key,
          success: false,
          error: error instanceof Error ? error.message : 'Delete failed'
        })
      }
    }

    const successCount = results.filter(r => r.success).length
    const failureCount = results.length - successCount

    return NextResponse.json({
      success: failureCount === 0,
      results,
      summary: {
        total: results.length,
        successful: successCount,
        failed: failureCount
      }
    })
  } catch (error) {
    console.error('Delete operation error:', error)
    return NextResponse.json(
      { error: 'Failed to delete files', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}