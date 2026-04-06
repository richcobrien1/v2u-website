'use client'
export const dynamic = 'force-dynamic'

import { useEffect } from 'react'
import CTAButton from '@/components/CTAButton'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Section from '@/components/Section'
import PanelWrapper from '@/components/PanelWrapper'

export default function CortexAIPage() {
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

      <div className="page-content">

        {/* CortexAI Main - Dark */}
        <PanelWrapper variant="dark">
          <Section
            id="cortexai-main"
            title="CortexAI - Property & Asset Management"
            body="AI-driven property and asset management platform. Track portfolios, predict maintenance needs, optimize occupancy rates, and automate tenant communications with intelligent automation."
            variant="dark"
          >
            <div className="px-4 md:px-4 space-y-4 text-white leading-relaxed">
              <p>
                <strong>CortexAI</strong> transforms property and asset management with artificial intelligence, predictive analytics, and automation. Our platform consolidates property data, tenant information, and financial metrics into a single intelligent dashboard.
              </p>
              <p className="mt-2">
                <strong>Portfolio Intelligence:</strong> Track multiple properties across different markets with real-time analytics. Monitor occupancy rates, revenue streams, maintenance schedules, and market trends from a unified interface.
              </p>
              <p className="mt-2">
                <strong>Predictive Maintenance:</strong> AI algorithms analyze historical data and usage patterns to predict maintenance needs before issues arise. Schedule proactive repairs, reduce emergency costs, and extend asset lifespans.
              </p>
              <p className="mt-2">
                <strong>Automated Tenant Management:</strong> Streamline tenant communications with AI-powered messaging, automated rent collection, maintenance request routing, and lease renewal notifications. Reduce administrative overhead while improving tenant satisfaction.
              </p>
              <p className="mt-2">
                <strong>Revenue Optimization:</strong> Dynamic pricing recommendations based on market conditions, seasonal trends, and occupancy patterns. Maximize revenue while maintaining competitive positioning.
              </p>
            </div>

            <CTAButton
              label="Request Demo"
              href="mailto:admin@v2u.us?subject=CortexAI%20Demo%20Request&body=Hi%20Team%2C%0A%0AI%20would%20like%20to%20schedule%20a%20demo%20of%20CortexAI..."
              variant="dark"
              className="mt-6"
            />
          </Section>
        </PanelWrapper>

        {/* Features - Light */}
        <PanelWrapper variant="light">
          <Section
            id="cortexai-features"
            title="Key Features"
            variant="light"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white/50 dark:bg-black/30 p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-3">📊 Portfolio Dashboard</h3>
                <p className="opacity-90">Comprehensive view of all properties, tenants, financials, and key metrics in real-time.</p>
              </div>
              <div className="bg-white/50 dark:bg-black/30 p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-3">🔧 Maintenance Tracking</h3>
                <p className="opacity-90">Log, schedule, and track maintenance requests with automated vendor coordination.</p>
              </div>
              <div className="bg-white/50 dark:bg-black/30 p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-3">💰 Financial Management</h3>
                <p className="opacity-90">Automated rent collection, expense tracking, and financial reporting with tax optimization.</p>
              </div>
              <div className="bg-white/50 dark:bg-black/30 p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-3">📱 Tenant Portal</h3>
                <p className="opacity-90">Self-service portal for tenants to pay rent, submit maintenance requests, and communicate.</p>
              </div>
            </div>
          </Section>
        </PanelWrapper>

        {/* CTA - Dark */}
        <PanelWrapper variant="dark">
          <Section
            id="cortexai-cta"
            title="Transform Your Property Management"
            body="Join property managers and asset owners who have revolutionized their operations with CortexAI. Request a personalized demo today."
            variant="dark"
          >
            <CTAButton
              label="Contact Sales"
              href="mailto:admin@v2u.us?subject=CortexAI%20Sales%20Inquiry"
              variant="dark"
              className="mt-4"
            />
          </Section>
        </PanelWrapper>

      </div>

      <Footer />
    </main>
  )
}
