'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function ThankYouClient() {
  const searchParams = useSearchParams()
  const sessionId = searchParams?.get('session_id')
  const accessCode = searchParams?.get('access')
  const [status, setStatus] = useState<'pending' | 'success' | 'error' | 'none'>('none')

  useEffect(() => {
    if (!accessCode) return

    const validateAccess = async () => {
      setStatus('pending')
      try {
        const res = await fetch('/api/validate-access-code', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: accessCode }),
        })

        const data = await res.json()
        setStatus(data.success ? 'success' : 'error')
      } catch (err) {
        console.error('Access validation failed:', err)
        setStatus('error')
      }
    }

    validateAccess()
  }, [accessCode])

  return (
    <>
      {sessionId && (
        <p className="text-sm text-black/60">
          Session ID: <code>{sessionId}</code>
        </p>
      )}
      {status === 'success' && (
        <p className="mt-6 text-sm text-green-600">Access granted! You’re now unlocked across devices.</p>
      )}
      {status === 'error' && (
        <p className="mt-6 text-sm text-red-500">Invalid access code. Please contact support.</p>
      )}
    </>
  )
}