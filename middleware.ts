import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  // Routes that can be accessed while signed out
  publicRoutes: [
    "/",
    "/about",
    "/pricing",
    "/chronosai",
    "/nexoai",
    "/trajectoryai",
    "/cortexai",
    "/podcastpro",
    "/trafficjamz",
    "/safeshipping",
    "/blink",
    "/founder-subscriber",
    "/slicer",
    "/api/public(.*)",
    "/api/webhooks(.*)",
    "/api/stripe/webhook",
  ],
  
  // Routes that should be ignored by auth middleware
  ignoredRoutes: [
    "/api/webhooks/clerk",
    "/api/stripe/webhook",
    "/_next/static(.*)",
    "/_next/image(.*)",
    "/favicon.ico",
    "/v2u_avatar.png",
  ],

  // Enable debug mode in development
  debug: process.env.NODE_ENV === 'development',
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
