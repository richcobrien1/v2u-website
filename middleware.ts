/**
 * Clerk Authentication Middleware - Production
 * 
 * Protects admin and dashboard routes.
 * Main site is fully public - no login required.
 * Production keys configured in Vercel environment variables.
 */
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Define public routes (everything except admin/dashboard)
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/episodes(.*)',
  '/about(.*)',
  '/contact(.*)',
  '/subscribe(.*)',
  '/login(.*)',              // Existing premium login (keep working for now)
  '/api/subscribe(.*)',
  '/api/unsubscribe(.*)',
  '/api/podcast/feed(.*)',
  '/api/episodes(.*)',
  '/api/stripe-webhook(.*)',
  '/api/webhooks/clerk(.*)',
  // Public API routes
  '/api/login(.*)',
  '/api/test-login(.*)',
  '/api/me(.*)',
]);

export default clerkMiddleware(async (auth, request) => {
  // Only protect admin and dashboard routes
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
