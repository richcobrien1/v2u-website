"use client";

import { useUser, useAuth, useOrganization } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Hook to protect routes that require authentication
 * Redirects to sign-in if not authenticated
 */
export function useRequireAuth() {
  const { isLoaded, userId } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !userId) {
      router.push('/sign-in');
    }
  }, [isLoaded, userId, router]);

  return { isLoaded, userId };
}

/**
 * Hook to get current user information
 */
export function useCurrentUser() {
  const { user, isLoaded } = useUser();
  
  return {
    user,
    isLoaded,
    isSignedIn: !!user,
    fullName: user?.fullName || '',
    email: user?.primaryEmailAddress?.emailAddress || '',
    imageUrl: user?.imageUrl || '',
  };
}

/**
 * Hook to check if user has specific permission in current organization
 */
export function usePermission(permission: string) {
  const { membership } = useOrganization();
  
  const hasPermission = (role: string | undefined, perm: string): boolean => {
    if (!role) return false;
    
    const rolePermissions: Record<string, string[]> = {
      admin: ["*"],
      manager: ["users:read", "users:invite", "projects:*", "settings:read"],
      member: ["projects:read", "projects:write", "profile:*"],
      viewer: ["projects:read", "profile:read"]
    };
    
    const permissions = rolePermissions[role] || [];
    return permissions.includes("*") || permissions.includes(perm);
  };
  
  return hasPermission(membership?.role, permission);
}

/**
 * Hook to get current organization context
 */
export function useCurrentOrganization() {
  const { organization, isLoaded, membership } = useOrganization();
  
  return {
    organization,
    isLoaded,
    role: membership?.role || 'member',
    isAdmin: membership?.role === 'admin',
    orgId: organization?.id,
    orgName: organization?.name,
    orgSlug: organization?.slug,
  };
}
