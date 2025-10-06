"use client"

import React, { useEffect, useRef } from 'react'

type FocusTrapProps = {
  active?: boolean
  children: React.ReactNode
  // accept a ref to HTMLElement or HTMLInputElement (common initial targets)
  initialFocusRef?: React.RefObject<HTMLElement | HTMLInputElement | null> | null
  onDeactivate?: () => void
}

export default function FocusTrap({ active = true, children, initialFocusRef, onDeactivate }: FocusTrapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!active) return

    // autofocus to the provided initial focus element, or the first focusable in container
    const t = setTimeout(() => {
      const root = containerRef.current
      if (!root) return
      const target = initialFocusRef?.current || root.querySelector<HTMLElement>('input,button,[href],[tabindex]:not([tabindex="-1"])')
      target?.focus()
    }, 50)

    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onDeactivate?.()
      }
      if (e.key === 'Tab') {
        const el = containerRef.current
        if (!el) return
        const focusable = Array.from(el.querySelectorAll<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'))
          .filter((n) => !n.hasAttribute('disabled') && n.tabIndex !== -1)
        if (focusable.length === 0) return
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        }
      }
    }

    document.addEventListener('keydown', onKey)
    return () => {
      clearTimeout(t)
      document.removeEventListener('keydown', onKey)
    }
  }, [active, initialFocusRef, onDeactivate])

  return (
    <div ref={containerRef} tabIndex={-1}>
      {children}
    </div>
  )
}
