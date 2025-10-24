'use client'

import { useEffect, useState } from 'react'
import CTAButton from '@/components/CTAButton'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Section from '@/components/Section'
import StripeBuyButton from '@/components/payments/StripeBuyButton'
import StripeLogo from '@/components/payments/StripeLogo'
import PanelWrapper from '@/components/PanelWrapper'

export default function FounderSubscriberPage() {
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
      <Header loggedIn={true} firstName="Welcome" avatar="🟡" />

      <div className="px-4 md:px-4 space-y-4">

        {/* Hero Panel - Dark */}
        <PanelWrapper variant="dark">
          <Section
            id="founder-hero"
            title="🚀 We just launched AI-Now Premium 🚀"
            variant="dark"
            >
            <>
              <p className="mb-4">
                277 YouTube subscribers have already been getting daily AI-Now podcast news and insights.
              </p>
              <p className="mb-4">
                Now we&apos;re going deeper—with a founding member offer for a limited time and only for the first 300 subscribers.
              </p>
              <p className="mb-4">
                Become a founder today!
              </p>
              <p className="mb-6">
                <strong>$4.99/month</strong> gets you exclusive access to:
              </p>
            </>
            
            <ul className="text-left space-y-3 mb-8 text-inherit opacity-80">
              {/* <li>✅ AI-Now: Extended Daily with Alex & Jessica</li> */}
              <li>✅ AI-Now: Weekly, Monthly, Annual Review and Reports with Alex & Jessica</li>
              <li>✅ AI-Now-Educate: Weekly educational content with Alex & Jessica</li>
              <li>✅ AI-Now-Commercial: Latest commercial tools & strategies</li>
              <li>✅ AI-Now-Conceptual: Conceptual deep dives, analysis & frameworks</li>
            </ul>

            <StripeBuyButton buyButtonId="buy_btn_1SFaNmDisN9aFc9h6QlBOvKd" />

            <p className="text-xs text-inherit opacity-75 flex items-center gap-1">
              Secure checkout powered by <StripeLogo />
            </p>
          </Section>
        </PanelWrapper>

        {/* Promo Panel - Light */}
        <PanelWrapper variant="light">
          <Section
            id="promo-banner"
            title="AI-Now-Educate"
            body="Weekly educational specific episodes with Alex & Jessica — clear, actionable, and premium."
            variant="light"
            background={{ from: '#015451', to: '#0F8378' }}
          >
            <div className="w-full mb-6">
              <div className="h-[472px] w-full rounded-lg flex items-center justify-center">
                <iframe
                  className="block w-full h-full min-h-[480px] rounded-xl mb-2"
                  src="https://www.youtube.com/embed/X5kvtBmvR1Q?si=v0kg4xAUUiSWT0KD"
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              </div>
            </div>
            <CTAButton
              label="Watch on YouTube"
              href="https://youtu.be/X5kvtBmvR1Q?si=llegdATi-jR8p3tv"
              variant="light"
              className="mt-6"
            />
          </Section>
        </PanelWrapper>

        {/* Testimonials Panel - Dark */}
        <PanelWrapper variant="dark">
          <Section
            id="testimonials"
            title="What Our Subscribers Say"
            variant="dark"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-inherit opacity-80">
              <div className="bg-white/10 p-4 rounded-lg">
                &ldquo;This content is a game-changer. Alex and Jessica make AI feel accessible.&rdquo;
              </div>
              <div className="bg-white/10 p-4 rounded-lg">
                &ldquo;I&apos;ve used three strategies from AI-Now-Educate already — and they work.&rdquo;
              </div>
            </div>
          </Section>
        </PanelWrapper>

        {/* FAQ Panel - Light */}
        <PanelWrapper variant="light">
          <Section
            id="faq"
            title="Frequently Asked Questions"
            variant="light"
          >
            <div className="text-inherit opacity-80 space-y-6">
              <div>
                <h3 className="font-semibold">What do I get with my subscription?</h3>
                <p>Access to premium content including AI-Now-Educate, Commercial, and Conceptual series.</p>
              </div>
              <div>
                <h3 className="font-semibold">Can I cancel anytime?</h3>
                <p>Yes — your subscription is managed securely through Stripe and can be canceled anytime.</p>
              </div>
              <div>
                <h3 className="font-semibold">Is this content beginner-friendly?</h3>
                <p>Absolutely. Alex and Jessica break down complex topics into clear, actionable insights.</p>
              </div>
            </div>
          </Section>
        </PanelWrapper>

        {/* Premium Content Gate - Dark */}
        {hasAccess ? (
          <PanelWrapper variant="dark">
            <Section
              id="premium-content"
              title="AI-Now Premium"
              body="Welcome to AI-Now Premium."
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
          <PanelWrapper variant="dark">
            <Section
              id="premium-content"
              title="Become an AI-Now Founder today!"
              body="Welcome to AI-Now Premium"
              variant="dark"
            >
              <div className="text-center mt-8 mb-8">
                <StripeBuyButton buyButtonId="buy_btn_1SFaNmDisN9aFc9h6QlBOvKd" />
              </div>
            </Section>
          </PanelWrapper>
        )}
      </div>

      <Footer />
    </main>
  )
}