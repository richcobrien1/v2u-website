'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { useTheme } from '@/components/theme/ThemeContext'

type HeaderProps = {
  loggedIn?: boolean
  firstName?: string
  avatar?: string
}

export default function Header({
  loggedIn = false,
  firstName,
  avatar = '🙂',
}: HeaderProps) {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  // Sync theme with Tailwind's dark class
  useEffect(() => {
    const root = document.documentElement
    if (isDark) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [isDark])

  const [showSignup, setShowSignup] = useState(false)
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<{ ok: boolean; message: string } | null>(null)

  const matteClass = isDark ? 'bg-black/60 text-white' : 'bg-white/60 text-gray-900'

  const hoverBg = isDark ? 'hover:bg-white/20' : 'hover:bg-black/10'
  const buttonBg = isDark ? 'bg-white/10' : 'bg-black/10'
  const avatarBg = isDark ? 'bg-white/10' : 'bg-black/10'
  const accentText = isDark ? 'text-white/80' : 'text-gray-700'

  return (
    <header
      className={`fixed top-0 left-0 w-full ${matteClass} backdrop-blur-sm z-50 transition-colors duration-300`}
    >
      <div className="w-full px-4 sm:px-6 py-2 flex items-center justify-between">
        {/* Left: Logo + Hamburger */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/v2u.jpg"
              alt="v2u logo"
              height={24}
              width={24}
              unoptimized
              className="h-6 w-6 object-contain"
            />
            <span className="font-semibold">v2u</span>
          </Link>

          
          
          {/* <button
            aria-label="Open menu"
            className={`inline-flex h-10 w-10 items-center justify-center rounded-md ${buttonBg} ${hoverBg}`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              className="w-6 h-6 text-v2uBlue"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button> */}
          
        </div>

        {/* Right: Auth + Theme Toggle */}
        <div className="flex items-center gap-3">
          {/* Signup moved here so it's grouped with auth controls */}
          <>
            <button
              onClick={() => setShowSignup(true)}
              className={`rounded-md ${buttonBg} px-3 py-1.5 text-sm ${hoverBg}`}
              aria-label="Sign up"
            >
              Sign up
            </button>
            {showSignup && (
              <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 overflow-auto">
                <div className="absolute inset-0 bg-black/60" onClick={() => setShowSignup(false)} />
                <div className="relative bg-white dark:bg-gray-900 text-black dark:text-white rounded-lg p-6 w-full max-w-md shadow-lg">
                  <h3 className="text-lg font-semibold mb-2">Join our mailing list</h3>
                  <p className="text-sm mb-4">Get updates about AI-Now and premium releases.</p>
                  <p className="text-xs text-gray-600 dark:text-gray-300 mb-4">We will only use your email to send occasional updates and important release notes like our paid subscibers. No spam, and you can unsubscribe at any time.</p>
                  <input aria-label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-2 rounded border mb-3 text-black" />
                  <div className="flex items-center gap-3">
                    <button onClick={async () => {
                      setStatus(null)
                      try {
                        const res = await fetch('/api/subscribe', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) })
                        const data = await res.json() as { success?: boolean; error?: string }
                        if (res.ok) {
                          setStatus({ ok: true, message: 'Thanks — check your inbox.' })
                          setEmail('')
                          // Close modal after successful subscribe
                          setShowSignup(false)
                        } else {
                          setStatus({ ok: false, message: data.error || 'Failed' })
                        }
                      } catch (err) {
                        console.error('Subscribe request failed', err)
                        setStatus({ ok: false, message: 'Request failed' })
                      }
                    }} className={`rounded-md ${buttonBg} px-3 py-1.5 text-sm ${hoverBg}`}>Subscribe</button>
                    <button onClick={() => setShowSignup(false)} className={`rounded-md ${buttonBg} px-3 py-1.5 text-sm ${hoverBg}`}>Cancel</button>
                  </div>
                  {status && <p className={`mt-3 text-sm ${status.ok ? 'text-green-500' : 'text-red-500'}`}>{status.message}</p>}
                </div>
              </div>
            )}
          </>

          {loggedIn ? (
            <>
              <span className={`hidden text-sm sm:inline ${accentText}`}>
                Hi, {firstName}
              </span>
              <span
                className={`inline-flex h-8 w-8 items-center justify-center rounded-full ${avatarBg} text-lg`}
              >
                {avatar}
              </span>
              <button
                className={`rounded-md ${buttonBg} px-3 py-1.5 text-sm ${hoverBg}`}
                aria-label="Logout"
              >
                🔒
              </button>
              <button
                onClick={toggleTheme}
                className={`rounded-md ${buttonBg} px-3 py-1.5 text-sm ${hoverBg}`}
                aria-label="Toggle theme"
              >
                {isDark ? '🌞' : '🌙'}
              </button>
            </>
          ) : (
            <Link
              href="#"
              className={`rounded-md ${buttonBg} px-3 py-1.5 text-sm ${hoverBg}`}
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}