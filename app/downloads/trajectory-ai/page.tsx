import Header from '@/components/Header'
import Footer from '@/components/Footer'
import CTAButton from '@/components/CTAButton'
import { Download } from 'lucide-react'
import Image from 'next/image'

export const metadata = {
  title: 'Download Trajectory-AI - Automics, LLC',
  description: 'Download the Trajectory-AI Android app',
}

export default function TrajectoryAIDownloadPage() {
  return (
    <main className="w-full h-auto pt-[60px] bg-bgLight dark:bg-bgDark text-black dark:text-white transition-colors duration-300">
      <Header />

      <div className="page-content min-h-screen">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Download Trajectory-AI
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Get the latest version of Trajectory-AI for Android
            </p>
          </div>

          {/* Download Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-8">
            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* App Icon */}
              <div className="flex-shrink-0">
                <Image 
                  src="/TrajectoryAI.ico" 
                  alt="Trajectory-AI"
                  width={128}
                  height={128}
                  className="w-32 h-32 rounded-3xl shadow-lg"
                />
              </div>

              {/* App Info */}
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl font-bold mb-2">Trajectory-AI</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Version 1.0 • Android APK
                </p>
                <p className="text-gray-700 dark:text-gray-300 mb-6">
                  AI-powered goal tracking and life planning assistant.
                </p>

                {/* Download Button */}
                <a
                  href="/downloads/TrajectoryAI.apk"
                  download="TrajectoryAI.apk"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-lg transition-colors"
                >
                  <Download className="w-5 h-5" />
                  Download APK
                </a>
              </div>
            </div>
          </div>

          {/* Installation Instructions */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
            <h3 className="text-xl font-bold mb-4">Installation Instructions</h3>
            <ol className="list-decimal list-inside space-y-3 text-gray-700 dark:text-gray-300">
              <li>Download the APK file by clicking the button above</li>
              <li>Open your Android device&apos;s <strong>Settings</strong></li>
              <li>Navigate to <strong>Security</strong> or <strong>Privacy</strong></li>
              <li>Enable <strong>Install from Unknown Sources</strong> or <strong>Allow from this source</strong></li>
              <li>Open your <strong>Downloads</strong> folder</li>
              <li>Tap on <strong>TrajectoryAI.apk</strong> to install</li>
              <li>Follow the on-screen prompts to complete installation</li>
              <li>Launch Trajectory-AI and enjoy!</li>
            </ol>
          </div>

          {/* Back to Home */}
          <div className="text-center mt-8">
            <CTAButton 
              label="Back to Home"
              href="/"
              variant="dark"
            />
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
