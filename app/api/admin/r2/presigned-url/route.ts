// Generate presigned URLs for direct R2 upload from browser
import { NextRequest, NextResponse } from 'next/server'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'

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
      fileName: string
      fileType: string
      fileSize: number
      lastModified: number
      bucket: string
    }

    const { fileName, fileType, fileSize, lastModified, bucket } = body

    if (!fileName) {
      return NextResponse.json(
        { error: 'fileName required' },
        { status: 400 }
      )
    }

    const bucketName = bucket === 'private' 
      ? (process.env.R2_BUCKET_PRIVATE || 'private')
      : (process.env.R2_BUCKET_PUBLIC || 'public')

    // Generate folder structure from file's creation date
    const fileDate = new Date(lastModified)
    const year = fileDate.getFullYear()
    const month = String(fileDate.getMonth() + 1).padStart(2, '0')
    const day = String(fileDate.getDate()).padStart(2, '0')
    const dateFolder = `${year}/${month}/${day}`

    // Slugify filename
    const ext = fileName.substring(fileName.lastIndexOf('.'))
    const nameWithoutExt = fileName.substring(0, fileName.lastIndexOf('.'))
    const slug = nameWithoutExt
      .toLowerCase()
      .replace(/[^a-z0-9._-]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')

    // Generate hash for uniqueness
    const hash = crypto
      .createHash('sha1')
      .update(fileName + Date.now().toString())
      .digest('hex')
      .substring(0, 8)

    // Build the full key
    const key = `${dateFolder}/${slug}-${hash}${ext}`

    // Create presigned URL for upload
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      ContentType: fileType,
      Metadata: {
        'original-name': fileName,
        'upload-date': new Date().toISOString(),
        'file-created': fileDate.toISOString(),
      },
    })

    // Generate presigned URL (valid for 1 hour)
    const presignedUrl = await getSignedUrl(r2Client, command, { expiresIn: 3600 })

    // Generate the public URL matching up-m.sh format
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID
    const publicUrl = `https://${accountId}.r2.cloudflarestorage.com/${bucketName}/${key}`

    console.log(`✅ Generated presigned URL for: ${fileName}`)
    console.log(`   Key: ${key}`)
    console.log(`   Size: ${fileSize} bytes`)

    return NextResponse.json({
      presignedUrl,
      key,
      publicUrl,
      bucket: bucketName,
      fileName,
      fileSize,
    })
  } catch (error) {
    console.error('Presigned URL generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate presigned URL', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
