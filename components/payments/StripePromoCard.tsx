'use client'

import { useEffect } from 'react'

export default function StripeBuyCard() {
  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://js.stripe.com/v3/buy-button.js'
    script.async = true
    document.body.appendChild(script)
  }, [])

  return (
    <div
      dangerouslySetInnerHTML={{
        __html: `
          <stripe-buy-button
            buy-button-id="buy_btn_1S55FpDisN9aFc9hmrDbEN44"
            publishable-key="pk_live_51R6rM5DisN9aFc9hlaxQbuMPtgC5CLILTxKUVv2SYC8v9A1xcaxnPKOQxeYHBwXWbdXK799C7FPLcXKweZdMeXw100SVNzdRbx"
          ></stripe-buy-button>
        `,
      }}
    />
  )
}