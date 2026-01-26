'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function SubscribeModal({
  onClose,
}: {
  onClose: () => void
}) {
  const [loading, setLoading] = useState(false)

  const handleSubscribe = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
      })
      const { url } = await res.json() as { url: string }
      window.location.href = url
    } catch (err) {
      console.error('Stripe redirect failed:', err)
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-xl p-8 sm:p-12 max-w-2xl w-full text-center">
        <h2 className="text-3xl sm:text-4xl font-semibold mb-6">Unlock Premium Access</h2>
        <p className="text-lg sm:text-xl text-gray-700 dark:text-gray-300 mb-8">
          Subscribe for $4.99/month and get exclusive access to AI Deep Dive Educate,
          Commercial, and Conceptual content.
        </p>
        <button
          onClick={handleSubscribe}
          disabled={loading}
          className="w-full rounded-lg bg-teal-600 text-white text-xl py-4 hover:bg-teal-700 transition font-medium"
        >
          {loading ? 'Redirecting...' : 'Subscribe Now'}
        </button>
        <Link
          href="/subscribe"
          className="block mt-6 text-lg text-teal-500 hover:underline"
        >
          Learn more about what&apos;s included
        </Link>
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-2xl text-gray-500 hover:text-gray-700"
          aria-label="Close"
        >
          ✕
        </button>
      </div>
    </div>
  )
}