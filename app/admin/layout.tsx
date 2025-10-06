import React from 'react'

export const metadata = { title: 'Admin' }

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--site-bg)] text-[var(--site-fg)]">
      {children}
    </div>
  )
}
