'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect } from 'react'
// CLERK DISABLED
// import { useAuth, useUser } from '@clerk/nextjs'
// import { AuthUserButton, AuthOrgSwitcher } from '@/components/auth/AuthComponents'
import { useSignup } from './SignupModalProvider'
import { useTheme } from '@/components/theme/ThemeContext'

type HeaderProps = {
  isAdmin?: boolean
}

export default function Header({
  isAdmin = false,
}: HeaderProps = {}) {
  // CLERK DISABLED
  // const { isLoaded: authLoaded, isSignedIn } = useAuth()
  // const { user } = useUser()
  const { theme, toggleTheme } = useTheme()
  const { open: openSignup } = useSignup()
  const isDark = theme === 'dark' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches)
  
  // Theme icon based on current mode
  const themeIcon = theme === 'system' ? '🔄' : theme === 'dark' ? '🌞' : '🌙'

  // CLERK DISABLED - use old auth
  const loggedIn = false
  const firstName = 'User'

  // Sync theme with Tailwind's dark class
  useEffect(() => {
    const root = document.documentElement
    if (isDark) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [isDark])

  const matteClass = isDark
    ? 'bg-black/60 text-white'
    : 'bg-white/60 text-gray-900'

  const hoverBg = isDark ? 'hover:bg-white/20' : 'hover:bg-black/10'
  const buttonBg = isDark ? 'bg-white/10' : 'bg-black/10'
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
                className={`rounded-md ${buttonBg} px-3 py-1.5 text-sm ${hoverBg} flex items-center gap-2`}
                title="Admin Dashboard"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                </svg>
                <span className="hidden sm:inline">Panel</span>
              </Link>
              <button
                onClick={toggleTheme}
                className={`rounded-md ${buttonBg} px-3 py-1.5 text-sm ${hoverBg}`}
                aria-label="Toggle theme"
                title={`Theme: ${theme}`}
              >
                {themeIcon}
              </button>
            </>
          ) : (
            <>
              {/* Show Invite for logged-in users, Join for non-logged-in */}
              {/* CLERK DISABLED - show join/signin */}
              {loggedIn ? (
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
                  <button
                    onClick={toggleTheme}
                    className={`rounded-md ${buttonBg} px-3 py-1.5 text-sm ${hoverBg}`}
                    aria-label="Toggle theme"
                  >
                    {themeIcon}
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
                  <button
                    onClick={toggleTheme}
                    className={`rounded-md ${buttonBg} px-3 py-1.5 text-sm ${hoverBg}`}
                    aria-label="Toggle theme"
                  >
                    {themeIcon}
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
