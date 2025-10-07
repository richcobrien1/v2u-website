'use client'

import { useEffect, useRef, useState } from 'react'
import { useToast } from './ToastProvider'
import FocusTrap from './FocusTrap'

type SignupModalProps = {
  isOpen: boolean
  onClose(): void
}

export default function SignupModal({ isOpen, onClose }: SignupModalProps) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<{ ok: boolean; message: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const toast = useToast()

  const dialogRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (!isOpen) return
    // autofocus input when modal opens (FocusTrap will try to focus initial target too)
    const t = setTimeout(() => inputRef.current?.focus(), 50)
    return () => clearTimeout(t)
  }, [isOpen])

  useEffect(() => {
    if (status?.ok) {
      // push a global toast as well
      toast.push(status.message)
      setShowToast(true)
      const t = setTimeout(() => setShowToast(false), 1600)
      return () => clearTimeout(t)
    }
  }, [status, toast])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-40 overflow-auto" role="presentation">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <FocusTrap active initialFocusRef={inputRef} onDeactivate={onClose}>
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="signup-title"
          aria-describedby="signup-desc"
          className="relative bg-white dark:bg-gray-900 text-black dark:text-white rounded-lg p-6 w-full max-w-md"
        >
        <h3 id="signup-title" className="text-lg font-semibold mb-2">Join our mailing list</h3>
        <p id="signup-desc" className="text-sm mb-4">Get updates about AI-Now and premium releases.</p>
        <p className="text-xs text-gray-600 dark:text-gray-300 mb-4">We will only use your email to send occasional updates and important release notes. No spam, and you can unsubscribe at any time.</p>

        <input ref={inputRef} aria-label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-2 rounded border mb-3 text-black" />

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
                  // show toast briefly then close
                  setTimeout(() => {
                    onClose()
                  }, 1200)
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

        {/* small toast */}
          {showToast && (
            <div className="absolute -top-12 right-4 bg-green-600 text-white px-3 py-1 rounded">Subscribed</div>
          )}
        </div>
      </FocusTrap>
    </div>
  )
}
