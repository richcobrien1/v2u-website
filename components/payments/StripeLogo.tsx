'use client'

import Image from 'next/image'
import { useTheme } from '@/components/theme/ThemeContext'

export default function StripeLogo() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <span className="inline-flex items-center gap-1">
      <Image
        src={isDark ? '/stripe-logo-dark.svg' : '/stripe-logo-dark.svg'}
        alt="Stripe logo"
        width={60}
        height={20}
        className="opacity-70 transition-opacity duration-300"
        priority
      />
    </span>
  )
}
