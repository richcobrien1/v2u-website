"use client"
import React, { useState, useEffect } from 'react'
import { adminFetch, saveToken } from '@/components/AdminClient'
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { CheckCircle } from 'lucide-react';

export default function AdminOnboardPage() {
  const [adminId, setAdminId] = useState('')
  const [secret, setSecret] = useState('')
  const [onboardToken, setOnboardToken] = useState('')
  const [message, setMessage] = useState<string | React.ReactNode>('')
  const [authorized, setAuthorized] = useState(false)
  const [showTokenForm, setShowTokenForm] = useState(false)

  useEffect(() => {
    async function check() {
      try {
        const res = await adminFetch('/api/admin-whoami')
        if (res.ok) {
          const j: unknown = await res.json()
          if (j && typeof j === 'object') {
            const obj = j as Record<string, unknown>
            if (obj['identity']) {
              setAuthorized(true)
              return
            }
          }
        }
        // If not authorized, show token form for initial setup
        setShowTokenForm(true)
      } catch {
        setShowTokenForm(true)
      }
    }
    check()
  }, [])

  async function handleVerifyToken(e: React.FormEvent) {
    e.preventDefault()
    setMessage('Verifying token...')
    try {
      const res = await fetch('/api/admin-onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: onboardToken, action: 'get', adminId: 'test' })
      })
      const j: unknown = await res.json()
      if (res.ok) {
        setAuthorized(true)
        setShowTokenForm(false)
        saveToken(onboardToken) // Save token for subsequent requests
        setMessage(
          <span className="flex items-center gap-2 text-green-600">
            <CheckCircle className="w-4 h-4" />
            Token verified
          </span>
        )
      } else {
        let errMsg = 'Invalid token'
        if (j && typeof j === 'object') {
          const obj = j as Record<string, unknown>
          if (typeof obj['error'] === 'string') errMsg = obj['error']
        }
        setMessage(errMsg)
      }
    } catch {
      setMessage('Network error')
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setMessage('Creating admin...')
    try {
      const res = await adminFetch('/api/admin-onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create', adminId, secret })
      })
      const j: unknown = await res.json()
      if (!res.ok) {
        let errMsg = 'create failed'
        if (j && typeof j === 'object') {
          const obj = j as Record<string, unknown>
          if (typeof obj['error'] === 'string') errMsg = obj['error']
        }
        setMessage(errMsg)
        return
      }
      
      // Admin created successfully - now log them in automatically
      setMessage(
        <span className="flex items-center gap-2 text-green-600">
          <CheckCircle className="w-4 h-4" />
          Admin created - Logging in...
        </span>
      )
      
      try {
        const loginRes = await fetch('/api/admin-login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ adminId, secret, rememberMe: true })
        })
        
        if (loginRes.ok) {
          const loginData = await loginRes.json()
          console.log('Login response:', loginData)
          
          // Wait a bit longer for cookie to be set
          setMessage(
            <span className="flex items-center gap-2 text-green-600">
              <CheckCircle className="w-4 h-4" />
              Admin created - Login successful! Redirecting...
            </span>
          )
          setTimeout(() => {
            console.log('Redirecting to dashboard...')
            window.location.href = '/admin/dashboard'
          }, 1000)
        } else {
          const errorData = await loginRes.json()
          console.error('Login failed:', errorData)
          setMessage(`Admin created but login failed: ${JSON.stringify(errorData)}`)
          setTimeout(() => {
            window.location.href = '/admin/login'
          }, 3000)
        }
      } catch (err) {
        console.error('Login error:', err)
        setMessage(`Admin created but login failed: ${err}`)
        setTimeout(() => {
          window.location.href = '/admin/login'
        }, 3000)
      }
    } catch {
      setMessage('Network error')
    }
  }

  if (showTokenForm) return (
    <main className="min-h-screen bg-(--site-bg) text-(--site-fg)">
      <Header />

      <div className="p-6 pt-24 max-w-xl mx-auto">
        <h1 className="text-2xl mb-4">Admin Setup - First Time</h1>
        <div className="rounded-xl bg-[#212121ff] text-white p-6 mb-4">
          <p className="mb-4 text-sm text-gray-300">
            No admin users exist yet. Enter the onboarding token to create the first admin account.
          </p>
          <form onSubmit={handleVerifyToken}>
            <label className="block mb-2">Onboarding Token</label>
            <input
              value={onboardToken}
              onChange={e => setOnboardToken(e.target.value)}
              className="w-full mb-4 p-2 rounded bg-gray-700 text-white"
              type="password"
              placeholder="Enter onboarding token"
            />
            <button className="px-4 py-2 bg-blue-600 text-white rounded">Verify Token</button>
          </form>
        </div>
        {message && <div className="mt-4 rounded-xl bg-[#212121ff] text-white p-4">{message}</div>}
      </div>

      <Footer />
    </main>
  )

  if (!authorized) return (
    <main className="min-h-screen bg-(--site-bg) text-(--site-fg)">
      <Header />
      <div className="p-8 pt-24">Checking authorization...</div>
      <Footer />
    </main>
  )

  return (
    <main className="min-h-screen bg-(--site-bg) text-(--site-fg)">
      <Header />

      <div className="p-6 pt-24 max-w-xl mx-auto">
        <h1 className="text-2xl mb-4">Create Admin</h1>
        <div className="rounded-xl bg-[#212121ff] text-white p-6">
          <form onSubmit={handleCreate}>
            <label className="block mb-2">Admin ID</label>
            <input value={adminId} onChange={e => setAdminId(e.target.value)} className="w-full mb-4 p-2 rounded bg-gray-700 text-white" />
            <label className="block mb-2">Secret</label>
            <input value={secret} onChange={e => setSecret(e.target.value)} className="w-full mb-4 p-2 rounded bg-gray-700 text-white" />
            <div className="flex gap-3">
              <button className="px-4 py-2 bg-green-600 text-white rounded">Create</button>
              <a href="/admin/dashboard" className="px-4 py-2 bg-gray-600 text-white rounded">Back</a>
            </div>
          </form>
        </div>
        {message && <div className="mt-4 rounded-xl bg-[#212121ff] text-white p-4">{message}</div>}
      </div>

      <Footer />
    </main>
  )
}
