'use client'

import { useEffect, useState } from 'react'
import CTAButton from '@/components/CTAButton'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Section from '@/components/Section'
// import StripeBuyButton from '@/components/payments/StripeBuyButton'
// import StripeLogo from '@/components/payments/StripeLogo'
import PanelWrapper from '@/components/PanelWrapper'
import PostCardDirectory from './PostCardDirectory'

export default function TrafficJamzPage() {
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
    <main className="w-full h-auto pt-12 bg-bgLight dark:bg-bgDark text-black dark:text-white transition-colors duration-300">
      <Header />

      <div className="px-4 md:px-4 space-y-4 mb-6">

        {/* Promo Panel - Light */}
        <PanelWrapper variant="light">
          <Section
            id="promo-banner"
            title={
              <span className="inline-flex items-center gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/TrafficJamz.ico"
                  alt="TrafficJamz Logo"
                  className="w-6 h-6"
                />
                Jamz/TrafficJamz
              </span>
            }
            body="Jamz is a web, iPhone, Android app that connects to TrafficJamz 
              service platform that provides a group of subscribed-connected active 
              group users with audio communications including music to be able in 
              real-time hear and speak to each other anytime. Plus real-time location 
              service so they can track where each other is at any time. An example 
              use case is a group of skiers who can talk and listen to music together 
              as a group and anywhere they are on the mountain."
            variant="light"
          >
             <div className="w-full mb-6">
              <div className="relative w-full h-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/Jamz-sking.png"
                  alt="Jamz Original Artwork"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <PostCardDirectory />

            {/* ✅ Transcript Block */}
            <div className="mt-6 text-black/70 dark:text-white/70 leading-relaxed max-w-3xl">
              {/* <p>
                SafeShipping is our premium logistics solution designed to streamline fulfillment, reduce risk, and optimize delivery across global markets. This video highlights key features including AI-powered route planning, real-time tracking, and secure handoff protocols.
              </p>
              <p className="mt-2">
                Whether you&apos;re scaling e-commerce or managing enterprise supply chains, SafeShipping ensures your products arrive safely, efficiently, and with full transparency.
              </p> */}
            </div>

            <CTAButton
              label="Contact Us to Learn More"
              href="mailto:admin@v2u.us?subject=TrafficJamz/Jamz%20Inquiry&body=Hi%20Team%2C%0A%0AI%20have%20a%20question%20about%20TrafficJamz/Jamz..."
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
          <div className="rounded-xl p-12 bg-[#015451FF] text-white text-center">
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