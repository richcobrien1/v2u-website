// website/components/InviteModal.tsx
// Modal dialog for inviting a friend to the platform.
// Includes email input (active) and mobile number input (disabled placeholder for future SMS support).
// Uses FocusTrap for accessibility and consistent styling with SignupModal.

'use client'

import { useEffect, useRef, useState } from 'react'
import FocusTrap from './FocusTrap'

type InviteModalProps = {
  isOpen: boolean
  onClose: () => void
  mode?: 'invite'
}

export default function InviteModal({ isOpen, onClose }: InviteModalProps) {
  const [email, setEmail] = useState('')
  const [mobile, setMobile] = useState('')
  const [status, setStatus] = useState<{ ok: boolean; message: string } | null>(null)
  const [loading, setLoading] = useState(false)

  const dialogRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (!isOpen) return
    const t = setTimeout(() => inputRef.current?.focus(), 50)
    return () => clearTimeout(t)
  }, [isOpen])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      setStatus({ ok: false, message: 'Email required' })
      return
    }
    setLoading(true)
    setStatus(null)
    try {
      // TODO: wire up to /api/invite when backend is ready
      console.log('Inviting:', { email, mobile })
      setStatus({ ok: true, message: 'Invite sent!' })
      setEmail('')
      setMobile('')
      setTimeout(() => onClose(), 1200)
    } catch (err) {
      console.error('Invite request failed', err)
      setStatus({ ok: false, message: 'Request failed' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-50 overflow-auto" role="presentation">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <FocusTrap active initialFocusRef={inputRef} onDeactivate={onClose}>
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="invite-title"
          aria-describedby="invite-desc"
          className="relative bg-white dark:bg-gray-900 text-black dark:text-white rounded-lg p-6 w-full max-w-md"
        >
          <h3 id="invite-title" className="text-lg font-semibold mb-2">Invite a Friend</h3>
          <p id="invite-desc" className="text-sm mb-4">Send an invite by email. Mobile invites coming soon.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              ref={inputRef}
              aria-label="Email"
              type="email"
              required
              placeholder="Friend’s email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 rounded border text-black"
            />
            <input
              type="tel"
              placeholder="Mobile number (coming soon)"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              disabled
              className="w-full p-2 rounded border text-black opacity-50 cursor-not-allowed"
            />

            <div className="flex items-center gap-3">
              <button
                type="submit"
                className="rounded-md bg-blue-600 text-white px-3 py-1.5 text-sm hover:bg-blue-700"
                disabled={loading}
              >
                {loading ? 'Sending…' : 'Send Invite'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="rounded-md bg-black/10 dark:bg-white/10 px-3 py-1.5 text-sm hover:bg-black/20"
              >
                Cancel
              </button>
            </div>
          </form>

          {status && (
            <p className={`mt-3 text-sm ${status.ok ? 'text-green-500' : 'text-red-500'}`}>
              {status.message}
            </p>
          )}
        </div>
      </FocusTrap>
    </div>
  )
}
