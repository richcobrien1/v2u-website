import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    r2_endpoint: process.env.R2_ENDPOINT ? 'configured' : 'missing',
    r2_access_key: process.env.R2_ACCESS_KEY ? 'configured' : 'missing',
    r2_secret_key: process.env.R2_SECRET_KEY ? 'configured' : 'missing',
    r2_bucket: process.env.R2_BUCKET || 'not set',
    jwt_secret: process.env.JWT_SECRET ? 'configured' : 'missing'
  });
}