// website/app/api/r2/private/list/route.ts
// API route to list private R2 content with authentication and subscription checks
// Uses JWT tokens for auth and checks KV store for subscriber access

import { NextRequest, NextResponse } from 'next/server'
import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'
import { checkAccess } from '@/lib/kv-client'

// Configure R2 client
const r2Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || process.env.R2_ACCESS_KEY!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || process.env.R2_SECRET_KEY!,
  },
})

export async function GET(req: NextRequest) {
  const token = cookies().get('v2u-token')?.value
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret') as {
      customerId: string
      subscription: string
    }

    const hasAccess = await checkAccess(decoded.customerId)
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Subscription required', customerId: decoded.customerId },
        { status: 403 }
      )
    }

    const bucketName = process.env.R2_BUCKET_NAME || process.env.R2_BUCKET || 'v2u-assets'
    const command = new ListObjectsV2Command({
      Bucket: bucketName,
      Prefix: 'private/',
    })
    const result = await r2Client.send(command)

    const keys = result.Contents?.map((obj) => obj.Key) ?? []
    return NextResponse.json({ keys })
  } catch (err) {
    console.error('Private list error', err)
    return NextResponse.json({ error: 'Invalid token' }, { status: 403 })
  }
}
