// website/components/LoginPage.tsx
// This component handles user login and redirects based on subscription status.
// It uses client-side rendering to manage form state and submission.

'use client'

import { useState } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import PanelWrapper from '@/components/PanelWrapper'
import Section from '@/components/Section'
import CTAButton from '@/components/CTAButton'

// Define the shape of the login response from /api/login
interface LoginResponse {
  success: boolean
  subscription: 'free' | 'premium'
  token: string
}

export default function LoginPage() {
  const [email, setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    // Explicitly type the payload
    const payload: { email: string; password: string } = { email, password }

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        const data: LoginResponse = await res.json()
        if (data.subscription === 'premium') {
          window.location.href = '/podcast-dashboard'
        } else {
          window.location.href = '/subscribe'
        }
      } else {
        alert('Login failed. Please check your credentials.')
      }
    } catch (err) {
      console.error('Login error:', err)
      alert('Something went wrong. Please try again.')
    }
  }

  return (
    <main className="w-full h-auto pt-[48px] bg-bgLight dark:bg-bgDark text-black dark:text-white transition-colors duration-300">
      <Header />

      <div className="px-4 md:px-4 space-y-4">
        <PanelWrapper variant="light">
          <Section id="login" title="Welcome Back" variant="light">
            <form
              onSubmit={handleLogin}
              className="space-y-4 max-w-md mx-auto"
            >
              <input
                type="email"
                required
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-gray-300 text-black"
              />
              <input
                type="password"
                required
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-gray-300 text-black"
              />
              <CTAButton
                label="Log In"
                type="submit"
                variant="light"
                className="w-full"
              />
            </form>

            <div className="mt-4 text-center text-sm opacity-80">
              <a href="/forgot-password" className="underline">
                Forgot password?
              </a>
            </div>

            <div className="mt-6 flex flex-col items-center gap-2 text-sm">
              <span>Don’t have an account?</span>
              <CTAButton label="Sign Up Free" href="/subscribe" variant="light" />
              <CTAButton label="Go Premium" href="/subscribe" variant="dark" />
            </div>
          </Section>
        </PanelWrapper>
      </div>

      <Footer />
    </main>
  )
}
