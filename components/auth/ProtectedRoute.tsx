"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
  fallback?: React.ReactNode;
}

/**
 * Component to protect routes that require authentication
 * Automatically redirects to sign-in if not authenticated
 */
export function ProtectedRoute({ 
  children, 
  fallback 
}: ProtectedRouteProps) {
  const { isLoaded, userId } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !userId) {
      router.push('/sign-in');
    }
  }, [isLoaded, userId, router]);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!userId) {
    return fallback || null;
  }

  return <>{children}</>;
}

/**
 * Server-side route protection wrapper
 * Use this in server components
 */
export async function protectRoute(redirectUrl = '/sign-in') {
  const { auth } = await import('@clerk/nextjs/server');
  const { userId } = await auth();
  
  if (!userId) {
    const { redirect } = await import('next/navigation');
    redirect(redirectUrl);
  }
  
  return userId;
}
