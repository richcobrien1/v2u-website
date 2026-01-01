import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from '@/components/theme/ThemeContext' // adjust path if needed
import { SignupProvider } from '@/components/SignupModalProvider'
import { ToastProvider } from '@/components/ToastProvider'
import '@/lib/init-services' // Initialize application services

export const metadata: Metadata = {
  title: 'v2u',
  description: 'v2u — automation-ready media systems',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <ThemeProvider>
          <ToastProvider>
            <SignupProvider>
              {children}
            </SignupProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}