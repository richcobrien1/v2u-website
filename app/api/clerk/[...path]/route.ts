import { NextRequest, NextResponse } from 'next/server'

const CLERK_API_URL = 'https://n5gne8i9g39o.clerk.accounts.dev'
const PROXY_URL = 'https://www.v2u.us/api/clerk'

async function handler(req: NextRequest) {
  const { pathname, search } = req.nextUrl
  // Strip the /api/clerk prefix to get the Clerk path
  const clerkPath = pathname.replace(/^\/api\/clerk/, '')
  const targetUrl = `${CLERK_API_URL}${clerkPath}${search}`

  // Forward all headers, adding Clerk-Proxy-Url
  const headers = new Headers(req.headers)
  headers.set('Clerk-Proxy-Url', PROXY_URL)
  headers.set('host', 'n5gne8i9g39o.clerk.accounts.dev')

  const body = req.method !== 'GET' && req.method !== 'HEAD'
    ? await req.arrayBuffer()
    : undefined

  const response = await fetch(targetUrl, {
    method: req.method,
    headers,
    body,
  })

  // Forward response headers back
  const responseHeaders = new Headers(response.headers)

  return new NextResponse(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: responseHeaders,
  })
}

export const GET = handler
export const POST = handler
export const PUT = handler
export const PATCH = handler
export const DELETE = handler
export const HEAD = handler
export const OPTIONS = handler
