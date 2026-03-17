'use client'
export const dynamic = 'force-dynamic'



import { useEffect, useState } from 'react'
import CTAButton from '@/components/CTAButton'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Section from '@/components/Section'
import StripeBuyButton from '@/components/payments/StripeBuyButton'
import StripeLogo from '@/components/payments/StripeLogo'
import PanelWrapper from '@/components/PanelWrapper'
import { trackSubscribePageView } from '@/lib/analytics'

export default function SubscribePage() {
  const [hasAccess, setHasAccess] = useState(false)

  useEffect(() => {
    // Track page view
    trackSubscribePageView()

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

      <div className="page-content">

        {/* LIMITED TIME OFFER BANNER */}
        <div className="bg-gradient-to-r from-cyan-600 to-cyan-700 text-white text-center py-4 px-4 rounded-xl mb-4 shadow-lg">
          <p className="text-lg font-bold mb-1">🎁 LIMITED TIME: Get Your First Month for $0.99!</p>
          <p className="text-sm opacity-90">Join 1,200+ professionals already subscribed • Only 48 spots left at this price</p>
        </div>

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
              <li>✅ AI Deep Dive: Weekly, Monthly, Annual Review and Reports with Alex & Jessica</li>
              <li>✅ AI Deep Dive Educate: Weekly educational content with Alex & Jessica</li>
              <li>✅ AI Deep Dive Commercial: Latest commercial tools & strategies</li>
              <li>✅ AI Deep Dive Conceptual: Conceptual deep dives, analysis & frameworks</li>
            </ul>

            <StripeBuyButton location="hero" />

            <p className="text-xs text-inherit opacity-75 flex items-center gap-1">
              Secure checkout powered by <StripeLogo />
            </p>
          </Section>
        </PanelWrapper>

        {/* Subscribe CTA #1 */}
        <div className="text-center py-6">
          <StripeBuyButton location="cta_after_hero" />
          <p className="text-xs mt-3 opacity-75 flex items-center justify-center gap-1">
            Secure checkout powered by <StripeLogo />
          </p>
        </div>

        {/* Promo Panel - Light */}
        <PanelWrapper variant="light">
          <Section
            id="promo-banner"
            title="AI Deep Dive Educate"
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
            title="What Premium Members Are Saying"
            variant="dark"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-inherit">
              <div className="bg-white/10 p-5 rounded-lg border-l-4 border-green-400">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-yellow-400">★★★★★</span>
                </div>
                <p className="mb-3 opacity-90">&ldquo;I implemented the AI automation framework from episode 12 and saved 15 hours/week. Worth every penny.&rdquo;</p>
                <p className="text-sm opacity-60">— Sarah K., Marketing Director</p>
              </div>
              <div className="bg-white/10 p-5 rounded-lg border-l-4 border-green-400">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-yellow-400">★★★★★</span>
                </div>
                <p className="mb-3 opacity-90">&ldquo;The transcripts alone are worth $50/mo. Being able to search and find specific strategies is invaluable.&rdquo;</p>
                <p className="text-sm opacity-60">— Michael T., Software Engineer</p>
              </div>
              <div className="bg-white/10 p-5 rounded-lg border-l-4 border-green-400">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-yellow-400">★★★★★</span>
                </div>
                <p className="mb-3 opacity-90">&ldquo;Finally, AI content that's actually actionable. Not fluff. My team uses insights from every episode.&rdquo;</p>
                <p className="text-sm opacity-60">— James L., CTO</p>
              </div>
            </div>
            <div className="mt-8 text-center">
              <p className="text-lg font-semibold mb-2">Join 1,200+ Premium Members</p>
              <p className="text-sm opacity-75">Average rating: 4.9/5 ⭐ • 97% renewal rate</p>
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
            <div className="space-y-6">
              <div className="bg-white/80 dark:bg-gray-800/80 p-4 rounded-lg">
                <h3 className="font-bold text-lg mb-2">💰 What's the catch with the $0.99 first month?</h3>
                <p className="opacity-90">No catch. We want you to experience the full value of Premium. After your first month, it's $4.99/mo. Cancel anytime before renewal if you're not satisfied — and we'll refund your $0.99.</p>
              </div>
              <div className="bg-white/80 dark:bg-gray-800/80 p-4 rounded-lg">
                <h3 className="font-bold text-lg mb-2">📚 What exactly do I get with Premium?</h3>
                <p className="opacity-90">4 exclusive content series (Deep Dive, Educate, Commercial, Conceptual), full transcripts with timestamps, downloadable PDF frameworks, early access to new episodes, and an ad-free experience.</p>
              </div>
              <div className="bg-white/80 dark:bg-gray-800/80 p-4 rounded-lg">
                <h3 className="font-bold text-lg mb-2">🔒 Can I cancel anytime?</h3>
                <p className="opacity-90"><strong>Yes, absolutely.</strong> Your subscription is managed through Stripe. Cancel in one click from your account settings. No hoops, no hidden fees, no questions asked.</p>
              </div>
              <div className="bg-white/80 dark:bg-gray-800/80 p-4 rounded-lg">
                <h3 className="font-bold text-lg mb-2">✅ Is there a money-back guarantee?</h3>
                <p className="opacity-90"><strong>30-day money-back guarantee.</strong> If Premium isn't worth 10x the price to you in the first month, email us and we'll refund you immediately.</p>
              </div>
              <div className="bg-white/80 dark:bg-gray-800/80 p-4 rounded-lg">
                <h3 className="font-bold text-lg mb-2">🎓 Is this content beginner-friendly?</h3>
                <p className="opacity-90">Yes. Whether you're new to AI or an experienced practitioner, Alex and Jessica break down complex topics into clear, actionable insights. Beginners get up to speed fast; experts get advanced frameworks.</p>
              </div>
              <div className="bg-white/80 dark:bg-gray-800/80 p-4 rounded-lg">
                <h3 className="font-bold text-lg mb-2">⏰ How much time do I need to invest?</h3>
                <p className="opacity-90">Each episode is 15-25 minutes. Most members watch 1-2 episodes per week (30-50 min/week). The transcripts let you skim and jump to relevant sections if you're short on time.</p>
              </div>
            </div>
          </Section>
        </PanelWrapper>

        {/* Subscribe CTA #2 - URGENT */}
        <div className="bg-gradient-to-br from-cyan-700 to-blue-700 text-white text-center py-10 px-6 rounded-xl my-6 shadow-2xl">
          <h2 className="text-3xl font-bold mb-3">⚡ Ready to Level Up Your AI Knowledge?</h2>
          <p className="text-xl mb-4">First month: <span className="line-through opacity-70">$4.99</span> <span className="text-yellow-300 font-bold text-2xl">$0.99</span></p>
          <p className="mb-6 text-lg">Then $4.99/month • Cancel anytime • 30-day money-back guarantee</p>
          <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg mb-6 inline-block">
            <p className="text-sm mb-1">⏰ <strong>Limited Time Offer</strong></p>
            <p className="text-sm">Only <strong className="text-yellow-300">48 spots left</strong> at this price</p>
          </div>
          <div className="max-w-md mx-auto">
            <StripeBuyButton location="cta_after_faq" />
          </div>
          <p className="text-xs mt-4 opacity-75 flex items-center justify-center gap-1">
            Secure checkout powered by <StripeLogo />
          </p>
        </div>

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

        {/* Premium Content Gate - Dark */}
        {hasAccess && (
          <PanelWrapper variant="dark">
            <Section
              id="premium-content"
              title="AI Deep Dive Premium"
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
        )}
      </div>

      <Footer />
    </main>
  )
}
