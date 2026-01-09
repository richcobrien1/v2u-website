import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { OrganizationSwitcher } from "@clerk/nextjs";
import Link from "next/link";

export default async function DashboardPage() {
  const { userId, orgId } = await auth();
  
  if (!userId) {
    redirect('/sign-in');
  }
  
  const user = await currentUser();

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome, {user?.firstName || 'User'}!
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Unified dashboard for all v2u applications
          </p>
        </div>
        <OrganizationSwitcher 
          hidePersonal={false}
          afterSelectOrganizationUrl="/dashboard"
        />
      </div>

      {/* Organization Context */}
      {orgId ? (
        <div className="mb-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            🏢 You are currently viewing: <strong>Organization Context</strong>
          </p>
          <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
            All actions and data are scoped to this organization
          </p>
        </div>
      ) : (
        <div className="mb-8 p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
          <p className="text-sm text-gray-800 dark:text-gray-200">
            👤 You are in <strong>Personal Mode</strong>
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            Create or join an organization to collaborate with your team
          </p>
        </div>
      )}

      {/* Application Grid */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Your Applications
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <AppCard 
            name="TrafficJamz"
            description="Traffic management platform"
            href="/trafficjamz"
            color="bg-blue-500"
          />
          <AppCard 
            name="SafeShipping"
            description="Logistics and shipping"
            href="/safeshipping"
            color="bg-green-500"
          />
          <AppCard 
            name="Blink"
            description="Communication platform"
            href="/blink"
            color="bg-purple-500"
          />
          <AppCard 
            name="ChronosAI"
            description="Time-based AI automation"
            href="/chronosai"
            color="bg-indigo-500"
          />
          <AppCard 
            name="NexoAI"
            description="Connection AI platform"
            href="/nexoai"
            color="bg-cyan-500"
          />
          <AppCard 
            name="TrajectoryAI"
            description="Path planning AI"
            href="/trajectoryai"
            color="bg-orange-500"
          />
          <AppCard 
            name="CortexAI"
            description="Intelligence AI"
            href="/cortexai"
            color="bg-red-500"
          />
          <AppCard 
            name="PodcastPro"
            description="Podcast production"
            href="/podcastpro"
            color="bg-pink-500"
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/organization/settings"
            className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-lg transition-shadow"
          >
            <div className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              Organization Settings
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Manage members, roles, and permissions
            </p>
          </Link>
          
          <Link
            href="/admin/automation"
            className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-lg transition-shadow"
          >
            <div className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              Automation Hub
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Configure social media automation
            </p>
          </Link>
          
          <Link
            href="/pricing"
            className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-lg transition-shadow"
          >
            <div className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              Billing & Plans
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              View subscription and usage
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}

function AppCard({ 
  name, 
  description, 
  href, 
  color 
}: { 
  name: string; 
  description: string; 
  href: string; 
  color: string; 
}) {
  return (
    <Link
      href={href}
      className="group p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:shadow-xl transition-all hover:-translate-y-1"
    >
      <div className={`w-12 h-12 ${color} rounded-lg mb-4 flex items-center justify-center text-white font-bold text-xl`}>
        {name[0]}
      </div>
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
        {name}
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        {description}
      </p>
    </Link>
  );
}
