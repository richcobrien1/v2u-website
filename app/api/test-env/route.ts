import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  return NextResponse.json({
    hasR2Endpoint: !!process.env.R2_ENDPOINT,
    hasR2AccessKey: !!process.env.R2_ACCESS_KEY,
    hasR2SecretKey: !!process.env.R2_SECRET_KEY,
    r2EndpointLength: process.env.R2_ENDPOINT?.length || 0,
    r2AccessKeyLength: process.env.R2_ACCESS_KEY?.length || 0,
    r2SecretKeyLength: process.env.R2_SECRET_KEY?.length || 0,
    nodeEnv: process.env.NODE_ENV,
    // Show first 10 chars for debugging
    r2EndpointPreview: process.env.R2_ENDPOINT?.substring(0, 30) || 'MISSING',
    r2AccessKeyPreview: process.env.R2_ACCESS_KEY?.substring(0, 10) || 'MISSING',
  })
}
