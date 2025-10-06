'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect } from 'react'
import { useSignup } from './SignupModalProvider'
import { useTheme } from '@/components/theme/ThemeContext'

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

  // Sync theme with Tailwind's dark class
  useEffect(() => {
    const root = document.documentElement
    if (isDark) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [isDark])

  const { open: openSignup } = useSignup()

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
              {/* Signup moved here so it's grouped with auth controls */}
              <button
                onClick={() => openSignup()}
                className={`rounded-md ${buttonBg} px-3 py-1.5 text-sm ${hoverBg}`}
                aria-label="Sign up"
              >
                Sign up
              </button>

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
            </>
          )}
        </div>
      </div>
    </header>
  )
}