// website/components/Header.tsx
// Header component with dynamic theming and user/admin navigation
// Updated: Login/Logout buttons show 🔒 icon + text, and Invite button appears when logged in

'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { useSignup } from './SignupModalProvider'
import { useTheme } from '@/components/theme/ThemeContext'
import InviteModal from '@/components/InviteModal'

type HeaderProps = {
  loggedIn?: boolean
  firstName?: string
  avatar?: string
  isAdmin?: boolean
}

export default function Header({
  loggedIn = false,
  firstName,
  avatar = '🙂',
  isAdmin = false,
}: HeaderProps) {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'
  const { open: openSignup } = useSignup()
  const [showInvite, setShowInvite] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(loggedIn)

  useEffect(() => {
    const root = document.documentElement
    if (isDark) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [isDark])

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
              <Link href="/admin/dashboard" className={`rounded-md ${buttonBg} px-3 py-1.5 text-sm ${hoverBg}`}>
                Dashboard
              </Link>
              <Link href="/admin/subscribers" className={`rounded-md ${buttonBg} px-3 py-1.5 text-sm ${hoverBg}`}>
                Subscribers
              </Link>
              <Link href="/admin/email-template" className={`rounded-md ${buttonBg} px-3 py-1.5 text-sm ${hoverBg}`}>
                Email Template
              </Link>
              <Link href="/admin/send-promotional" className={`rounded-md ${buttonBg} px-3 py-1.5 text-sm ${hoverBg}`}>
                Send Promotional
              </Link>
              <Link href="/admin/ai-now" className={`rounded-md ${buttonBg} px-3 py-1.5 text-sm ${hoverBg}`}>
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
              {/* Signup (only when logged out) */}
              {!isLoggedIn && (
                <button
                  onClick={() => openSignup()}
                  className={`rounded-md ${buttonBg} px-3 py-1.5 text-sm ${hoverBg}`}
                  aria-label="Sign up"
                >
                  Sign up
                </button>
              )}

              {isLoggedIn ? (
                <>
                  <span className={`hidden text-sm sm:inline ${accentText}`}>Hi, {firstName}</span>
                  <span
                    className={`inline-flex h-8 w-8 items-center justify-center rounded-full ${avatarBg} text-lg`}
                  >
                    {avatar}
                  </span>

                  {/* Invite button */}
                  <button
                    onClick={() => setShowInvite(true)}
                    className={`flex items-center gap-1 rounded-md ${buttonBg} px-3 py-1.5 text-sm ${hoverBg}`}
                    aria-label="Invite"
                  >
                    ✉️ <span>Invite</span>
                  </button>

                  {/* Logout button */}
                  <button
                    onClick={async () => {
                      await fetch('/api/logout', { method: 'POST' })
                      setIsLoggedIn(false) // flip immediately
                      window.location.href = '/podcast-dashboard'
                    }}
                    className={`flex items-center gap-1 rounded-md ${buttonBg} px-3 py-1.5 text-sm ${hoverBg}`}
                    aria-label="Logout"
                  >
                    <span role="img" aria-hidden>🔒</span>
                    <span>Logout</span>
                  </button>

                  <button
                    onClick={toggleTheme}
                    className={`rounded-md ${buttonBg} px-3 py-1.5 text-sm ${hoverBg}`}
                    aria-label="Toggle theme"
                  >
                    {isDark ? '🌞' : '🌙'}
                  </button>

                  {/* Invite Modal */}
                  <InviteModal isOpen={showInvite} onClose={() => setShowInvite(false)} mode="invite" />
                </>
              ) : (
                <Link
                  href="/login"
                  className={`flex items-center gap-1 rounded-md ${buttonBg} px-3 py-1.5 text-sm ${hoverBg}`}
                  aria-label="Log in"
                >
                  <span role="img" aria-hidden>🔒</span>
                  <span>Login</span>
                </Link>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  )
}
