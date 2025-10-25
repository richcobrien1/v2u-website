'use client'

import { useEffect, useState } from 'react'
import CTAButton from '@/components/CTAButton'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Section from '@/components/Section'
import StripeBuyButton from '@/components/payments/StripeBuyButton'
import StripeLogo from '@/components/payments/StripeLogo'
import PanelWrapper from '@/components/PanelWrapper'

export default function SubscribePage() {
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
    <main className="w-full h-auto pt-[60px] bg-bgLight dark:bg-bgDark text-black dark:text-white transition-colors duration-300">
      <Header />

      <div className="px-4 md:px-4 space-y-4">

        {/* Free Updates Panel - Light */}
        <PanelWrapper variant="light">
          <Section
            id="free-updates"
            title="Not ready for Premium?"
            body="Join our free list and get daily AI updates straight to your inbox."
            variant="light"
          >
            <form
              onSubmit={(e) => {
                e.preventDefault()
                // TODO: call your email registration API
                alert('Thanks for signing up! (wire this to your email API)')
              }}
              className="flex flex-col sm:flex-row gap-2 mt-4"
            >
              <input
                type="email"
                required
                placeholder="Enter your email"
                className="flex-1 px-3 py-2 rounded-md border border-gray-300 text-black"
              />
              <CTAButton label="Sign Up Free" type="submit" variant="light" />
            </form>
          </Section>
        </PanelWrapper>

        {/* Hero Panel - Dark */}
        <PanelWrapper variant="dark">
          <Section
            id="subscribe-hero"
            title="Slide Into Premium Content"
            variant="dark"
          >
            <>
              <p className="mb-4">
                <strong>Why Subscribe?</strong> Simply put, knowledge. We distill the most important AI trends, tools, and strategies into clear, actionable insights.
              </p>
              <p className="mb-4">
                Try it for 30 days — you’ll not only understand the terms and concepts behind AI, but you’ll also gain a toolkit of strategies to apply AI in your work and life. The absolute fast-track to understanding and leveraging AI today.
              </p>
              <p className="mb-4">
                <strong>Why now?</strong> Because AI is evolving at lightning speed. Every week, new tools and breakthroughs emerge. Staying updated is not just beneficial — it’s essential. Our content keeps you ahead of the curve, ensuring you’re always informed about the latest developments and how they impact you right now.
              </p>
              <p className="mb-6">
                <strong>$4.99/month</strong> gets you exclusive access to:
              </p>
            </>

            <ul className="text-left space-y-3 mb-8 text-inherit opacity-80">
              <li>✅ AI-Now: Weekly, Monthly, Annual Review and Reports with Alex & Jessica</li>
              <li>✅ AI-Now-Educate: Weekly educational content with Alex & Jessica</li>
              <li>✅ AI-Now-Commercial: Latest commercial tools & strategies</li>
              <li>✅ AI-Now-Conceptual: Conceptual deep dives, analysis & frameworks</li>
            </ul>

            <StripeBuyButton />

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
                “This content is a game-changer. Alex and Jessica make AI feel accessible.”
              </div>
              <div className="bg-white/10 p-4 rounded-lg">
                “I&apos;ve used three strategies from AI-Now-Educate already — and they work.”
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
            <StripeBuyButton />
          </div>
        )}
      </div>

      <Footer />
    </main>
  )
}
