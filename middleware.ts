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
}, {
  // Use Clerk's built-in proxy handler (proxies via /__clerk, auto-derives proxyUrl server-side)
  frontendApiProxy: { enabled: true },
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes, tRPC routes, and the Clerk proxy path
    '/(api|trpc|__clerk)(.*)',
  ],
};
