// Copy/move files between R2 buckets
import { NextRequest, NextResponse } from 'next/server'
import { S3Client, CopyObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
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

export async function POST(request: NextRequest) {
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
      fromBucket: string
      toBucket: string
      operation: 'copy' | 'move'
    }

    const { keys, fromBucket, toBucket, operation } = body

    if (!keys || !Array.isArray(keys) || keys.length === 0) {
      return NextResponse.json(
        { error: 'keys array required' },
        { status: 400 }
      )
    }

    if (!fromBucket || !toBucket || !['public', 'private'].includes(fromBucket) || !['public', 'private'].includes(toBucket)) {
      return NextResponse.json(
        { error: 'valid fromBucket and toBucket required (public or private)' },
        { status: 400 }
      )
    }

    if (!operation || !['copy', 'move'].includes(operation)) {
      return NextResponse.json(
        { error: 'operation must be copy or move' },
        { status: 400 }
      )
    }

    const fromBucketName = fromBucket === 'private'
      ? (process.env.R2_BUCKET_PRIVATE || 'private')
      : (process.env.R2_BUCKET_PUBLIC || 'public')

    const toBucketName = toBucket === 'private'
      ? (process.env.R2_BUCKET_PRIVATE || 'private')
      : (process.env.R2_BUCKET_PUBLIC || 'public')

    const results = []

    // Copy/move each file
    for (const key of keys) {
      try {
        // Copy to destination bucket
        const copyCommand = new CopyObjectCommand({
          CopySource: `${fromBucketName}/${key}`,
          Bucket: toBucketName,
          Key: key,
        })

        await r2Client.send(copyCommand)

        // If moving, delete from source bucket
        if (operation === 'move') {
          const deleteCommand = new DeleteObjectCommand({
            Bucket: fromBucketName,
            Key: key,
          })
          await r2Client.send(deleteCommand)
        }

        results.push({
          key,
          success: true,
          operation: operation === 'move' ? 'moved' : 'copied',
          from: fromBucket,
          to: toBucket
        })

        console.log(`${operation === 'move' ? '📦' : '📋'} ${operation === 'move' ? 'Moved' : 'Copied'}: ${key} from ${fromBucket} to ${toBucket}`)
      } catch (error) {
        console.error(`Failed to ${operation} ${key}:`, error)
        results.push({
          key,
          success: false,
          error: error instanceof Error ? error.message : `${operation} failed`
        })
      }
    }

    const successCount = results.filter(r => r.success).length
    const failureCount = results.length - successCount

    return NextResponse.json({
      success: failureCount === 0,
      operation,
      results,
      summary: {
        total: results.length,
        successful: successCount,
        failed: failureCount
      }
    })
  } catch (error) {
    console.error('Copy/move operation error:', error)
    return NextResponse.json(
      { error: 'Failed to copy/move files', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}