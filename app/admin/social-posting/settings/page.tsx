'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Settings, Key, Check, X, ExternalLink, RefreshCw } from 'lucide-react'

interface PlatformConfig {
  id: string
  name: string
  icon: string
  configured: boolean
  envVars: string[]
  instructions: string[]
  oauthUrl?: string
}

export default function SocialPostingSettingsPage() {
  const [platforms, setPlatforms] = useState<PlatformConfig[]>([])
  const [testingPlatform, setTestingPlatform] = useState<string | null>(null)
  const [testResults, setTestResults] = useState<Record<string, { success: boolean; error?: string; [key: string]: unknown }>>({})

  useEffect(() => {
    loadPlatformConfigs()
  }, [])

  function loadPlatformConfigs() {
    // Platform configuration details
    const configs: PlatformConfig[] = [
      {
        id: 'twitter',
        name: 'X (Twitter)',
        icon: '𝕏',
        configured: false,
        envVars: [
          'TWITTER_API_KEY',
          'TWITTER_API_SECRET',
          'TWITTER_ACCESS_TOKEN',
          'TWITTER_ACCESS_SECRET'
        ],
        instructions: [
          'Go to https://developer.twitter.com/en/portal/dashboard',
          'Create a new App or use existing',
          'Enable OAuth 1.0a with Read and Write permissions',
          'Generate API Key & Secret and Access Token & Secret',
          'Add credentials to .env.local file'
        ],
        oauthUrl: 'https://developer.twitter.com/en/portal/dashboard'
      },
      {
        id: 'facebook',
        name: 'Facebook',
        icon: '📘',
        configured: false,
        envVars: [
          'FACEBOOK_PAGE_ACCESS_TOKEN',
          'FACEBOOK_PAGE_ID'
        ],
        instructions: [
          'Go to https://developers.facebook.com/',
          'Create a Facebook App with Pages permissions',
          'Get your Page ID from Page Settings',
          'Generate a Page Access Token',
          'Add credentials to .env.local file'
        ],
        oauthUrl: 'https://developers.facebook.com/'
      },
      {
        id: 'linkedin',
        name: 'LinkedIn',
        icon: '💼',
        configured: false,
        envVars: [
          'LINKEDIN_ACCESS_TOKEN',
          'LINKEDIN_PERSON_URN'
        ],
        instructions: [
          'Go to https://www.linkedin.com/developers/',
          'Create an app with Share on LinkedIn permissions',
          'Complete OAuth 2.0 flow to get access token',
          'Get your Person URN from profile API',
          'Add credentials to .env.local file'
        ],
        oauthUrl: 'https://www.linkedin.com/developers/'
      },
      {
        id: 'threads',
        name: 'Threads',
        icon: '🧵',
        configured: false,
        envVars: [
          'THREADS_ACCESS_TOKEN',
          'THREADS_USER_ID'
        ],
        instructions: [
          'Threads uses Meta\'s Graph API',
          'Go to https://developers.facebook.com/',
          'Enable Threads permissions in your app',
          'Complete OAuth flow to get access token',
          'Add credentials to .env.local file'
        ],
        oauthUrl: 'https://developers.facebook.com/'
      },
      {
        id: 'instagram',
        name: 'Instagram',
        icon: '📸',
        configured: false,
        envVars: [
          'INSTAGRAM_BUSINESS_ACCOUNT_ID',
          'INSTAGRAM_ACCESS_TOKEN'
        ],
        instructions: [
          'Convert to Instagram Business Account',
          'Go to https://developers.facebook.com/',
          'Create app with Instagram Basic Display or Graph API',
          'Get Instagram Business Account ID',
          'Generate access token with instagram_basic scope',
          'Add credentials to .env.local file'
        ],
        oauthUrl: 'https://developers.facebook.com/'
      }
    ]

    setPlatforms(configs)
  }

  async function testPlatform(platformId: string) {
    setTestingPlatform(platformId)
    
    try {
      const response = await fetch(`/api/social-post/test?platform=${platformId}`)
      const data = await response.json() as { success: boolean; error?: string }
      
      setTestResults(prev => ({
        ...prev,
        [platformId]: data
      }))
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        [platformId]: {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      }))
    } finally {
      setTestingPlatform(null)
    }
  }

  function copyEnvTemplate() {
    const template = platforms
      .flatMap(p => p.envVars.map(v => `${v}=your_value_here`))
      .join('\n')
    
    navigator.clipboard.writeText(template)
    alert('Environment variables template copied to clipboard!')
  }

  return (
    <>
      <Header />

      <main className="max-w-6xl mx-auto px-4 py-24 bg-[var(--site-bg)] text-[var(--site-fg)] transition-colors duration-300">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 flex items-center text-[var(--site-fg)]">
            <Settings className="w-10 h-10 mr-3 text-[var(--site-fg)]" />
            Social Platform Settings
          </h1>
          <p className="text-[var(--site-fg)] opacity-75">Configure OAuth credentials for cross-platform posting</p>
        </div>

        {/* Quick Setup */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold mb-3 flex items-center text-blue-900 dark:text-blue-100">
            <Key className="w-5 h-5 mr-2 text-blue-900 dark:text-blue-100" />
            Quick Setup
          </h2>
          <p className="mb-4 text-sm text-blue-800 dark:text-blue-200">
            Add these environment variables to your <code className="bg-white dark:bg-gray-800 px-2 py-1 rounded text-gray-900 dark:text-white">.env.local</code> file in the website folder:
          </p>
          <button
            onClick={copyEnvTemplate}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center"
          >
            <Key className="w-4 h-4 mr-2" />
            Copy Environment Variables Template
          </button>
        </div>

        {/* Platform Configurations */}
        <div className="space-y-6">
          {platforms.map((platform) => (
            <div
              key={platform.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow border-2 border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gray-50 dark:bg-gray-900 px-6 py-4 border-b-2 border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-3xl mr-3">{platform.icon}</span>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{platform.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {platform.configured ? (
                        <span className="text-green-600 dark:text-green-400 flex items-center">
                          <Check className="w-4 h-4 mr-1" />
                          Configured
                        </span>
                      ) : (
                        <span className="text-red-600 dark:text-red-400 flex items-center">
                          <X className="w-4 h-4 mr-1" />
                          Not configured
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => testPlatform(platform.id)}
                    disabled={testingPlatform === platform.id}
                    className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm flex items-center"
                  >
                    {testingPlatform === platform.id ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-700 mr-2"></div>
                        Testing...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Test Connection
                      </>
                    )}
                  </button>
                  
                  {platform.oauthUrl && (
                    <a
                      href={platform.oauthUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm flex items-center"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Developer Portal
                    </a>
                  )}
                </div>
              </div>

              {/* Body */}
              <div className="px-6 py-4 bg-white dark:bg-gray-800">
                {/* Test Results */}
                {testResults[platform.id] && (
                  <div
                    className={`mb-4 p-4 rounded-lg ${
                      testResults[platform.id].success
                        ? 'bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800'
                        : 'bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800'
                    }`}
                  >
                    {testResults[platform.id].success ? (
                      <p className="text-green-700 dark:text-green-400 flex items-center">
                        <Check className="w-5 h-5 mr-2" />
                        Connection successful!
                      </p>
                    ) : (
                      <div>
                        <p className="text-red-700 dark:text-red-400 flex items-center mb-2">
                          <X className="w-5 h-5 mr-2" />
                          Connection failed
                        </p>
                        <p className="text-sm text-red-600 dark:text-red-400">{testResults[platform.id].error}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Required Environment Variables */}
                <div className="mb-4">
                  <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">Required Environment Variables:</h4>
                  <div className="bg-gray-100 dark:bg-gray-900 rounded p-3 space-y-1 font-mono text-sm">
                    {platform.envVars.map((envVar) => (
                      <div key={envVar} className="flex items-center">
                        <code className="text-blue-700 dark:text-blue-300 font-semibold">{envVar}</code>
                        <span className="text-gray-600 dark:text-gray-400 ml-2">=your_value_here</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Setup Instructions */}
                <div>
                  <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">Setup Instructions:</h4>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700 dark:text-gray-200">
                    {platform.instructions.map((instruction, idx) => (
                      <li key={idx}>{instruction}</li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Help */}
        <div className="mt-8 bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">⚠️ Important Notes</h2>
          <ul className="list-disc list-inside space-y-2 text-sm text-gray-700 dark:text-gray-200">
            <li>Never commit <code className="bg-white dark:bg-gray-800 px-2 py-1 rounded text-gray-900 dark:text-white">.env.local</code> files to git</li>
            <li>Keep your API keys and tokens secure</li>
            <li>Some platforms require Business accounts for API access</li>
            <li>Access tokens may expire and need refreshing</li>
            <li>Test connections regularly to ensure credentials are valid</li>
            <li>After updating credentials, restart the development server</li>
          </ul>
        </div>
      </main>

      <Footer />
    </>
  )
}
