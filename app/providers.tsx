'use client'

import { ThemeProvider } from '@/components/theme/ThemeContext'
import { SignupProvider } from '@/components/SignupModalProvider'
import { ToastProvider } from '@/components/ToastProvider'
import { Suspense } from 'react'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div>{children}</div>}>
      <ThemeProvider>
        <ToastProvider>
          <SignupProvider>
            {children}
          </SignupProvider>
        </ToastProvider>
      </ThemeProvider>
    </Suspense>
  )
}
