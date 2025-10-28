// website/app/api/admin/r2/upload/route.ts
// Upload files to R2 buckets

import { NextRequest, NextResponse } from 'next/server'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
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
    const token = cookieStore.get('v2u-admin-token')?.value

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

    const formData = await request.formData()
    const files = formData.getAll('files') as File[]
    const bucket = formData.get('bucket') as string || 'public'
    const uploadPath = formData.get('path') as string || ''

    if (files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      )
    }

    const bucketName = bucket === 'private' 
      ? (process.env.R2_BUCKET_PRIVATE || 'private')
      : (process.env.R2_BUCKET_PUBLIC || 'public')

    const uploadResults = []

    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer())
      
      // Generate timestamp from file's last modified date
      const fileDate = new Date(file.lastModified)
      const year = fileDate.getFullYear()
      const month = String(fileDate.getMonth() + 1).padStart(2, '0')
      const day = String(fileDate.getDate()).padStart(2, '0')
      
      // Build the full key with date structure
      const dateFolder = `${year}/${month}/${day}`
      const fullPath = uploadPath ? `${uploadPath}/${dateFolder}` : dateFolder
      const key = `${fullPath}/${file.name}`

      try {
        const command = new PutObjectCommand({
          Bucket: bucketName,
          Key: key,
          Body: buffer,
          ContentType: file.type,
          Metadata: {
            'original-name': file.name,
            'upload-date': new Date().toISOString(),
            'file-created': fileDate.toISOString(),
          },
        })

        await r2Client.send(command)
        
        uploadResults.push({
          success: true,
          key,
          size: file.size,
          bucket: bucketName,
        })

        console.log(`✅ Uploaded: ${key} to ${bucketName} (${file.size} bytes)`)
      } catch (uploadError) {
        console.error(`Failed to upload ${file.name}:`, uploadError)
        uploadResults.push({
          success: false,
          file: file.name,
          error: uploadError instanceof Error ? uploadError.message : 'Upload failed',
        })
      }
    }

    const successCount = uploadResults.filter(r => r.success).length
    const failCount = uploadResults.filter(r => !r.success).length

    return NextResponse.json({
      message: `Uploaded ${successCount} file(s)${failCount > 0 ? `, ${failCount} failed` : ''}`,
      results: uploadResults,
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Upload failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
