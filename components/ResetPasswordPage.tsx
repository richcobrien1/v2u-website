// website/components/ResetPasswordPage.tsx
// Password reset page (accessed via email link)

'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import PanelWrapper from '@/components/PanelWrapper'
import Section from '@/components/Section'
import CTAButton from '@/components/CTAButton'

export default function ResetPasswordPage() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!token) {
      setError('Invalid or missing reset token')
    }
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    try {
      const res = await fetch('/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })

      if (res.ok) {
        setSuccess(true)
      } else {
        const data = await res.json() as { message?: string }
        setError(data.message || 'Failed to reset password')
      }
    } catch (err) {
      console.error('Reset password error:', err)
      setError('Something went wrong. Please try again.')
    }
  }

  return (
    <main className="w-full h-auto pt-[60px] bg-bgLight dark:bg-bgDark text-black dark:text-white transition-colors duration-300">
      <Header />

      <div className="px-4 md:px-4 space-y-4">
        <PanelWrapper variant="light">
          <Section id="reset-password" title="Set New Password" variant="light">
            {success ? (
              <div className="max-w-md mx-auto text-center space-y-4">
                <p className="text-green-600 dark:text-green-400">
                  ✅ Password updated successfully!
                </p>
                <CTAButton label="Go to Login" href="/login" variant="light" />
              </div>
            ) : (
              <div className="max-w-md mx-auto space-y-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <input
                    type="password"
                    required
                    placeholder="New Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 rounded-md border border-gray-300 text-black"
                    minLength={8}
                  />
                  <input
                    type="password"
                    required
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 rounded-md border border-gray-300 text-black"
                    minLength={8}
                  />
                  {error && (
                    <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
                  )}
                  <div className="flex justify-center">
                    <CTAButton
                      label="Update Password"
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
