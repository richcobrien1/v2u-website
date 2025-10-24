import React from 'react'

export const metadata = { title: 'Admin' }

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-(--site-bg) text-(--site-fg)">
      {children}
    </div>
  )
}
