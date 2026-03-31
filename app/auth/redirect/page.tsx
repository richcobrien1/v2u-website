'use client';

import { useUser } from '@clerk/nextjs';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

/**
 * Post-sign-in redirect handler.
 * Priority:
 *   1. ?redirect_url= query param (app-specific flows, e.g. /sign-in?redirect_url=/dashboard)
 *   2. Role from public metadata:
 *      - admin  → /admin
 *      - premium → /dashboard
 *      - default → /
 */
export default function AuthRedirectPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!isLoaded) return;

    // Not signed in — send to sign-in
    if (!user) {
      router.replace('/sign-in');
      return;
    }

    // Explicit redirect_url param takes priority (app-specific flows)
    const redirectUrl = searchParams.get('redirect_url');
    if (redirectUrl && redirectUrl.startsWith('/')) {
      router.replace(redirectUrl);
      return;
    }

    // Role-based fallback
    const role = (user.publicMetadata as { role?: string })?.role;
    if (role === 'admin') {
      router.replace('/admin');
    } else if (role === 'premium') {
      router.replace('/dashboard');
    } else {
      router.replace('/');
    }
  }, [isLoaded, user, router, searchParams]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-400">Redirecting...</p>
      </div>
    </div>
  );
}
