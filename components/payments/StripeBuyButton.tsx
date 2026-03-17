'use client'

import { trackSubscribeButtonClick } from '@/lib/analytics'

interface StripeBuyButtonProps {
  location?: string // Track which button was clicked (e.g., 'hero', 'cta_1', 'cta_2')
}

export default function StripeBuyButton({ 
  location = 'unknown'
}: StripeBuyButtonProps) {
  
  const handleClick = () => {
    // Track the button click
    trackSubscribeButtonClick(location)
    
    // Redirect to Stripe payment link with coupon pre-filled
    window.location.href = 'https://buy.stripe.com/3cIcN5aGE5q717lbUdfnO01?prefilled_promo_code=TRIAL99'
  }

  return (
    <button
      onClick={handleClick}
      className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold py-4 px-8 rounded-lg text-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
    >
      Subscribe Now - $0.99 First Month
    </button>
  )
}