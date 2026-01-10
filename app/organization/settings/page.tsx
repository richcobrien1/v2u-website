import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { OrganizationProfile } from "@clerk/nextjs";

export default async function OrganizationSettingsPage() {
  const { userId, orgId } = await auth();
  
  if (!userId) {
    redirect('/sign-in');
  }
  
  if (!orgId) {
    redirect('/dashboard');
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Organization Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your organization, members, and settings
        </p>
      </div>

      <OrganizationProfile 
        appearance={{
          elements: {
            rootBox: "w-full",
            card: "shadow-xl",
          }
        }}
      />
    </div>
  );
}
