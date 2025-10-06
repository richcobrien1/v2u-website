'use client'

import React, { createContext, useContext, useState } from 'react'
import SignupModal from './SignupModal'

type SignupContextType = {
  open(): void
  close(): void
}

const SignupContext = createContext<SignupContextType | null>(null)

export function SignupProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  // store the element that opened the modal so we can restore focus later
  const openerRef = React.useRef<HTMLElement | null>(null)

  function open() {
    openerRef.current = document.activeElement as HTMLElement | null
    setIsOpen(true)
  }

  function close() {
    setIsOpen(false)
    // restore focus to the opener if available
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
      <SignupModal isOpen={isOpen} onClose={close} />
    </SignupContext.Provider>
  )
}

export function useSignup() {
  const ctx = useContext(SignupContext)
  if (!ctx) throw new Error('useSignup must be used within SignupProvider')
  return ctx
}
