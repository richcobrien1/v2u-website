"use client"

import React, { createContext, useContext, useState } from 'react'

type Toast = { id: string; message: string }

type ToastContext = {
  push(message: string): void
}

const ToastCtx = createContext<ToastContext | null>(null)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  function push(message: string) {
    const id = String(Date.now())
    setToasts((s) => [...s, { id, message }])
    setTimeout(() => setToasts((s) => s.filter((t) => t.id !== id)), 2200)
  }

  return (
    <ToastCtx.Provider value={{ push }}>
      {children}
      <div aria-live="polite" className="fixed top-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((t) => (
          <div key={t.id} className="bg-black text-white px-3 py-1 rounded shadow">{t.message}</div>
        ))}
      </div>
    </ToastCtx.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastCtx)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
