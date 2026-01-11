'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import CTAButton from '@/components/CTAButton'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Section from '@/components/Section'
import PanelWrapper from '@/components/PanelWrapper'

export default function HireWirePage() {
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

        {/* Promo Panel - Dark */}
        <PanelWrapper variant="dark">
          <Section
            id="promo-banner"
            title="HireWire"
            body="HireWire is an innovative recruitment and talent acquisition platform that streamlines the hiring process through intelligent matching algorithms and comprehensive candidate assessment tools. Our platform connects employers with top talent while providing candidates with personalized career opportunities."
            variant="dark"
          >
            {/* Placeholder for future video/media */}
            {/* <div className="w-full mb-6">
              <div className="relative w-full h-full">
                <video
                  autoPlay
                  loop
                  muted
                  controls
                  className="w-full h-full rounded-lg"
                  poster="/HireWire_Screen.jpg"
                >
                  <source src="/videos/HireWire_Demo.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            </div> */}

            {/* Description Block */}
            <div className="px-4 md:px-4 space-y-4 text-white leading-relaxed">
              <p>
                <strong>HireWire</strong> revolutionizes talent acquisition by combining advanced AI-driven matching with comprehensive candidate evaluation tools. Our platform simplifies the recruitment process for employers while empowering job seekers to find their ideal career opportunities.
              </p>
              <p className="mt-2">
                <strong>Intelligent Candidate Matching:</strong> Our AI algorithms analyze job requirements, company culture, and candidate profiles to create optimal matches. This reduces time-to-hire and improves the quality of placements for both employers and candidates.
              </p>
              <p className="mt-2">
                <strong>Comprehensive Assessment Tools:</strong> Built-in evaluation frameworks help employers make informed hiring decisions through skills assessments, cultural fit analysis, and automated reference checking. Candidates receive personalized feedback to improve their job search success.
              </p>
              <p className="mt-2">
                <strong>Streamlined Workflow:</strong> From job posting to final offer, HireWire manages the entire recruitment pipeline. Automated scheduling, communication tracking, and collaborative decision-making tools ensure a smooth hiring experience for all stakeholders.
              </p>
              <p className="mt-2">
                <strong>Data-Driven Insights:</strong> Access real-time analytics on hiring metrics, market trends, and candidate engagement. Make strategic recruitment decisions based on actionable intelligence and predictive modeling.
              </p>
            </div>

            <CTAButton
              label="Contact Us to Learn More"
              href="mailto:admin@v2u.us?subject=HireWire%20Inquiry&body=Hi%20Team%2C%0A%0AI%20have%20a%20question%20about%20HireWire..."
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
              />
            </Section>
          </PanelWrapper>
        ) : (
          <PanelWrapper variant="light">
            <Section
              id="subscribe-now"
              title="Want Premium Access?"
              body="Subscribe to AI-Now Premium for exclusive content, early access, and more."
              variant="light"
            >
              <CTAButton
                label="Subscribe Now"
                href="/subscribe"
                variant="light"
              />
            </Section>
          </PanelWrapper>
        )}
      </div>

      <Footer />
    </main>
  )
}
