import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
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
  "/api/webhooks/clerk",
  "/sign-in(.*)",
  "/sign-up(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
