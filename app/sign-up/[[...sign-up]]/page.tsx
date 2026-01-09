import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full max-w-md px-4">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Create Your Account
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            One account for all v2u applications
          </p>
        </div>
        
        <SignUp 
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
            Get instant access to:
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
            <div className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <span className="font-semibold text-gray-900 dark:text-white">TrafficJamz</span>
            </div>
            <div className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <span className="font-semibold text-gray-900 dark:text-white">SafeShipping</span>
            </div>
            <div className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <span className="font-semibold text-gray-900 dark:text-white">ChronosAI</span>
            </div>
            <div className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <span className="font-semibold text-gray-900 dark:text-white">NexoAI</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
