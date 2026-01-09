import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full max-w-md px-4">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome Back
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Sign in to access all v2u applications
          </p>
        </div>
        
        <SignIn 
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "shadow-2xl rounded-2xl",
              headerTitle: "hidden",
              headerSubtitle: "hidden",
            }
          }}
        />
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Single sign-on for all platforms:
          </p>
          <div className="mt-2 flex flex-wrap justify-center gap-2 text-xs text-gray-500 dark:text-gray-500">
            <span>TrafficJamz</span>
            <span>•</span>
            <span>SafeShipping</span>
            <span>•</span>
            <span>Blink</span>
            <span>•</span>
            <span>ChronosAI</span>
            <span>•</span>
            <span>NexoAI</span>
            <span>•</span>
            <span>TrajectoryAI</span>
            <span>•</span>
            <span>CortexAI</span>
            <span>•</span>
            <span>PodcastPro</span>
          </div>
        </div>
      </div>
    </div>
  );
}
