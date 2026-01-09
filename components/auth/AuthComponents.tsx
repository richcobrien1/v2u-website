"use client";

import { UserButton, OrganizationSwitcher } from "@clerk/nextjs";

/**
 * User profile button with dropdown menu
 * Shows user avatar and provides access to account settings
 */
export function AuthUserButton() {
  return (
    <UserButton 
      afterSignOutUrl="/"
      appearance={{
        elements: {
          avatarBox: "w-10 h-10",
          userButtonPopoverCard: "shadow-xl",
        }
      }}
    />
  );
}

/**
 * Organization switcher for multi-tenant apps
 * Allows users to switch between organizations or create new ones
 */
export function AuthOrgSwitcher() {
  return (
    <OrganizationSwitcher 
      hidePersonal={false}
      afterCreateOrganizationUrl="/dashboard"
      afterSelectOrganizationUrl="/dashboard"
      appearance={{
        elements: {
          rootBox: "flex items-center",
          organizationSwitcherTrigger: "px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors",
        }
      }}
    />
  );
}

/**
 * Combined auth widget - shows user button and org switcher
 */
export function AuthWidget() {
  return (
    <div className="flex items-center gap-3">
      <AuthOrgSwitcher />
      <AuthUserButton />
    </div>
  );
}
