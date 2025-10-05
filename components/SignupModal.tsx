'use client'

import { useState } from 'react'

type SignupModalProps = {
  isOpen: boolean
  onClose(): void
}

export default function SignupModal({ isOpen, onClose }: SignupModalProps) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<{ ok: boolean; message: string } | null>(null)
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-40 overflow-auto">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-900 text-black dark:text-white rounded-lg p-6 w-full max-w-md shadow-lg">
        <h3 className="text-lg font-semibold mb-2">Join our mailing list</h3>
        <p className="text-sm mb-4">Get updates about AI-Now and premium releases.</p>
        <p className="text-xs text-gray-600 dark:text-gray-300 mb-4">We will only use your email to send occasional updates and important release notes. No spam, and you can unsubscribe at any time.</p>

        <input aria-label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-2 rounded border mb-3 text-black" />

        <div className="flex items-center gap-3">
          <button
            onClick={async () => {
              if (!email) return setStatus({ ok: false, message: 'Email required' })
              setLoading(true)
              setStatus(null)
              try {
                const res = await fetch('/api/subscribe', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) })
                const data = await res.json() as { success?: boolean; error?: string }
                if (res.ok) {
                  setStatus({ ok: true, message: 'Thanks — check your inbox.' })
                  setEmail('')
                  onClose()
                } else {
                  setStatus({ ok: false, message: data.error || 'Failed' })
                }
              } catch (err) {
                console.error('Subscribe request failed', err)
                setStatus({ ok: false, message: 'Request failed' })
              } finally {
                setLoading(false)
              }
            }}
            className={`rounded-md bg-black/10 dark:bg-white/10 px-3 py-1.5 text-sm hover:bg-black/10`}
            disabled={loading}
          >
            {loading ? 'Saving…' : 'Subscribe'}
          </button>

          <button onClick={onClose} className={`rounded-md bg-black/10 dark:bg-white/10 px-3 py-1.5 text-sm hover:bg-black/10`}>Cancel</button>
        </div>

        {status && <p className={`mt-3 text-sm ${status.ok ? 'text-green-500' : 'text-red-500'}`}>{status.message}</p>}
      </div>
    </div>
  )
}
