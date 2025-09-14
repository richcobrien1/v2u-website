// uploadToR2.ts
// Uploads a local MP4 to Cloudflare R2 using S3-compatible API
// Requires AWS SDK v3: npm install @aws-sdk/client-s3 dotenv
// Usage: Set R2 credentials in .env.local and call uploadMP4('localfile.mp4', 'remoteKey.mp4')

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import fs from 'fs'
import dotenv from 'dotenv'

dotenv.config()

const r2 = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY!,
    secretAccessKey: process.env.R2_SECRET_KEY!,
  },
})

async function uploadMP4(localPath: string, r2Key: string) {
  console.log(`📤 Starting upload: ${localPath} → ${r2Key}`)

  const fileStream = fs.createReadStream(localPath)

  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET!,
    Key: r2Key,
    Body: fileStream,
    ContentType: 'video/mp4',
  })

  try {
    await r2.send(command)
    console.log(`✅ Uploaded ${r2Key} to R2`)
  } catch (err) {
    console.error(`❌ Upload failed for ${r2Key}:`, err)
  }
}