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
            body="SafeShipping is a next-generation logistics platform built to streamline global shipping through blockchain-backed transparency and high-performance WebAssembly (WASM) execution. From smart contracts to secure handoffs, SafeShipping delivers speed, security, and scalability for modern supply chains."
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
            <div className="px-4 md:px-4 space-y-4 text-black/70 dark:text-white/70 leading-relaxed">
              <p>
                Our flagship logistics platform, engineered to simplify fulfillment, reduce risk, and scale effortlessly across global markets. At its core, SafeShipping combines two breakthrough technologies: <strong>blockchain smart contracts</strong> and <strong>WebAssembly (WASM)</strong>.
              </p>
              <p className="mt-2">
                <strong>Smart contracts</strong> are self-executing agreements stored on the blockchain. They automate shipping workflows — from verifying handoffs to releasing payments — without relying on intermediaries. This ensures every transaction is secure, transparent, and tamper-proof.
              </p>
              <p className="mt-2">
                <strong>WebAssembly (WASM)</strong> is a high-performance runtime that allows SafeShipping to execute complex logistics logic directly in the browser or edge environments. It delivers near-native speed, enabling real-time route optimization, dynamic pricing, and scalable coordination across thousands of shipments.
              </p>
              <p className="mt-2">
                Together, these technologies make SafeShipping faster, safer, and smarter — whether you&apos;re scaling e-commerce or managing enterprise logistics. This video highlights key innovations including decentralized verification, secure handoff protocols, and a user-friendly interface designed for businesses of all sizes.
              </p>
            </div>
            
            <div className="w-full mb-6 my-6">
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