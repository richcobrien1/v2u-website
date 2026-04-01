import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Routes that require authentication
const isProtectedRoute = createRouteMatcher([
  '/admin(.*)',
  '/dashboard(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect({ unauthenticatedUrl: 'https://www.v2u.us/login' });
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals, static files, and the Clerk proxy route (to avoid infinite loop)
    '/((?!_next|api/clerk|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes except the Clerk proxy
    '/(api(?!/clerk)|trpc)(.*)',
  ],
};
