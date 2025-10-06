'use client'

import { useEffect } from 'react'

interface StripeBuyButtonProps {
  buyButtonId?: string
}

export default function StripeBuyButton({ buyButtonId = "buy_btn_1S55FpDisN9aFc9hmrDbEN44" }: StripeBuyButtonProps) {
  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://js.stripe.com/v3/buy-button.js'
    script.async = true
    document.body.appendChild(script)
  }, [])

  return (
    <div
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