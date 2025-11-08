'use client'

import { useEffect, useState } from 'react'
import Header from '@/components/Header'

export default function LinkedInSetupPage() {
  const [authData, setAuthData] = useState<{ authUrl: string; instructions: string[] } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/linkedin/auth')
      .then(res => res.json() as Promise<{ authUrl: string; instructions: string[] }>)
      .then(data => {
        setAuthData(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to get auth URL:', err)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <>
        <Header isAdmin />
        <main className="min-h-screen p-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-4">Loading LinkedIn Setup...</h1>
          </div>
        </main>
      </>
    )
  }

  if (!authData) {
    return (
      <>
        <Header isAdmin />
        <main className="min-h-screen p-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-4 text-red-600">Error</h1>
            <p>Failed to initialize LinkedIn OAuth. Make sure LINKEDIN_CLIENT_ID is configured in your environment variables.</p>
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <Header isAdmin />
      <main className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">LinkedIn OAuth Setup</h1>
          
          <div className="bg-blue-50 border-2 border-blue-500 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">📋 Instructions</h2>
            <ol className="list-decimal list-inside space-y-2">
              {authData.instructions.map((instruction, i) => (
                <li key={i}>{instruction}</li>
              ))}
            </ol>
          </div>

          <div className="bg-white border-2 border-gray-300 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">🔐 Before You Start</h2>
            <p className="mb-4">Make sure you have:</p>
            <ul className="list-disc list-inside space-y-2 mb-4">
              <li>Created a LinkedIn App at <a href="https://www.linkedin.com/developers/apps" target="_blank" className="text-blue-600 underline">developers.linkedin.com</a></li>
              <li>Added your <strong>Client ID</strong> and <strong>Client Secret</strong> to <code>.env.local</code></li>
              <li>Requested access to <strong>&quot;Share on LinkedIn&quot;</strong> product</li>
              <li>Set redirect URI in LinkedIn app to: <code className="bg-gray-100 px-2 py-1 rounded">{authData.authUrl.match(/redirect_uri=([^&]+)/)?.[1]}</code></li>
            </ul>
          </div>

          <div className="text-center">
            <a 
              href={authData.authUrl}
              className="inline-block bg-[#0077B5] text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-[#005885] transition-colors"
            >
              🔗 Authorize with LinkedIn
            </a>
          </div>

          <div className="mt-8 bg-gray-50 border border-gray-300 rounded-lg p-4">
            <h3 className="font-semibold mb-2">Environment Variables Needed:</h3>
            <pre className="bg-white p-3 rounded border text-sm overflow-x-auto">
{`LINKEDIN_CLIENT_ID="your_client_id_here"
LINKEDIN_CLIENT_SECRET="your_client_secret_here"
NEXT_PUBLIC_APP_URL="http://localhost:3000" # or your production URL`}
            </pre>
          </div>
        </div>
      </main>
    </>
  )
}
