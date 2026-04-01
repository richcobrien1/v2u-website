/**
 * Clerk Authentication Utilities
 * 
 * Centralized authentication helpers using Clerk.
 * Replaces legacy JWT-based authentication with secure, modern auth.
 */

import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

/**
 * Get the current authenticated user's ID
 * Returns null if not authenticated
 */
export async function getUserId(): Promise<string | null> {
  const { userId } = await auth();
  return userId;
}

/**
 * Get the current authenticated user's full profile
 * Returns null if not authenticated
 */
export async function getUser() {
  return await currentUser();
}

/**
 * Require authentication - redirect to sign-in if not authenticated
 * Use in server components or server actions
 */
export async function requireAuth() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect('/login');
  }
  
  return userId;
}

/**
 * Check if user has admin role
 * Configure roles in Clerk Dashboard > Organization Settings
 */
export async function isAdmin(): Promise<boolean> {
  const user = await currentUser();
  
  if (!user) return false;
  
  // Check public metadata for admin role
  const metadata = user.publicMetadata as { role?: string };
  return metadata.role === 'admin';
}

/**
 * Require admin role - redirect if not admin
 */
export async function requireAdmin() {
  const user = await currentUser();
  
  if (!user) {
    redirect('/login');
  }
  
  const metadata = user.publicMetadata as { role?: string };
  
  if (metadata.role !== 'admin') {
    redirect('/unauthorized');
  }
  
  return user;
}

/**
 * Get user's subscription status
 * Synced from Stripe via webhook
 */
export async function getSubscriptionStatus(): Promise<{
  isSubscribed: boolean;
  tier: 'free' | 'premium' | 'pro';
  expiresAt?: Date;
}> {
  const user = await currentUser();
  
  if (!user) {
    return { isSubscribed: false, tier: 'free' };
  }
  
  const metadata = user.publicMetadata as {
    subscriptionTier?: 'free' | 'premium' | 'pro';
    subscriptionExpiresAt?: string;
  };
  
  const tier = metadata.subscriptionTier || 'free';
  const isSubscribed = tier !== 'free';
  const expiresAt = metadata.subscriptionExpiresAt 
    ? new Date(metadata.subscriptionExpiresAt) 
    : undefined;
  
  return { isSubscribed, tier, expiresAt };
}

/**
 * Check if user has access to premium content
 */
export async function hasPremiumAccess(): Promise<boolean> {
  const { tier } = await getSubscriptionStatus();
  return tier === 'premium' || tier === 'pro';
}

/**
 * Get user's email address
 */
export async function getUserEmail(): Promise<string | null> {
  const user = await currentUser();
  return user?.emailAddresses[0]?.emailAddress || null;
}

/**
 * Get user's display name
 */
export async function getUserDisplayName(): Promise<string | null> {
  const user = await currentUser();
  return user?.firstName 
    ? `${user.firstName} ${user.lastName || ''}`.trim()
    : user?.username || null;
}
