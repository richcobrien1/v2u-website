'use client'

import { useState } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Section from '@/components/Section'
import BannerMarquee from '@/components/BannerMarquee'
import Link from 'next/link'
import CTAButton from '@/components/CTAButton'
import PodcastDirectory from '@/components/PodcastDirectory'
import PanelWrapper from '@/components/PanelWrapper'

export default function Page() {
  const [bannerMessage, setBannerMessage] = useState<string | undefined>()

  const loggedIn = true
  const firstName = 'Welcome'
  const avatar = '🟡'

  const TEAL_LIGHT = '#0F8378FF'
  // const TEAL_DARK = '#006258FF'
  const TEAL_SEAM = '#015451FF'
  const MATTE_BLACK = '#212121ff'
  const MATTE_WHITE = '#dfdfdfff'

  // interface SectionItem {
  //   title: string
  //   body: string
  //   cta?: {
  //     label: string
  //     href?: string
  //     onClick?: () => void
  //     iconRight?: React.ReactNode
  //   }
  //   variant: 'dark' | 'light'
  //   reverse?: boolean
  //   background?: {
  //     from: string
  //     to: string
  //     angle?: number
  //   }
  // }

  // const sections: SectionItem[] = [
  //   {
  //     title: 'Topic One',
  //     body: 'Detailed description for topic one goes here...',
  //     cta: { label: 'Learn More About Topic One', href: '#topic-one' },
  //     variant: 'dark',
  //   },
  //   {
  //     title: 'Topic Two',
  //     body: 'An overview of topic two...',
  //     cta: { label: 'Explore Topic Two', href: '#topic-two' },
  //     variant: 'light',
  //   },
  //   {
  //     title: 'Topic Three',
  //     body: 'Insights into topic three...',
  //     cta: { label: 'Discover Topic Three', href: '#topic-three' },
  //     variant: 'dark',
  //   },
  //   {
  //     title: 'Topic Four',
  //     body: 'A brief on topic four...',
  //     cta: { label: 'View Topic Four', href: '#topic-four' },
  //     variant: 'light',
  //   },
  // ]

  const handleBannerComplete = () => {
    setBannerMessage('')
  }

  return (
    <main className="w-full h-auto pt-[48px] bg-[var(--site-bg)] text-[var(--site-fg)]">
      <Header loggedIn={loggedIn} firstName={firstName} avatar={avatar} />

      {bannerMessage && (
        <div className="relative w-full h-[48px] overflow-hidden">
          <Section
            variant="dark"
            title=""
            background={{ from: TEAL_LIGHT, to: TEAL_SEAM }} body={''}          >
            <BannerMarquee
              message={bannerMessage}
              onMessageComplete={handleBannerComplete}
              height={48}
            />
          </Section>
        </div>
      )}

      <div className="px-4 md:px-4 space-y-4">
        <div className="rounded-xl bg-[#212121ff] p-4 mb-4">
          <Section
            variant="dark"
            title="what is v2u?"
            body="At v2u (stands for Virtual to You), we empower individuals and businesses with 
              innovative AI education, digital solutions, and strategic innovations. 
              From AI-driven learning resources to blockchain-powered logistics and 
              automation consulting, we create tools that enhance productivity, 
              creativity, and connectivity in an evolving digital landscape."
            background={{ from: TEAL_LIGHT, to: MATTE_BLACK }}
          >
            <div>
              <h4 className="mb-3 mt-8 text-lg font-semibold">On The House</h4>
              <ul className="space-y-2 text-white/90">
                <li><Link href="#ai-now" className="hover:text-white">AI-Now Podcast</Link></li>
                <li><Link href="#traffic-jamz" className="hover:text-white">Jamz</Link></li>
              </ul>
              <h4 className="mb-3 mt-8 text-lg font-semibold">Premium</h4>
              <ul className="space-y-2 text-white/90">
                <li><Link href="#ai-now-educate" className="hover:text-white">AI-Now-Educate</Link></li>
                <li><Link href="#ai-now-commercial" className="hover:text-white">AI-Now-Commercial</Link></li>
                <li><Link href="#ai-now-conceptual" className="hover:text-white">AI-Now-Conceptual</Link></li>
              </ul>
              <h4 className="mb-3 mt-8 text-lg font-semibold">Active Projects</h4>
              <ul className="space-y-2 text-white/90">
                <li><Link href="#safe-shipping" className="hover:text-white">SafeShipping</Link></li>
                <li><Link href="#traffic-jamz" className="hover:text-white">TrafficJamz</Link></li>
                <li><Link href="#meals-on-demand" className="hover:text-white">MealsOnDemand</Link></li>
              </ul>
            </div>
          </Section>
        </div>

        <div className="rounded-xl bg-[#dfdfdfff] text-black p-6">
          <Section
            id="why-v2u"
            variant="light"
            title=""
            body=""
            background={{ from: TEAL_LIGHT, to: MATTE_WHITE }}
          >
            <div>
              <h4 className="mb-3 mt-8 text-lg font-semibold">Why v2u?</h4>
              <p>v2u is fully immersive in who we are and what we do. 
                We don&apos;t just create platforms and applications and automation, 
                we use AI to create and manage our own businesses.
                Our leading edge knowledge and hands-on experience allows us to 
                provide practical, effective solutions that are tailored to 
                common and unique needs.
              </p>
              <h4 className="mb-3 mt-8 text-lg font-semibold">Why now?</h4>
              <p>AI (Technology) is advancing at a blistering pace and 
                we understand the challenges and opportunities that come 
                with integrating AI into everyday activities because we live it. 
                We don&apos;t just publish news and trends 
                we have AI analyze and summarize the most important 
                information for us to share with you. 
                Grow with v2u and benefit from our 
                deep expertise and commitment to 
                your education, your transformation, your success.</p>
            </div>
          </Section>
        </div>

        <div id="ai-now" className="rounded-xl p-6 bg-[#212121ff] text-white">
          <PodcastDirectory />

          {/* Testimonials Panel - Dark */}
          <PanelWrapper variant="dark">
            <Section
              id="testimonials"
              title="What Our Subscribers Say"
              variant="dark"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-inherit opacity-80">
                <div className="bg-white/10 p-4 rounded-lg">
                  “I am kind of amused that an ai recommended an ai created podcast to me. 😂 Very interesting content though!.”
                </div>
                <div className="bg-white/10 p-4 rounded-lg">
                  “Yeah, it’s great that this episode touched on the AI image generation race between Seedream 4.0 and Nano Banana — it’s definitely one of the hottest topics right now.”
                </div>
              </div>
            </Section>
          </PanelWrapper>
        </div>

        <div id="ai-now-educate" className="rounded-xl p-6 bg-[#dfdfdfff] text-black">
          <Section
            variant="light"
            title="NEW Premium AI-Now-Educate"
            body="Join Alex and Jessica weekly as they cut through the noise in 
              conversations, podcasts, seminars, and publications, breaking down 
              the best AI tools and strategies into layman's terms. 
              For less than a cup of coffee per month get the latest only the 
              top 1% use right now. 
              Subscribe, tune-in, get educated and empowered with AI Now Educate."
            background={{ from: TEAL_SEAM, to: MATTE_BLACK }}
          >
            <iframe
              className="block w-full h-full min-h-[600px] rounded-xl shadow-lg mb-6"
              src="https://www.youtube.com/embed/X5kvtBmvR1Q?si=v0kg4xAUUiSWT0KD"
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
            <CTAButton
              label="Learn More About Premium Content"
              href="/subscribe"
              variant="light"
              iconRight="🔒"
            />
          </Section>
        </div>

        <div id="traffic-jamz" className="rounded-xl p-6 bg-[#212121ff] text-white">
          <Section
            variant="dark"
            title="Jamz"
            body="Jamz is a web, iPhone, Android app that connects to TrafficJamz 
              service platform that provides a group of subscribed-connected active 
              group users with audio communications including music to be able in 
              real-time hear and speak to each other anytime. Plus real-time location 
              service so they can track where each other is at any time. An example 
              use case is a group of skiers who can talk and listen to music together 
              as a group and anywhere they are on the mountain."
            background={{ from: TEAL_SEAM, to: MATTE_BLACK }}
          >
            <CTAButton
              label="Learn More"
              href="/trafficjamz"
              variant="dark"
              iconRight="➡️"
            />
          </Section>
        </div>

        <div id="ai-now-commercial" className="rounded-xl p-6 bg-[#212121ff] text-white">
          <Section
            variant="dark"
            title="NEW Premium AI-Now-Commercial"
            body="For businesses ready to leverage AI for competitive advantage, 
              AI-Now-Commercial offers in-depth analysis of the latest AI tools, 
              strategies, and case studies. 
              Stay ahead of the curve with insights tailored for commercial success.
              Subscribe now to transform your business with AI."
            background={{ from: TEAL_SEAM, to: MATTE_BLACK }}
          />
        </div>

        <div id="ai-now-conceptual" className="rounded-xl p-6 bg-[#dfdfdfff] text-black">
          <Section
            variant="light"
            title="NEW Premium AI-Now-Conceptual"
            body="Dive deep into the philosophical, ethical, and societal implications of AI with AI-Now-Conceptual.
              Explore thought-provoking discussions and analyses that challenge conventional perspectives.
              Subscribe now to engage with the future of AI and its impact on humanity."
            background={{ from: TEAL_SEAM, to: MATTE_BLACK }}
          />
        </div>

        <div id="safe-shipping" className="rounded-xl p-6 bg-[#212121ff] text-white">
          <Section
            variant="dark"
            title="SafeShipping"
            body="SafeShipping is a next-generation logistics platform built to simplify and secure global shipping. Whether you're a small business or a large-scale distributor, SafeShipping helps you move goods faster, safer, and more transparently — all powered by breakthrough technology."
            background={{ from: TEAL_SEAM, to: MATTE_BLACK }}
          >
            <CTAButton
              label="Learn More"
              href="/safeshipping"
              variant="dark"
              iconRight="➡️"
            />
          </Section>
        </div>

        <div id="traffic-jamz" className="rounded-xl p-6 bg-[#dfdfdf] text-black">
          <Section
            variant="light"
            title="Jamz/TrafficJamz"
            body="Jamz is a web, iPhone, Android app that connects to TrafficJamz service platform that provides a group of subscribed-connected active group users with audio communications including music to be able in real-time hear and speak to each other anytime. Plus real-time location service so they can track where each other is at any time. An example use case is a group of skiers who can talk and listen to music together as a group and anywhere they are on the mountain."
            background={{ from: TEAL_SEAM, to: MATTE_BLACK }}
          >
            <CTAButton
              label="Learn More"
              href="/trafficjamz"
              variant="light"
              iconRight="➡️"
            />
          </Section>
        </div>

        <div id="meals-on-demand" className="rounded-xl p-4 mb-4 bg-[#212121ff] text-white">
          <Section
            variant="dark"
            title="MealsOnDemand"
            body="Meals-on-Demand offers a modern solution to a growing problem faced by coworking 
              professionals: the lack of fast, nutritious meal options that support productivity. Through 
              dual-zone vending machines that store and heat premium frozen meals in under 90 
              seconds, this turnkey system enhances coworking spaces by improving member 
              satisfaction, boosting productivity, and unlocking new revenue streams. This marketing 
              plan outlines strategies to attract co-working space operators and investors, positioning 
              Meals-on-Demand as a must-have addition to modern coworking environments."
            background={{ from: TEAL_SEAM, to: MATTE_BLACK }}
          >
            <CTAButton
              label="Learn More"
              href="/mealsondemand"
              variant="dark"
              iconRight="➡️"
            />
          </Section>
        </div>

        {/* {sections.map((s, idx) => {
          const id = slugify(s.title)
          return (
            <Section
              key={id}
              id={id}
              variant={s.variant}
              reverse={s.reverse ?? idx % 2 === 1}
              title={s.title}
              body={s.body}
              background={s.background}
              rounded={true} // if you want rounded corners
            >
              {s.cta && (
                <CTAButton
                  label={s.cta.label}
                  href={s.cta.href}
                  onClick={s.cta.onClick}
                  iconRight={s.cta.iconRight}
                  variant={s.variant}
                  className="mt-6"
                />
              )}
            </Section>
          )
        })} */}

        {/* <div id="black-matte-panel" className="rounded-xl bg-[#212121ff] text-white p-4 mb-4">
          <Section
            variant="dark"
            title="Black Matte Panel"
            body="Sample Black Matte Panel #212121ff"
            background={{ from: MATTE_BLACK, to: TEAL_DARK }}
          />
        </div>

        <div id="white-matte-panel" className="rounded-xl bg-[#dfdfdfff] text-black p-4 mb-4">
          <Section
            variant="light"
            title="White Matte Panel"
            body="Sample White Matte Panel #dfdfdfff"
            background={{ from: TEAL_LIGHT, to: MATTE_BLACK }}
          />
        </div> */}
      </div>

      <Footer />
    </main>
  )
}