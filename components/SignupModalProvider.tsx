'use client'

import React, { createContext, useContext, useState } from 'react'
import SignupModal from './SignupModal'

type ModalContextType = {
  open(mode?: 'signup' | 'invite'): void
  close(): void
}

const SignupContext = createContext<ModalContextType | null>(null)

export function SignupProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [mode, setMode] = useState<'signup' | 'invite'>('signup')
  const openerRef = React.useRef<HTMLElement | null>(null)

  function open(modalMode: 'signup' | 'invite' = 'signup') {
    openerRef.current = document.activeElement as HTMLElement | null
    setMode(modalMode)
    setIsOpen(true)
  }

  function close() {
    setIsOpen(false)
    setTimeout(() => {
      try {
        openerRef.current?.focus()
      } catch {
        // ignore
      }
    }, 0)
  }

  return (
    <SignupContext.Provider value={{ open, close }}>
      {children}
      <SignupModal isOpen={isOpen} onClose={close} mode={mode} />
    </SignupContext.Provider>
  )
}

export function useSignup() {
  const ctx = useContext(SignupContext)
  // During SSR or build, return safe defaults instead of throwing
  if (!ctx) {
    return {
      open: () => {},
      close: () => {},
    }
  }
  return ctx
}

// Alias for clarity
export const useInvite = useSignup
