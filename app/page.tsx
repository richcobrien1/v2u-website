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
import Image from 'next/image'

export default function Page() {
  const [bannerMessage, setBannerMessage] = useState<string | undefined>()

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

  const PremiumPill = ({ children, className }: { children?: React.ReactNode; className?: string }) => (
    <span className={`inline-flex items-center align-middle px-2 py-0.5 rounded-full text-xs font-medium bg-linear-to-r from-yellow-400 to-yellow-600 text-black ${className ?? 'ml-3'}`}>
      {children ?? 'Premium'}
    </span>
  )

  return (
    <main className="w-full h-auto pt-[60px] bg-(--site-bg) text-(--site-fg)">
      <Header />

      {bannerMessage && (
        <div className="relative w-full h-12 overflow-hidden">
          <Section
            variant="dark"
            title=""
            body={''}
          >
            <BannerMarquee
              message={bannerMessage}
              onMessageComplete={handleBannerComplete}
              height={48}
            />
          </Section>
        </div>
      )}
          
      <div className="px-4 md:px-4 space-y-4">
        <div className="relative min-h-[400px] rounded-xl overflow-hidden -mt-4 mb-4"
            style={{
              backgroundImage: 'url(/v2u-premium.jpg)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
        >
  {/* Lighter gradient overlay for better image visibility */}
  <div className="absolute inset-0 bg-linear-to-b from-black/50 to-black/80">
  </div>
          <Section
            title=""
            body=""
            className="bg-black/30"
          >
            
            <div className="relative z-10">             
              <h1 className="mb-3 mt-8 text-5xl font-semibold text-white">Empower Your Future</h1>
              <ul className="space-y-2 text-white">
                <li className="text-3xl text-white">AI Education, Digital Solutions, Strategic Innovations</li>
              </ul>
              <h4 className="mb-3 mt-8 text-lg font-semibold text-white">On The House Daily Podcasts</h4>
              <ul className="space-y-2 text-white/90">
                <li><Link href="#ai-now" className="hover:text-white">AI-Now Daily Deep Dive with Alex and Jessica</Link></li>
              </ul>
              <h4 className="mb-3 mt-8 text-lg font-semibold text-white hover:text-white"><Link href="#ai-now-premium" className="hover:text-white">AI-Now Premium Content</Link><PremiumPill>Premium</PremiumPill></h4>
              <ul className="space-y-2 text-white/90">
                <li><Link href="#ai-now-educate" className="hover:text-white">AI-Now-Educate</Link></li>
                <li><Link href="#ai-now-reviews" className="hover:text-white">AI-Now-Reviews and Reports</Link></li>
                <li><Link href="#ai-now-reviews" className="hover:text-white">AI-Now-Commercial</Link></li>
                <li><Link href="#ai-now-reviews" className="hover:text-white">AI-Now-Conceptual</Link></li>
              </ul>
              <h4 className="mb-3 mt-8 text-lg font-semibold text-white">Active Projects</h4>
              <ul className="space-y-2 text-white/90">
                <li><Link href="#safe-shipping" className="hover:text-white">SafeShipping</Link></li>
                <li><Link href="#traffic-jamz" className="hover:text-white">Jamz / TrafficJamz</Link></li>
                <li><Link href="#slicer" className="hover:text-white">Slicer</Link></li>
                <li><Link href="#hirewire" className="hover:text-white">HireWire</Link></li>
                <li><Link href="#meals-on-demand" className="hover:text-white">MealsOnDemand</Link></li>
              </ul>
            </div>
          </Section>          
        </div>
        
        <div className="rounded-xl p-6 bg-[#015451FF]">
          <Section
            id="why-v2u"
            title=""
            body=""
            rounded={true}
            className="text-white"
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

        <div id="ai-now-premium" className="rounded-xl p-6 bg-[#212121ff] text-white">
            <Section
            variant="dark"
            title={
              <div className="flex items-center gap-3">
                <span>Premium Content</span>
                <PremiumPill>Premium</PremiumPill>
              </div>
            }
            body="Stay ahead in the rapidly evolving AI landscape with our
              in-depth reviews and comprehensive reports. 
              Our expert analysis covers the latest AI tools, technologies,
              and trends, providing you with actionable insights to 
              leverage AI for personal and professional growth. 
              Subscribe now to access exclusive content that empowers you 
              to make informed decisions in the world of AI."
          >
          
            <div className="w-full mb-6">
              <div className="relative w-full h-full">
                <iframe
                  src="https://www.v2u.us/podcast-dashboard/"
                  title="AI-Now Premium Content Dashboard"
                  className="w-full h-full min-h-[600px] rounded-lg"
                  frameBorder="0"
                  loading="lazy"
                />
              </div>
            </div>

            <CTAButton
              label="Learn More About Premium Content"
              href="/subscribe"
              variant="dark"
              iconRight="🔒"
            />
          </Section>
        </div>

        <div id="ai-now-educate" className="rounded-xl p-6 bg-[#dfdfdfff] text-black">
          <Section
            variant="light"
            title={<><span>NEW Premium AI-Now-Educate</span><PremiumPill>Premium</PremiumPill></>}
            body="Join Alex and Jessica weekly as they cut through the noise in 
              conversations, podcasts, seminars, and publications, breaking down 
              the best AI tools and strategies into layman's terms. 
              For less than a cup of coffee per month get the latest only the 
              top 1% use right now. 
              Subscribe, tune-in, get educated and empowered with AI Now Educate."
          >
            <iframe
              className="block w-full h-full min-h-[600px] rounded-xl mb-6"
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

        <div id="ai-now-reviews" className="rounded-xl p-6 bg-[#015451FF] text-white">
          <Section
            title={<><PremiumPill className="mr-3"/> <span>AI-Now-Reviews and Report</span></>}
            body="Stay ahead in the rapidly evolving AI landscape with our
              in-depth reviews and comprehensive reports. 
              Our expert analysis covers the latest AI tools, technologies,
              and trends, providing you with actionable insights to 
              leverage AI for personal and professional growth. 
              Subscribe now to access exclusive content that empowers you 
              to make informed decisions in the world of AI."
            className="text-white"
          >
          </Section>

          <Section
            title={<><PremiumPill className="mr-3"/> <span>AI-Now-Commercial</span></>}
            body="For businesses ready to leverage AI for competitive advantage, 
              AI-Now-Commercial offers in-depth analysis of the latest AI tools, 
              strategies, and case studies. 
              Stay ahead of the curve with insights tailored for commercial success.
              Subscribe now to transform your business with AI."
            className="text-white"
          />
          <Section
            title={<><PremiumPill className="mr-3"/> <span>AI-Now-Conceptual</span></>}
            body="Dive deep into the philosophical, ethical, and societal implications of AI with AI-Now-Conceptual.
              Explore thought-provoking discussions and analyses that challenge conventional perspectives.
              Subscribe now to engage with the future of AI and its impact on humanity."
            className="text-white"
          >

            <CTAButton
              label="Learn More About Premium Content"
              href="/subscribe"
              variant="dark"
              iconRight="🔒"
            />
          </Section>
        </div>
        
        <div id="safe-shipping" className="rounded-xl p-6 bg-[#212121ff] text-white">
          <Section
            variant="dark"
            title={
              <div className="flex items-center gap-3">
                <Image 
                  src="/Copilot_20250705_092407.png" 
                  alt="SafeShipping Logo" 
                  width={32} 
                  height={32} 
                  className="object-contain"
                />
                <span>SafeShipping</span>
              </div>
            }
            body="SafeShipping is a next-generation logistics platform built to simplify and secure global shipping. Whether you're a small business or a large-scale distributor, SafeShipping helps you move goods faster, safer, and more transparently — all powered by breakthrough technology."
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
            title={
              <div className="flex items-center gap-3">
                <Image 
                  src="/Jamz-sking.png" 
                  alt="SafeShipping Logo" 
                  width={32} 
                  height={32} 
                  className="object-contain"
                />
                <span>Jamz / TrafficJamz</span>
              </div>
            }
            body="Jamz is a web, iPhone, Android app that connects to TrafficJamz service platform that provides a group of subscribed-connected active group users with audio communications including music to be able in real-time hear and speak to each other anytime. Plus real-time location service so they can track where each other is at any time. An example use case is a group of skiers who can talk and listen to music together as a group and anywhere they are on the mountain."
          >

            <CTAButton
              label="Learn More"
              href="/trafficjamz"
              variant="light"
              iconRight="➡️"
            />
          </Section>
        </div>

        <div id="slicer" className="rounded-xl p-6 bg-[#212121ff] text-white">
          <Section
            variant="dark"
            title={
              <div className="flex items-center gap-3">
                <Image 
                  src="/Slicer_Icon.gif" 
                  alt="Slicer Logo" 
                  width={34} 
                  height={38} 
                  className="object-contain rounded"
                />
                <span>Slicer</span>
              </div>
            }
            body="A 3D Model application with AI Capability and output to standard model printers. Slicer harnesses the power of AI for retrieval, modification and output for standard 3d models. Web-based, native apps versions available."
          >
            <CTAButton
              label="Learn More"
              href="/slicer"
              variant="dark"
              iconRight="➡️"
            />
          </Section>
        </div>

        <div id="hirewire" className="rounded-xl p-6 bg-[#dfdfdf] text-black">
          <Section
            variant="light"
            title="HireWire"
            body="HireWire is an innovative recruitment and talent acquisition platform that streamlines the hiring process through intelligent matching algorithms and comprehensive candidate assessment tools. Our platform connects employers with top talent while providing candidates with personalized career opportunities."
          >
            <CTAButton
              label="Learn More"
              href="/hirewire"
              variant="light"
              iconRight="➡️"
            />
          </Section>
        </div>

        <div id="meals-on-demand" className="rounded-xl p-4 mb-4 bg-[#212121ff] text-white">
          <Section
            variant="dark"
            title={
              <div className="flex items-center gap-3">
                <Image 
                  src="/Meal Prep Vending 1.png" 
                  alt="MealsOnDemand Logo" 
                  width={32} 
                  height={32} 
                  className="object-contain"
                />
                <span>MealsOnDemand</span>
              </div>
            }
            body="Meals-on-Demand offers a modern solution to a growing problem faced by coworking 
              professionals: the lack of fast, nutritious meal options that support productivity. Through 
              dual-zone vending machines that store and heat premium chilled (not frozen) meals in under 90 
              seconds, this turnkey system enhances coworking spaces by improving member 
              satisfaction, boosting productivity, and unlocking new revenue streams. This marketing 
              plan outlines strategies to attract co-working space operators and investors, positioning 
              Meals-on-Demand as a must-have addition to modern coworking environments."
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