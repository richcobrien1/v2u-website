'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { useUser } from '../hooks/useUser'
import { useSignup } from './SignupModalProvider'
import { useTheme } from '@/components/theme/ThemeContext'

type HeaderProps = {
  avatar?: string
  isAdmin?: boolean
}

export default function Header({
  avatar = '🙂',
  isAdmin = false,
}: HeaderProps = {}) {
  const { user, loading } = useUser()
  const [loggingOut, setLoggingOut] = useState(false)
  const { theme, toggleTheme } = useTheme()
  const { open: openSignup } = useSignup()
  const isDark = theme === 'dark'

  // Always use hook data for authentication state
  const loggedIn = user.loggedIn
  const firstName = user.firstName || user.customerId?.split('@')[0] || 'User'

  // Sync theme with Tailwind's dark class
  useEffect(() => {
    const root = document.documentElement
    if (isDark) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [isDark])

  async function handleLogout(e: React.FormEvent) {
    e.preventDefault()
    setLoggingOut(true)
    try {
      await fetch('/api/logout', {
        method: 'POST',
        credentials: 'include',
      })
      // Force full page reload to clear all client state and show public content
      window.location.href = window.location.pathname
    } catch (err) {
      console.error('Logout failed:', err)
      setLoggingOut(false)
    }
  }

  const matteClass = isDark
    ? 'bg-black/60 text-white'
    : 'bg-white/60 text-gray-900'

  const hoverBg = isDark ? 'hover:bg-white/20' : 'hover:bg-black/10'
  const buttonBg = isDark ? 'bg-white/10' : 'bg-black/10'
  const avatarBg = isDark ? 'bg-white/10' : 'bg-black/10'
  const accentText = isDark ? 'text-white/80' : 'text-gray-700'

  return (
    <header
      className={`fixed top-0 left-0 w-full ${matteClass} backdrop-blur-sm z-50 transition-colors duration-300`}
    >
      <div className="w-full px-4 sm:px-6 py-2 flex items-center justify-between">
        {/* Left: Logo */}
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
        </div>

        {/* Right: Admin Nav or Auth + Theme Toggle */}
        <div className="flex items-center gap-3">
          {isAdmin ? (
            <>
              <Link
                href="/admin/dashboard"
                className={`rounded-md ${buttonBg} px-3 py-1.5 text-sm ${hoverBg}`}
              >
                Dashboard
              </Link>
              <Link
                href="/admin/subscribers"
                className={`rounded-md ${buttonBg} px-3 py-1.5 text-sm ${hoverBg}`}
              >
                Subscribers
              </Link>
              <Link
                href="/admin/email-template"
                className={`rounded-md ${buttonBg} px-3 py-1.5 text-sm ${hoverBg}`}
              >
                Email Template
              </Link>
              <Link
                href="/admin/send-promotional"
                className={`rounded-md ${buttonBg} px-3 py-1.5 text-sm ${hoverBg}`}
              >
                Send Promotional
              </Link>
              <Link
                href="/admin/ai-now"
                className={`rounded-md ${buttonBg} px-3 py-1.5 text-sm ${hoverBg}`}
              >
                News Gatherer
              </Link>
              <button
                onClick={toggleTheme}
                className={`rounded-md ${buttonBg} px-3 py-1.5 text-sm ${hoverBg}`}
                aria-label="Toggle theme"
              >
                {isDark ? '🌞' : '🌙'}
              </button>
            </>
          ) : (
            <>
              {/* Show Invite for logged-in users, Join for non-logged-in */}
              {loading ? (
                <span className="text-sm opacity-60">Loading…</span>
              ) : loggedIn ? (
                <>
                  {/* Invite button for logged-in users */}
                  <button
                    onClick={() => openSignup('invite')}
                    className={`rounded-md ${buttonBg} px-3 py-1.5 text-sm ${hoverBg}`}
                    aria-label="Invite a Friend"
                  >
                    Invite
                  </button>
                  <span className={`hidden text-sm sm:inline ${accentText}`}>
                    Hi, {firstName}
                  </span>
                  <span
                    className={`inline-flex h-8 w-8 items-center justify-center rounded-full ${avatarBg} text-lg`}
                  >
                    {avatar}
                  </span>
                  <button
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className={`rounded-md ${buttonBg} px-3 py-1.5 text-sm ${hoverBg} disabled:opacity-50`}
                    aria-label="Logout"
                  >
                    {loggingOut ? '...' : '🔒'}
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
                <>
                  {/* Join button for non-logged-in users */}
                  <button
                    onClick={() => openSignup('signup')}
                    className={`rounded-md ${buttonBg} px-3 py-1.5 text-sm ${hoverBg}`}
                    aria-label="Join our mailing list"
                  >
                    Join
                  </button>
                  <Link
                    href="/podcast-dashboard"
                    className={`rounded-md ${buttonBg} px-3 py-1.5 text-sm ${hoverBg}`}
                  >
                    Login
                  </Link>
                  <button
                    onClick={toggleTheme}
                    className={`rounded-md ${buttonBg} px-3 py-1.5 text-sm ${hoverBg}`}
                    aria-label="Toggle theme"
                  >
                    {isDark ? '🌞' : '🌙'}
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  )
}
