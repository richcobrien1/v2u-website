// website/components/SignupModal.tsx
// A modal dialog for users to sign up for a mailing list.
// Includes email input, submission handling, and feedback messages.

'use client'

import { useEffect, useRef, useState } from 'react'
import { useToast } from './ToastProvider'
import FocusTrap from './FocusTrap'

type InviteModalProps = {
  isOpen: boolean
  onClose(): void
  mode?: 'signup' | 'invite' // default signup
}

export default function InviteModal({ isOpen, onClose, mode = 'signup' }: InviteModalProps) {
  const [email, setEmail] = useState('')
  const [mobile, setMobile] = useState('')
  const [status, setStatus] = useState<{ ok: boolean; message: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const toast = useToast()

  const dialogRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (!isOpen) return
    const t = setTimeout(() => inputRef.current?.focus(), 50)
    return () => clearTimeout(t)
  }, [isOpen])

  useEffect(() => {
    if (status?.ok) {
      toast.push(status.message)
      setShowToast(true)
      const t = setTimeout(() => setShowToast(false), 1600)
      return () => clearTimeout(t)
    }
  }, [status, toast])

  if (!isOpen) return null

  const handleSubmit = async () => {
    if (!email) return setStatus({ ok: false, message: 'Email required' })
    setLoading(true)
    setStatus(null)
    try {
      const endpoint = mode === 'signup' ? '/api/subscribe' : '/api/invite'
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, mobile }),
      })
      const data = await res.json() as { success?: boolean; error?: string }
      if (res.ok) {
        setStatus({ ok: true, message: mode === 'signup' ? 'Thanks — check your inbox.' : 'Invite sent!' })
        setEmail('')
        setMobile('')
        setTimeout(() => onClose(), 1200)
      } else {
        setStatus({ ok: false, message: data.error || 'Failed' })
      }
    } catch (err) {
      console.error('Request failed', err)
      setStatus({ ok: false, message: 'Request failed' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-40 overflow-auto" role="presentation">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <FocusTrap active initialFocusRef={inputRef} onDeactivate={onClose}>
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          className="relative bg-white dark:bg-gray-900 text-black dark:text-white rounded-lg p-6 w-full max-w-md"
        >
          <h3 className="text-lg font-semibold mb-2">
            {mode === 'signup' ? 'Join our mailing list' : 'Invite a Friend'}
          </h3>
          <p className="text-sm mb-4">
            {mode === 'signup'
              ? 'Get updates about AI‑Now and premium releases.'
              : 'Send an invite by email. Mobile invites coming soon.'}
          </p>
          {mode === 'signup' && (
            <p className="text-xs text-gray-600 dark:text-gray-300 mb-4">
              We will only use your email to send occasional updates and important release notes. No spam, and you can unsubscribe at any time.
            </p>
          )}

          <input
            ref={inputRef}
            aria-label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 rounded border mb-3 text-black"
            placeholder="Email"
          />

          <input
            type="tel"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            disabled
            className="w-full p-2 rounded border mb-3 text-black opacity-50 cursor-not-allowed"
            placeholder="Mobile number (coming soon)"
          />

          <div className="flex items-center gap-3">
            <button
              onClick={handleSubmit}
              className="rounded-md bg-black/10 dark:bg-white/10 px-3 py-1.5 text-sm hover:bg-black/20"
              disabled={loading}
            >
              {loading ? 'Saving…' : mode === 'signup' ? 'Join' : 'Send Invite'}
            </button>
            <button
              onClick={onClose}
              className="rounded-md bg-black/10 dark:bg-white/10 px-3 py-1.5 text-sm hover:bg-black/20"
            >
              Cancel
            </button>
          </div>

          {status && (
            <p className={`mt-3 text-sm ${status.ok ? 'text-green-500' : 'text-red-500'}`}>
              {status.message}
            </p>
          )}

          {showToast && (
            <div className="absolute -top-12 right-4 bg-green-600 text-white px-3 py-1 rounded">
              {mode === 'signup' ? 'Subscribed' : 'Invite sent'}
            </div>
          )}
        </div>
      </FocusTrap>
    </div>
  )
}
