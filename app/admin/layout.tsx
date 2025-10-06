import React from 'react'

export const metadata = { title: 'Admin' }

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="p-6">{children}</div>
    </div>
  )
}
