'use client'

import Image from 'next/image'

export default function StripeLogo() {
  return (
    <span className="inline-flex items-center gap-1">
      <Image
        src="/stripe-logo-dark.svg"
        alt="Stripe logo"
        width={60}
        height={20}
        className="opacity-50"
        priority
      />
    </span>
  )
}
