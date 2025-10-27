// website/components/ForgotPasswordPage.tsx
// Password reset request page

'use client'

import { useState } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import PanelWrapper from '@/components/PanelWrapper'
import Section from '@/components/Section'
import CTAButton from '@/components/CTAButton'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState<string>('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      const res = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (res.ok) {
        setSent(true)
      } else {
        const data = await res.json()
        setError(data.message || 'Failed to send reset email')
      }
    } catch (err) {
      console.error('Forgot password error:', err)
      setError('Something went wrong. Please try again.')
    }
  }

  return (
    <main className="w-full h-auto pt-[60px] bg-bgLight dark:bg-bgDark text-black dark:text-white transition-colors duration-300">
      <Header />

      <div className="px-4 md:px-4 space-y-4">
        <PanelWrapper variant="light">
          <Section id="forgot-password" title="Reset Password" variant="light">
            {sent ? (
              <div className="max-w-md mx-auto text-center space-y-4">
                <p className="text-green-600 dark:text-green-400">
                  ✅ Password reset email sent! Check your inbox.
                </p>
                <p className="text-sm opacity-80">
                  If you don&apos;t receive an email within a few minutes, please check your spam folder.
                </p>
                <CTAButton label="Back to Login" href="/login" variant="light" />
              </div>
            ) : (
              <div className="max-w-md mx-auto space-y-4">
                <p className="text-sm opacity-80 text-center mb-4">
                  Enter your email address and we&apos;ll send you a link to reset your password.
                </p>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <input
                    type="email"
                    required
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-md border border-gray-300 text-black"
                  />
                  {error && (
                    <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
                  )}
                  <div className="flex justify-center">
                    <CTAButton
                      label="Send Reset Link"
                      type="submit"
                      variant="light"
                    />
                  </div>
                </form>

                <div className="mt-6 text-center text-sm">
                  <a href="/login" className="underline opacity-80 hover:opacity-100">
                    Back to Login
                  </a>
                </div>
              </div>
            )}
          </Section>
        </PanelWrapper>
      </div>

      <Footer />
    </main>
  )
}
