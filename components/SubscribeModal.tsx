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
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl p-6 max-w-md w-full text-center">
        <h2 className="text-xl font-semibold mb-2">Unlock Premium Access</h2>
        <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
          Subscribe for $4.99/month and get exclusive access to AI-Now-Educate,
          Commercial, and Conceptual content.
        </p>
        <button
          onClick={handleSubscribe}
          disabled={loading}
          className="w-full rounded-md bg-teal-600 text-white py-2 hover:bg-teal-700 transition"
        >
          {loading ? 'Redirecting...' : 'Subscribe Now'}
        </button>
        <Link
          href="/subscribe"
          className="block mt-4 text-sm text-teal-500 hover:underline"
        >
          Learn more about what&apos;s included
        </Link>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          aria-label="Close"
        >
          ✕
        </button>
      </div>
    </div>
  )
}