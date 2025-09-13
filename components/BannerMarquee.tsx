'use client'

import { useEffect, useState } from 'react'

export default function BannerMarquee({
  message,
  onMessageComplete,
  height = 48,
}: {
  message: string
  onMessageComplete: () => void
  height?: number
}) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (message) {
      setVisible(true)

      const cycleDuration = 25000 // slower scroll
      const maxDuration = 180000
      const retractAfter = Math.min(cycleDuration * 5, maxDuration)

      const timer = setTimeout(() => {
        onMessageComplete()
      }, retractAfter)

      return () => clearTimeout(timer)
    } else {
      setVisible(false)
    }
  }, [message, onMessageComplete])

  if (!visible) return null

  return (
    <div
      className={`absolute inset-x-0 bottom-0 w-full z-50 pointer-events-none transition-all duration-7000 ease-in ${
        message ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full'
      }`}
      style={{ height: `${height}px` }}
    >
      <div className="w-max animate-marquee flex items-center h-full">
        <p className="px-2 py-2 text-[clamp(0.75rem,2vw,1.25rem)] font-normal italic text-white whitespace-nowrap">
          {message}
        </p>
      </div>
    </div>
  )
}