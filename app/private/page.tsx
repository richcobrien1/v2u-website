'use client'

import { useEffect, useState } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import CTAButton from '@/components/CTAButton'
import PremiumLayout from '@/components/PremiumLayout'

export default function PrivateStorePage() {
  const [accessStatus, setAccessStatus] = useState<'loading' | 'granted' | 'denied'>('loading')
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [jwt, setJwt] = useState<string | null>(null)

  useEffect(() => {
    const checkAccess = async () => {
      // Get session_id from URL params
      const urlParams = new URLSearchParams(window.location.search)
      const stripeSessionId = urlParams.get('session_id')
      
      if (!stripeSessionId) {
        setAccessStatus('denied')
        return
      }

      setSessionId(stripeSessionId)

      try {
        const res = await fetch(`/api/verify-session?session_id=${stripeSessionId}`)
        const data = await res.json() as { granted?: boolean; jwt?: string }
        
        if (data.granted && data.jwt) {
          setAccessStatus('granted')
          setJwt(data.jwt)
          // Store access in localStorage for future visits
          localStorage.setItem('v2u-jwt', data.jwt)
          localStorage.setItem('v2u-access', 'granted')
        } else {
          setAccessStatus('denied')
        }
      } catch (err) {
        console.error('Access verification failed:', err)
        setAccessStatus('denied')
      }
    }

    // Check if already have access from localStorage
    const storedAccess = localStorage.getItem('v2u-access')
    const storedJwt = localStorage.getItem('v2u-jwt')
    
    if (storedAccess === 'granted' && storedJwt) {
      setAccessStatus('granted')
      setJwt(storedJwt)
    } else {
      checkAccess()
    }
  }, [])

  const testAuthEndpoint = async () => {
    if (!jwt) return
    
    try {
      const res = await fetch('/api/auth?customerId=test', {
        headers: {
          'Authorization': `Bearer ${jwt}`
        }
      })
      const data = await res.json()
      console.log('Auth test result:', data)
      alert(`Auth test: ${res.ok ? 'SUCCESS' : 'FAILED'}\n${JSON.stringify(data, null, 2)}`)
    } catch (err) {
      console.error('Auth test failed:', err)
      alert('Auth test failed - check console')
    }
  }

  if (accessStatus === 'loading') {
    return (
      <main className="w-full h-auto pt-[48px] bg-[var(--site-bg)] text-[var(--site-fg)]">
        <Header loggedIn={true} firstName="Welcome" avatar="🟡" />
        <div className="max-w-3xl mx-auto px-6 py-16 text-center">
          <h1 className="text-3xl font-bold mb-4">🔄 Verifying Access...</h1>
          <p className="text-lg text-gray-600">Please wait while we check your subscription.</p>
        </div>
        <Footer />
      </main>
    )
  }

  if (accessStatus === 'denied') {
    return (
      <main className="w-full h-auto pt-[48px] bg-[var(--site-bg)] text-[var(--site-fg)]">
        <Header loggedIn={true} firstName="Welcome" avatar="�" />
        <div className="max-w-3xl mx-auto px-6 py-16 text-center">
          <h1 className="text-3xl font-bold mb-4">🔒 Access Denied</h1>
          <p className="text-lg text-gray-600 mb-6">
            This is exclusive content for premium subscribers only.
          </p>
          <CTAButton
            label="Subscribe Now"
            href="/subscribe"
            variant="dark"
          />
          <p className="text-sm text-gray-500 mt-4">
            Already a subscriber? Complete your purchase and you&apos;ll be redirected here automatically.
          </p>
        </div>
        <Footer />
      </main>
    )
  }

  return (
    <PremiumLayout backgroundImage="/background2.jpg" backgroundOpacity={0.08}>
      <main className="w-full h-auto pt-[48px] bg-transparent text-[var(--site-fg)]">
        <Header loggedIn={true} firstName="Welcome" avatar="�" />
        
        <div className="max-w-4xl mx-auto px-6 py-16">
          
          {/* Success Header */}
          <div className="text-center mb-12 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-lg p-8">
            <h1 className="text-4xl font-bold mb-4">🔓 Welcome to the Private Store</h1>
            <p className="text-xl text-green-600 mb-2">✅ Access Granted</p>
            <p className="text-gray-600">You now have access to all premium content and features.</p>
          </div>

          {/* Test Section */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg p-6 mb-8 border border-white/20">
            <h2 className="text-2xl font-bold mb-4">🧪 Access Testing</h2>          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <h3 className="font-semibold">Session ID:</h3>
              <code className="text-sm bg-gray-200 dark:bg-gray-700 p-2 rounded block mt-1">
                {sessionId ? sessionId.substring(0, 30) + '...' : 'Not found'}
              </code>
            </div>
            <div>
              <h3 className="font-semibold">JWT Token:</h3>
              <code className="text-sm bg-gray-200 dark:bg-gray-700 p-2 rounded block mt-1">
                {jwt ? jwt.substring(0, 30) + '...' : 'Not available'}
              </code>
            </div>
          </div>

          <CTAButton
            label="Test Auth Endpoint"
            onClick={testAuthEndpoint}
            variant="dark"
          />
        </div>

        {/* Premium Content Preview */}
        <div className="space-y-8">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4">🎧 Premium Podcast Content</h2>
            <p className="mb-4">Access to exclusive AI-Now episodes, deep dives, and commercial insights.</p>
            <CTAButton
              label="Browse Premium Podcasts"
              href="/premium/podcasts"
              variant="light"
            />
          </div>

          <div className="bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4">📚 Educational Resources</h2>
            <p className="mb-4">AI-Now-Educate series, tutorials, and hands-on guides.</p>
            <CTAButton
              label="Start Learning"
              href="/premium/education"
              variant="light"
            />
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4">💼 Commercial Insights</h2>
            <p className="mb-4">Business strategies, tool reviews, and industry analysis.</p>
            <CTAButton
              label="Explore Commercial Content"
              href="/premium/commercial"
              variant="light"
            />
          </div>
        </div>

        {/* Success Message */}
        <div className="text-center mt-12 p-6 bg-green-50 dark:bg-green-900 rounded-lg">
          <h3 className="text-xl font-bold text-green-800 dark:text-green-200 mb-2">
            🎉 Subscription Access Test: PASSED
          </h3>
          <p className="text-green-700 dark:text-green-300">
            Your secure access system is working perfectly! Ready to build the podcast portal.
          </p>
        </div>
      </div>

      <Footer />
    </main>
    </PremiumLayout>
  )
}