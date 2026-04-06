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
    <span className={`inline-flex items-center align-middle px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-yellow-400 to-yellow-600 text-black ${className ?? 'ml-3'}`}>
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
          
      <div className="page-content">
        {/* Hero Section - Redesigned for engagement */}
        <div className="relative min-h-[600px] rounded-xl overflow-hidden mb-4"
            style={{
              backgroundImage: 'url(/v2u-premium.jpg)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
        >
          {/* Dynamic gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/60 to-emerald-900/50"></div>
          
          <div className="relative z-10 max-w-7xl mx-auto px-6 py-16">
            {/* Main Hero Content */}
            <div className="max-w-4xl">
              <div className="inline-block mb-4 px-4 py-2 bg-emerald-500/20 backdrop-blur-sm rounded-full border border-emerald-400/30">
                <span className="text-emerald-300 text-sm font-medium">AI That Actually Works In The Real World</span>
              </div>
              
              <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 leading-tight">
                Building the Future<br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                  One AI Innovation at a Time
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed">
                v2u is where visionary AI innovation transforms dreams into reality. 
                We&apos;re builders, entrepreneurs, and passionate creators running real businesses 
                with AI at their core—empowering you to unlock your potential and shape your future.
              </p>

              {/* Key Differentiators */}
              <div className="grid md:grid-cols-3 gap-4 mb-10">
                <Link href="/projects" className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20 hover:bg-white/20 transition-all cursor-pointer">
                  <div className="mb-2">
                    <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="text-white font-semibold mb-1">8+ Active AI Projects</h3>
                  <p className="text-white/70 text-sm">Real applications solving real problems</p>
                </Link>
                <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20">
                  <div className="mb-2">
                    <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                  </div>
                  <h3 className="text-white font-semibold mb-1">Daily AI Insights</h3>
                  <p className="text-white/70 text-sm">Free podcast breaking down what matters</p>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20">
                  <div className="mb-2">
                    <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <h3 className="text-white font-semibold mb-1">Practical Education</h3>
                  <p className="text-white/70 text-sm">Learn from real-world experience</p>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-4">
                <Link 
                  href="#ai-deep-dive" 
                  className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50"
                >
                  Listen to Daily Podcast
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
                <Link 
                  href="#why-v2u" 
                  className="inline-flex items-center px-8 py-4 bg-white/10 backdrop-blur-md text-white font-semibold rounded-lg hover:bg-white/20 transition-all border border-white/30"
                >
                  Learn More About v2u
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </Link>
              </div>
            </div>

            {/* Quick Links Grid - Bottom Section */}
            <div className="mt-16 grid md:grid-cols-2 gap-8">
              {/* Free Content */}
              <div className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
                <div className="flex items-center gap-3 mb-4">
                  <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.536a5 5 0 001.414 1.414m2.828-9.9a9 9 0 012.828-1.414" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v.01M12 16v.01" />
                  </svg>
                  <h3 className="text-2xl font-bold text-white">Free Daily Podcast</h3>
                </div>
                <p className="text-white/80 mb-4">Join Alex and Jessica for daily insights into AI and technology</p>
                <Link href="#ai-deep-dive" className="text-emerald-400 hover:text-emerald-300 font-medium inline-flex items-center">
                  Start Listening
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>

              {/* Premium Content */}
              <div className="bg-gradient-to-br from-yellow-900/30 to-yellow-800/20 backdrop-blur-md rounded-xl p-6 border border-yellow-500/30">
                <div className="flex items-center gap-2 mb-4">
                  <svg className="w-8 h-8 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                  <h3 className="text-2xl font-bold text-white">Premium Content</h3>
                  <PremiumPill className="ml-0" />
                </div>
                <p className="text-white/80 mb-4">Deep-dive education, reviews, reports, and commercial insights</p>
                <Link href="#ai-deep-dive-premium" className="text-yellow-400 hover:text-yellow-300 font-medium inline-flex items-center">
                  Explore Premium
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>

            {/* Active Projects Footer */}
            <div className="mt-8 bg-black/30 backdrop-blur-sm rounded-lg p-6 border border-white/10">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-white font-semibold flex items-center gap-2">
                  <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  Active AI-Powered Projects
                </h4>
                <Link 
                  href="/projects" 
                  className="text-emerald-400 hover:text-emerald-300 font-medium text-sm inline-flex items-center gap-1 transition-colors"
                >
                  View All Projects
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link href="#safe-shipping" className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full text-white/90 hover:text-white text-sm transition-all border border-white/20">SafeShipping</Link>
                <Link href="#traffic-jamz" className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full text-white/90 hover:text-white text-sm transition-all border border-white/20">TrafficJamz</Link>
                <Link href="#chronosai" className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full text-white/90 hover:text-white text-sm transition-all border border-white/20">ChronosAI <span className="text-xs opacity-60">Patent Pending</span></Link>
                <Link href="#nexoai" className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full text-white/90 hover:text-white text-sm transition-all border border-white/20">NexoAI</Link>
                <Link href="#trajectoryai" className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full text-white/90 hover:text-white text-sm transition-all border border-white/20">TrajectoryAI</Link>
                <Link href="#cortexai" className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full text-white/90 hover:text-white text-sm transition-all border border-white/20">CortexAI</Link>
                <Link href="#hirewire" className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full text-white/90 hover:text-white text-sm transition-all border border-white/20">HireWire</Link>
                <Link href="#meals-on-demand" className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full text-white/90 hover:text-white text-sm transition-all border border-white/20">MealsOnDemand</Link>
              </div>
            </div>
          </div>
        </div>
        
      {/* Why v2u Section - Enhanced */}
      <div id="why-v2u" className="scroll-mt-16 rounded-xl overflow-hidden mb-4">
        <div className="bg-gradient-to-br from-emerald-900 to-teal-800 p-8 md:p-12">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Why v2u?
              </h2>
              <div className="w-24 h-1 bg-emerald-400 mx-auto rounded-full"></div>
            </div>

            {/* AI-Generated Badge */}
            <div className="mb-12 bg-gradient-to-r from-purple-900/40 to-pink-900/40 backdrop-blur-md rounded-2xl p-8 border-2 border-purple-400/30 shadow-2xl">
              <div className="flex items-center justify-center gap-3 mb-4">
                <svg className="w-12 h-12 md:w-16 md:h-16 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                </svg>
                <h3 className="text-3xl md:text-4xl font-bold text-white">
                  100% AI-Powered Innovation
                </h3>
              </div>
              <p className="text-white/95 text-lg md:text-xl leading-relaxed text-center max-w-4xl mx-auto">
                Everything you see here—the innovative ideas, groundbreaking projects, daily podcasts with Alex and Jessica, 
                and every application we build—is entirely AI-generated. The v2u team harnesses advanced AI to conceive, 
                design, develop, and deploy real-world solutions. We don&apos;t just talk about AI&apos;s potential; 
                we prove it every single day by building the future with AI at our core.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              {/* We Live It */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <svg className="w-10 h-10 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-3">Living AI Every Day</h3>
                    <p className="text-white/90 leading-relaxed">
                      v2u is fully immersive in who we are and what we do. We create platforms, 
                      build applications, and use AI to power real businesses every single day. 
                      Our hands-on experience gives you proven strategies that drive real success.
                    </p>
                  </div>
                </div>
              </div>

              {/* Real-World Testing */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <svg className="w-10 h-10 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-3">Proven Success Strategies</h3>
                    <p className="text-white/90 leading-relaxed">
                      Every tool, strategy, and insight we share has been proven in our own operations. 
                      We know what works because we&apos;ve discovered the breakthroughs, perfected the solutions, 
                      and refined winning processes that deliver results.
                    </p>
                  </div>
                </div>
              </div>

              {/* Always Current */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <svg className="w-10 h-10 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-3">Always Leading Edge</h3>
                    <p className="text-white/90 leading-relaxed">
                      AI evolves at lightning speed, and we keep you at the forefront. Our AI-powered 
                      analysis brings you the most important breakthroughs in digestible insights, 
                      so you stay ahead with clarity and confidence.
                    </p>
                  </div>
                </div>
              </div>

              {/* Your Success */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <svg className="w-10 h-10 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-3">Your Success is Our Purpose</h3>
                    <p className="text-white/90 leading-relaxed">
                      We&apos;re dedicated to empowering your journey with practical AI knowledge that 
                      unlocks extraordinary results. Whether you&apos;re discovering AI fundamentals or 
                      implementing advanced automation, we&apos;re your partner in achieving your dreams.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom CTA */}
            <div className="text-center bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl p-8">
              <h3 className="text-2xl font-bold text-white mb-3">
                Ready to Unlock Your AI Potential?
              </h3>
              <p className="text-white/90 mb-6 text-lg">
                Join thousands discovering how practical AI can transform your future and amplify your success.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link 
                  href="/subscribe" 
                  className="inline-flex items-center px-8 py-4 bg-white text-emerald-600 font-bold rounded-lg hover:bg-gray-100 transition-all shadow-lg"
                >
                  Get Premium Access
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                <Link 
                  href="#ai-deep-dive" 
                  className="inline-flex items-center px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-lg hover:bg-white/20 transition-all border-2 border-white/30"
                >
                  Start with Free Content
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

        <div id="ai-deep-dive" className="scroll-mt-16 rounded-xl p-6 bg-[#212121ff] text-white">
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

        <div id="ai-deep-dive-premium" className="scroll-mt-16 rounded-xl p-6 bg-[#212121ff] text-white">
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
                  title="AI Deep Dive Premium Content Dashboard"
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
              iconRight={<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>}
            />
          </Section>
        </div>

        <div id="ai-deep-dive-educate" className="scroll-mt-16 rounded-xl p-6 bg-[#dfdfdfff] text-black">
          <Section
            variant="light"
            title={<><span>NEW Premium AI Deep Dive Educate</span><PremiumPill>Premium</PremiumPill></>}
            body="Join Alex and Jessica weekly as they cut through the noise in 
              conversations, podcasts, seminars, and publications, breaking down 
              the best AI tools and strategies into layman's terms. 
              For less than a cup of coffee per month get the latest only the 
              top 1% use right now. 
              Subscribe, tune-in, get educated and empowered with AI Deep Dive Educate."
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
              iconRight={<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>}
            />
          </Section>
        </div>

        <div id="ai-deep-dive-reviews" className="scroll-mt-16 rounded-xl p-6 bg-[#015451FF] text-white">
          <Section
            title={<><PremiumPill className="mr-3"/> <span>AI Deep Dive Reviews and Report</span></>}
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
            title={<><PremiumPill className="mr-3"/> <span>AI Deep Dive Commercial</span></>}
            body="For businesses ready to leverage AI for competitive advantage, 
              AI Deep Dive Commercial offers in-depth analysis of the latest AI tools, 
              strategies, and case studies. 
              Stay ahead of the curve with insights tailored for commercial success.
              Subscribe now to transform your business with AI."
            className="text-white"
          />
          <Section
            title={<><PremiumPill className="mr-3"/> <span>AI Deep Dive Conceptual</span></>}
            body="Dive deep into the philosophical, ethical, and societal implications of AI with AI Deep Dive Conceptual.
              Explore thought-provoking discussions and analyses that challenge conventional perspectives.
              Subscribe now to engage with the future of AI and its impact on humanity."
            className="text-white"
          >

            <CTAButton
              label="Learn More About Premium Content"
              href="/subscribe"
              variant="dark"
              iconRight={<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>}
            />
          </Section>
        </div>
        
        <div id="safe-shipping" className="scroll-mt-16 rounded-xl p-6 bg-[#212121ff] text-white">
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

        <div id="traffic-jamz" className="scroll-mt-16 rounded-xl p-6 bg-[#dfdfdf] text-black">
          <Section
            variant="light"
            title={
              <div className="flex items-center gap-3">
                <Image 
                  src="/Jamz-sking.png" 
                  alt="TrafficJamz Logo" 
                  width={32} 
                  height={32} 
                  className="object-contain"
                />
                <span>TrafficJamz</span>
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

        <div id="chronosai" className="scroll-mt-16 rounded-xl p-6 bg-[#212121ff] text-white">
          <Section
            variant="dark"
            title={
              <div className="flex items-center gap-3">
                <Image 
                  src="/ChronosAI_Consumer.png" 
                  alt="ChronosAI Logo" 
                  width={40} 
                  height={40} 
                  className="object-contain rounded"
                />
                <span>ChronosAI <span className="text-sm opacity-75 font-normal">Patent Pending</span></span>
              </div>
            }
            body="Advanced AI-powered 3D modeling platform with three specialized tiers: ChronosAI for hobbyists and makers, ChronosAI Commercial for businesses and professionals, and ChronosAI Industrial/Aerospace for enterprise-grade manufacturing. Each tier offers tailored features for different markets, security levels, materials, and production requirements."
          >
            <CTAButton
              label="Learn More"
              href="/chronosai"
              variant="dark"
              iconRight="➡️"
            />
          </Section>
        </div>

        <div id="nexoai" className="scroll-mt-16 rounded-xl p-6 bg-[#dfdfdf] text-black">
          <Section
            variant="light"
            title={
              <div className="flex items-center gap-3">
                <Image 
                  src="/NexoAI_Company_Products.png" 
                  alt="NexoAI Logo" 
                  width={40} 
                  height={40} 
                  className="object-contain rounded"
                />
                <span>NexoAI</span>
              </div>
            }
            body="AI-powered service business automation platform. Multi-tenant platform with comprehensive CRM, scheduling, invoicing, and team management. Supports electricians, plumbers, HVAC, landscaping, and more. Available across Web, Mobile (iOS/Android), and Desktop platforms with real-time synchronization."
          >
            <CTAButton
              label="Learn More"
              href="/nexoai"
              variant="light"
              iconRight="➡️"
            />
          </Section>
        </div>

        <div id="trajectoryai" className="scroll-mt-16 rounded-xl p-6 bg-[#212121ff] text-white">
          <Section
            variant="dark"
            title={
              <div className="flex items-center gap-3">
                <Image 
                  src="/TrajectoryAI_Personal.png" 
                  alt="TrajectoryAI Logo" 
                  width={40} 
                  height={40} 
                  className="object-contain rounded"
                />
                <span>TrajectoryAI</span>
              </div>
            }
            body="Intelligent goal tracking and achievement platform. Create, track, adjust, and achieve your goals in personal, professional, and financial areas. Features AI-powered insights, adaptive tracking, milestone management, and progress analytics to keep you on your path to success."
          >
            <CTAButton
              label="Learn More"
              href="/trajectoryai"
              variant="dark"
              iconRight="➡️"
            />
          </Section>
        </div>

        <div id="cortexai" className="scroll-mt-16 rounded-xl p-6 bg-[#dfdfdf] text-black">
          <Section
            variant="light"
            title={
              <div className="flex items-center gap-3">
                <Image 
                  src="/CortexAI_Personal.svg" 
                  alt="CortexAI Logo" 
                  width={40} 
                  height={40} 
                  className="object-contain rounded"
                />
                <span>CortexAI</span>
              </div>
            }
            body="Military-grade personal property management system for comprehensive asset tracking and intelligence. Manage intellectual property, real assets, digital assets, estate planning, and legal documents with RAG-powered search, AI forecasting, and ITAR-compliant security. Features renewal alerts, market monitoring, and geopolitical risk analysis."
          >
            <CTAButton
              label="Learn More"
              href="#cortexai"
              variant="light"
              iconRight="➡️"
            />
          </Section>
        </div>

        <div id="hirewire" className="scroll-mt-16 rounded-xl p-6 bg-[#212121ff] text-white">
          <Section
            variant="dark"
            title="HireWire"
            body="AI-powered recruitment platform transforming talent acquisition. Features intelligent candidate matching, automated resume screening, skills-based assessments, video interview scheduling, and collaborative hiring workflows. Connect employers with top talent through data-driven insights and personalized job recommendations for both recruiters and candidates."
          >
            <CTAButton
              label="Learn More"
              href="/hirewire"
              variant="dark"
              iconRight="➡️"
            />
          </Section>
        </div>

        <div id="meals-on-demand" className="scroll-mt-16 rounded-xl p-4 mb-4 bg-[#212121ff] text-white">
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