/**
 * Middleware - TEMPORARILY DISABLED
 * 
 * Clerk authentication disabled until environment variables are configured in Vercel.
 * TODO: Add CLERK_PUBLISHABLE_KEY and CLERK_SECRET_KEY to Vercel environment variables
 */
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Pass through all requests until Clerk is configured
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
