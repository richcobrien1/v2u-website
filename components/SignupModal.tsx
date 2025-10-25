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
  // User's own info (for signup)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  
  // Friend's invite info (optional)
  const [friendFirstName, setFriendFirstName] = useState('')
  const [friendEmail, setFriendEmail] = useState('')
  
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
    if (mode === 'signup') {
      // For signup mode, require first name and email at minimum
      if (!firstName) return setStatus({ ok: false, message: 'First name required' })
      if (!email) return setStatus({ ok: false, message: 'Email required' })
    } else {
      // For invite mode, require friend's info
      if (!friendFirstName) return setStatus({ ok: false, message: 'Friend\'s first name required' })
      if (!friendEmail) return setStatus({ ok: false, message: 'Friend\'s email required' })
    }
    
    setLoading(true)
    setStatus(null)
    
    try {
      // Handle signup (user joining)
      if (mode === 'signup' && email) {
        const res = await fetch('/api/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ firstName, lastName, email, mobile }),
        })
        const data = await res.json() as { success?: boolean; error?: string }
        
        if (!res.ok) {
          setStatus({ ok: false, message: data.error || 'Failed to join' })
          setLoading(false)
          return
        }
        
        // If user also wants to invite a friend
        if (friendEmail && friendFirstName) {
          const inviteRes = await fetch('/api/invite', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              firstName: friendFirstName, 
              email: friendEmail,
              invitedBy: `${firstName} ${lastName}`.trim()
            }),
          })
          
          if (inviteRes.ok) {
            setStatus({ ok: true, message: 'Thanks! Check your inbox. Invite sent to your friend too!' })
          } else {
            setStatus({ ok: true, message: 'Thanks! Check your inbox. (Invite failed to send)' })
          }
        } else {
          setStatus({ ok: true, message: 'Thanks — check your inbox!' })
        }
        
        // Clear form
        setFirstName('')
        setLastName('')
        setEmail('')
        setFriendFirstName('')
        setFriendEmail('')
        setMobile('')
        setTimeout(() => onClose(), 1200)
      } else {
        // Invite mode only
        const res = await fetch('/api/invite', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ firstName: friendFirstName, email: friendEmail }),
        })
        const data = await res.json() as { success?: boolean; error?: string }
        
        if (res.ok) {
          setStatus({ ok: true, message: 'Invite sent!' })
          setFriendFirstName('')
          setFriendEmail('')
          setTimeout(() => onClose(), 1200)
        } else {
          setStatus({ ok: false, message: data.error || 'Failed' })
        }
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
              : 'Send an invite by email and share the AI journey!'}
          </p>
          {mode === 'signup' && (
            <p className="text-xs text-gray-600 dark:text-gray-300 mb-4">
              We will only use your email to send occasional updates and important release notes. No spam, and you can unsubscribe at any time.
            </p>
          )}

          {/* User's own info (for signup mode) */}
          {mode === 'signup' && (
            <div className="space-y-3 mb-4">
              <div className="grid grid-cols-2 gap-2">
                <input
                  ref={inputRef}
                  aria-label="First Name"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full p-2 rounded border text-black"
                  placeholder="First Name *"
                  required
                />
                <input
                  aria-label="Last Name"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full p-2 rounded border text-black"
                  placeholder="Last Name"
                />
              </div>
              <input
                aria-label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 rounded border text-black"
                placeholder="Email *"
                required
              />
            </div>
          )}

          {/* Invite a friend section */}
          {mode === 'signup' ? (
            <>
              <div className="border-t border-gray-300 dark:border-gray-600 pt-4 mt-4">
                <p className="text-sm font-medium mb-2">
                  ✨ Hey, while you&apos;re here — why not invite someone to take this journey with you?
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                  Share the excitement! Invite a friend to join and explore AI together.
                </p>
                <div className="space-y-2">
                  <input
                    aria-label="Friend's First Name"
                    type="text"
                    value={friendFirstName}
                    onChange={(e) => setFriendFirstName(e.target.value)}
                    className="w-full p-2 rounded border text-black"
                    placeholder="Friend's First Name"
                  />
                  <input
                    aria-label="Friend's Email"
                    type="email"
                    value={friendEmail}
                    onChange={(e) => setFriendEmail(e.target.value)}
                    className="w-full p-2 rounded border text-black"
                    placeholder="Friend's Email"
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-3 mb-4">
              <input
                ref={inputRef}
                aria-label="Friend's First Name"
                type="text"
                value={friendFirstName}
                onChange={(e) => setFriendFirstName(e.target.value)}
                className="w-full p-2 rounded border text-black"
                placeholder="Friend's First Name *"
                required
              />
              <input
                aria-label="Friend's Email"
                type="email"
                value={friendEmail}
                onChange={(e) => setFriendEmail(e.target.value)}
                className="w-full p-2 rounded border text-black"
                placeholder="Friend's Email *"
                required
              />
            </div>
          )}

          <div className="flex items-center gap-3 mt-4">
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
              {mode === 'signup' 
                ? (friendEmail ? 'Joined & Invite sent!' : 'Joined!') 
                : 'Invite sent!'}
            </div>
          )}
        </div>
      </FocusTrap>
    </div>
  )
}
