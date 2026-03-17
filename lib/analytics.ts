'use client'

// Conversion tracking helper functions
// Import this in components that need to track events

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    gtag?: (...args: any[]) => void
    fbq?: (...args: any[]) => void
  }
}

export const trackEvent = (eventName: string, params?: Record<string, string | number>) => {
  // Google Analytics 4
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, params)
  }

  // Facebook Pixel
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', eventName, params)
  }

  // Console log for debugging
  console.log('📊 Event tracked:', eventName, params)
}

// Specific conversion events for subscribe page
export const trackSubscribePageView = () => {
  trackEvent('page_view', {
    page_title: 'Subscribe to Premium',
    page_location: '/subscribe'
  })
}

export const trackSubscribeButtonClick = (buttonLocation: string) => {
  trackEvent('subscribe_button_click', {
    button_location: buttonLocation, // 'hero', 'cta_1', 'cta_2', etc.
    value: 4.99,
    currency: 'USD'
  })
  
  // Facebook Pixel specific event
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'InitiateCheckout', {
      value: 4.99,
      currency: 'USD',
      content_name: 'AI Deep Dive Premium'
    })
  }
}

export const trackPremiumPurchase = (subscriptionId: string) => {
  trackEvent('purchase', {
    transaction_id: subscriptionId,
    value: 4.99,
    currency: 'USD',
    items: [{
      item_id: 'premium_subscription',
      item_name: 'AI Deep Dive Premium',
      price: 4.99,
      quantity: 1
    }]
  })

  // Facebook Pixel conversion
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'Purchase', {
      value: 4.99,
      currency: 'USD',
      content_name: 'AI Deep Dive Premium'
    })
  }
}

export const trackEmailSignup = (signupLocation: string) => {
  trackEvent('generate_lead', {
    signup_location: signupLocation,
    lead_type: 'free_email'
  })

  // Facebook Pixel lead event
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'Lead')
  }
}
