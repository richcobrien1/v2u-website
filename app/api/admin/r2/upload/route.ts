// website/app/api/admin/r2/upload/route.ts
// Upload files to R2 buckets

import { NextRequest, NextResponse } from 'next/server'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import ffmpeg from 'fluent-ffmpeg'
import { writeFile, unlink } from 'fs/promises'
import path from 'path'
import os from 'os'

const r2Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY!,
    secretAccessKey: process.env.R2_SECRET_KEY!,
  },
})

/**
 * Optimize video file for web playback using ffmpeg
 * Adds faststart flag to move metadata (moov atom) to beginning of file
 * This allows browsers to display duration and seek properly
 */
async function optimizeVideo(inputBuffer: Buffer, originalFilename: string): Promise<Buffer> {
  const tempDir = os.tmpdir()
  const tempId = crypto.randomBytes(8).toString('hex')
  const inputPath = path.join(tempDir, `input-${tempId}-${originalFilename}`)
  const outputPath = path.join(tempDir, `output-${tempId}-${originalFilename}`)

  try {
    // Write input buffer to temp file
    await writeFile(inputPath, inputBuffer)

    // Process video with ffmpeg
    await new Promise<void>((resolve, reject) => {
      ffmpeg(inputPath)
        .outputOptions('-c', 'copy') // Copy streams without re-encoding (fast)
        .outputOptions('-movflags', '+faststart') // Move moov atom to beginning
        .output(outputPath)
        .on('end', () => resolve())
        .on('error', (err) => reject(err))
        .run()
    })

    // Read optimized video
    const { readFile } = await import('fs/promises')
    const optimizedBuffer = await readFile(outputPath)
    
    // Cleanup temp files
    await unlink(inputPath).catch(() => {})
    await unlink(outputPath).catch(() => {})

    return optimizedBuffer
  } catch (error) {
    // Cleanup on error
    await unlink(inputPath).catch(() => {})
    await unlink(outputPath).catch(() => {})
    throw error
  }
}

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

    const formData = await request.formData()
    const files = formData.getAll('files') as File[]
    const bucket = formData.get('bucket') as string || 'public'

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
      let buffer = Buffer.from(await file.arrayBuffer())
      
      // Optimize video files for web playback
      const isVideo = file.type.startsWith('video/') || 
                     file.name.match(/\.(mp4|mov|avi|mkv|webm)$/i)
      
      if (isVideo) {
        try {
          console.log(`🎬 Optimizing video: ${file.name}...`)
          buffer = Buffer.from(await optimizeVideo(buffer, file.name))
          console.log(`✅ Video optimized with faststart flag`)
        } catch (error) {
          console.error(`⚠️ Video optimization failed, uploading original:`, error)
          // Continue with original buffer if optimization fails
        }
      }
      
      // Generate folder structure from file's creation date (lastModified timestamp)
      const fileDate = new Date(file.lastModified)
      const year = fileDate.getFullYear()
      const month = String(fileDate.getMonth() + 1).padStart(2, '0')
      const day = String(fileDate.getDate()).padStart(2, '0')
      const dateFolder = `${year}/${month}/${day}`
      
      // Slugify filename: lowercase, replace spaces/special chars with dashes
      const originalName = file.name
      const ext = originalName.substring(originalName.lastIndexOf('.'))
      const nameWithoutExt = originalName.substring(0, originalName.lastIndexOf('.'))
      const slug = nameWithoutExt
        .toLowerCase()
        .replace(/[^a-z0-9._-]+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
      
      // Generate hash for uniqueness (8 chars from timestamp + filename)
      const hash = crypto
        .createHash('sha1')
        .update(originalName + Date.now().toString())
        .digest('hex')
        .substring(0, 8)
      
      // Build the full key with date structure and sanitized filename
      const key = `${dateFolder}/${slug}-${hash}${ext}`

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
        
        // Generate public URL
        const r2PublicUrl = process.env.R2_PUBLIC_URL || `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`
        const url = `${r2PublicUrl}/${bucketName}/${key}`
        
        uploadResults.push({
          success: true,
          bucket: bucketName,
          filename: file.name,
          key,
          size: file.size,
          url,
        })

        console.log(`✅ Uploaded: ${key} to ${bucketName} (${file.size} bytes)`)
        console.log(`   URL: ${url}`)
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
