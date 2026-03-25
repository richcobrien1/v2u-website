/**
 * Clerk Authentication Middleware
 * 
 * Protects routes requiring authentication.
 * Public routes are defined in publicRoutes config.
 */
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhooks/clerk(.*)',
  '/api/stripe-webhook(.*)',
  '/episodes(.*)',
  '/about(.*)',
  '/contact(.*)',
  '/subscribe(.*)',
  '/api/subscribe(.*)',
  '/api/unsubscribe(.*)',
  // Legacy endpoints (deprecated but public for backward compatibility)
  '/api/login(.*)',
  '/api/test-login(.*)',
]);

export default clerkMiddleware(async (auth, request) => {
  // Protect non-public routes
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
