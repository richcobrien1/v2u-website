'use client'

import { useEffect, useRef } from 'react'
import { trackSubscribeButtonClick } from '@/lib/analytics'

interface StripeBuyButtonProps {
  buyButtonId?: string
  location?: string // Track which button was clicked (e.g., 'hero', 'cta_1', 'cta_2')
}

export default function StripeBuyButton({ 
  buyButtonId = "buy_btn_1S55FpDisN9aFc9hmrDbEN44",
  location = 'unknown'
}: StripeBuyButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://js.stripe.com/v3/buy-button.js'
    script.async = true
    document.body.appendChild(script)

    // Track clicks on the Stripe button
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (target.closest('stripe-buy-button')) {
        trackSubscribeButtonClick(location)
      }
    }

    // Add click listener to container
    const container = containerRef.current
    if (container) {
      container.addEventListener('click', handleClick)
    }

    return () => {
      if (container) {
        container.removeEventListener('click', handleClick)
      }
    }
  }, [location])

  return (
    <div
      ref={containerRef}
      className="my-6"
      dangerouslySetInnerHTML={{
        __html: `
          <stripe-buy-button
            buy-button-id="${buyButtonId}"
            publishable-key="pk_live_51R6rM5DisN9aFc9hlaxQbuMPtgC5CLILTxKUVv2SYC8v9A1xcaxnPKOQxeYHBwXWbdXK799C7FPLcXKweZdMeXw100SVNzdRbx"
          ></stripe-buy-button>
        `,
      }}
    />
  )
}