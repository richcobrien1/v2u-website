'use client'
import React, { useEffect } from 'react'
import { useTheme } from '@/components/theme/ThemeContext'

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useTheme()

  useEffect(() => {
    const root = document.documentElement
    if (resolvedTheme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [resolvedTheme])

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
      {children}
    </div>
  )
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminLayoutContent>{children}</AdminLayoutContent>
}
