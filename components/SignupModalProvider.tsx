'use client'

import React, { createContext, useContext, useState } from 'react'
import SignupModal from './SignupModal'

type SignupContextType = {
  open(): void
  close(): void
}

const SignupContext = createContext<SignupContextType | null>(null)

export function SignupProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <SignupContext.Provider value={{ open: () => setOpen(true), close: () => setOpen(false) }}>
      {children}
      <SignupModal isOpen={open} onClose={() => setOpen(false)} />
    </SignupContext.Provider>
  )
}

export function useSignup() {
  const ctx = useContext(SignupContext)
  if (!ctx) throw new Error('useSignup must be used within SignupProvider')
  return ctx
}
