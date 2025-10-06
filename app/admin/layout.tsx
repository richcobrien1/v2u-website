import React from 'react'
import AdminNav from '@/components/AdminNav'

export const metadata = { title: 'Admin' }

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <AdminNav />
      <div className="p-6">{children}</div>
    </div>
  )
}
