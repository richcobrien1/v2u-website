'use client'

import { useEffect, useState } from 'react'
import CTAButton from '@/components/CTAButton'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Section from '@/components/Section'
// import StripeBuyButton from '@/components/payments/StripeBuyButton'
// import StripeLogo from '@/components/payments/StripeLogo'
import PanelWrapper from '@/components/PanelWrapper'

export default function SafeShippingPage() {
  const [hasAccess, setHasAccess] = useState(false)

  useEffect(() => {
    const cookies = document.cookie.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=')
      acc[key] = value
      return acc
    }, {} as Record<string, string>)

    setHasAccess(cookies['v2u-access'] === 'granted')
  }, [])

  return (
    <main className="w-full h-auto pt-[48px] bg-bgLight dark:bg-bgDark text-black dark:text-white transition-colors duration-300">
      <Header loggedIn={true} firstName="Welcome" avatar="🟡" />

      <div className="px-4 md:px-4 space-y-4">

        {/* Promo Panel - Light */}
        <PanelWrapper variant="light">
          <Section
            id="promo-banner"
            title="SafeShipping"
            body="SafeShipping is a blockchain-based logistics platform using smart contracts, decentralized oracles, and IoT integrations to automate, secure, and verify global shipping workflows."
            variant="light"
            background={{ from: '#015451', to: '#0F8378' }}
          >
            <div className="w-full mb-6">
              <div className="relative w-full h-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/safeshipping-pitch-deck-global.gif"
                  alt="SafeShipping pitch deck animation"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* ✅ Download Button
            <div className="mt-4">
              <a
                href="/safeshipping-pitch-deck-global.mp4"
                download
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-v2uBlue text-white hover:bg-v2uPurple transition-colors"
              >
                <span>Download Video</span>
              </a>
            </div> */}

            {/* ✅ Transcript Block */}
            <div className="mt-6 text-black/70 dark:text-white/70 leading-relaxed max-w-3xl">
              <p>
                SafeShipping is our premium logistics solution designed to streamline fulfillment, reduce risk, and optimize delivery across global markets. This video highlights key features including AI-powered route planning, real-time tracking, and secure handoff protocols.
              </p>
              <p className="mt-2">
                Whether you&apos;re scaling e-commerce or managing enterprise supply chains, SafeShipping ensures your products arrive safely, efficiently, and with full transparency.
              </p>
            </div>
            
            <div className="w-full mb-6">
              <div className="relative w-full h-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/SafeShipping_Agent_Screen_Capture.jpg"
                  alt="SafeShipping Screen Capture"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <CTAButton
              label="Contact Us to Learn More"
              href="mailto:admin@v2u.us?subject=SafeShipping%20Inquiry&body=Hi%20Team%2C%0A%0AI%20have%20a%20question%20about%20SafeShipping..."
              variant="dark"
              className="mt-6"
            />
          </Section>
        </PanelWrapper>


        {/* Premium Content Gate - Dark */}
        {hasAccess ? (
          <PanelWrapper variant="dark">
            <Section
              id="premium-content"
              title="AI-Now Premium"
              body="Welcome to the exclusive feed."
              variant="dark"
            >
              <CTAButton
                label="View Premium Feed"
                href="/premium"
                variant="dark"
                className="mt-4"
              />
            </Section>
          </PanelWrapper>
        ) : (
          <div className="text-center mt-8 mb-8">
            <CTAButton
              label="Learn More About Premium Content"
              href="/subscribe"
              variant="dark"
            />
          </div>
        )}

      </div>

      <Footer />
    </main>
  )
}