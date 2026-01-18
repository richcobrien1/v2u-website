'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import CTAButton from '@/components/CTAButton'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Section from '@/components/Section'
import PanelWrapper from '@/components/PanelWrapper'
import Image from 'next/image'

export default function CortexAIPage() {
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

        {/* Main Panel - Dark */}
        <PanelWrapper variant="dark">
          <Section
            id="cortexai-main"
            title={
              <div className="flex items-center gap-3">
                <Image 
                  src="/logo-cortexai-neural-vault.png" 
                  alt="CortexAI Logo" 
                  width={50} 
                  height={50} 
                  className="object-contain rounded"
                />
                <span>CortexAI</span>
              </div>
            }
            body="Military-grade personal property management system for comprehensive asset tracking and intelligence. Manage intellectual property, real assets, digital assets, estate planning, and legal documents with AI-powered insights and ITAR-compliant security."
            variant="dark"
          >
            {/* TODO: Add CortexAI demo video or screenshots here */}
            
            <div className="px-4 md:px-4 space-y-4 text-white leading-relaxed mt-6">
              <p>
                <strong>CortexAI</strong> is your comprehensive personal property management system that brings military-grade security and AI intelligence to asset tracking and estate administration. Whether you&apos;re managing intellectual property, real estate portfolios, digital assets, or estate planning documents, CortexAI provides the tools and insights you need to protect and optimize your wealth.
              </p>
              
              <h3 className="text-xl font-semibold mt-6 mb-3">Intellectual Property Management</h3>
              
              <p className="mt-2">
                <strong>Patents & Trademarks:</strong> Track patent applications, granted patents, trademarks, and copyrights across multiple jurisdictions. Receive automated renewal deadline alerts and monitor market value trends for your intellectual assets.
              </p>
              <p className="mt-2">
                <strong>Trade Secrets:</strong> Securely store and manage confidential business information, formulas, processes, and proprietary methodologies with military-grade encryption and access controls.
              </p>
              <p className="mt-2">
                <strong>Licensing & Royalties:</strong> Track licensing agreements, royalty payments, and contract renewals. Monitor revenue streams and identify optimization opportunities with AI-powered analytics.
              </p>
              
              <h3 className="text-xl font-semibold mt-6 mb-3">Real Asset Management</h3>
              
              <p className="mt-2">
                <strong>Real Estate Portfolio:</strong> Manage property titles, deeds, mortgages, and leases across residential, commercial, and land holdings. Track property values, market trends, and tax obligations with geospatial analytics.
              </p>
              <p className="mt-2">
                <strong>Vehicles & Equipment:</strong> Maintain comprehensive records for automobiles, boats, aircraft, and heavy equipment including registration, insurance, maintenance schedules, and depreciation tracking.
              </p>
              <p className="mt-2">
                <strong>Precious Assets:</strong> Catalog jewelry, art collections, antiques, and collectibles with authentication documents, appraisals, insurance policies, and provenance records.
              </p>
              
              <h3 className="text-xl font-semibold mt-6 mb-3">Digital Asset Management</h3>
              
              <p className="mt-2">
                <strong>Cryptocurrency & NFTs:</strong> Track digital wallets, crypto holdings, NFT collections, and blockchain assets across multiple chains. Monitor market values and receive security alerts for suspicious wallet activity.
              </p>
              <p className="mt-2">
                <strong>Domain Portfolio:</strong> Manage domain registrations, renewals, DNS configurations, and valuation tracking for your digital real estate investments.
              </p>
              <p className="mt-2">
                <strong>Digital Rights:</strong> Track software licenses, content rights, digital media assets, and online intellectual property with automated renewal management.
              </p>
              
              <h3 className="text-xl font-semibold mt-6 mb-3">Estate Planning & Legal</h3>
              
              <p className="mt-2">
                <strong>Wills & Trusts:</strong> Securely store wills, trust documents, power of attorney forms, and healthcare directives. Grant controlled access to executors and family members with role-based permissions.
              </p>
              <p className="mt-2">
                <strong>Estate Administration:</strong> Streamline estate settlement with comprehensive asset inventories, beneficiary information, and document organization. Track probate processes and distribution timelines.
              </p>
              <p className="mt-2">
                <strong>Legal Documents:</strong> Organize contracts, agreements, court documents, and legal correspondence with AI-powered search and retrieval capabilities.
              </p>
              
              <h3 className="text-xl font-semibold mt-6 mb-3">AI-Powered Intelligence</h3>
              
              <p className="mt-2">
                <strong>RAG-Powered Search:</strong> Ask natural language questions about your portfolio and receive instant answers from your document archive. Find specific clauses, dates, or terms across thousands of documents in seconds.
              </p>
              <p className="mt-2">
                <strong>Renewal & Deadline Alerts:</strong> Never miss a critical deadline with AI-powered alerts for patent renewals, trademark filings, lease expirations, insurance renewals, and contract deadlines at 90/30/7 day intervals.
              </p>
              <p className="mt-2">
                <strong>Market Intelligence:</strong> Receive real-time alerts on market trends, legislative changes, and geopolitical events that may impact your assets. AI analyzes Congress.gov, EUR-Lex, and global news sources.
              </p>
              <p className="mt-2">
                <strong>Valuation Forecasting:</strong> AI-powered portfolio analytics predict asset value trends, identify optimization opportunities, and suggest strategic actions based on market conditions.
              </p>
              <p className="mt-2">
                <strong>Tax & Estate Optimization:</strong> Forecast capital gains taxes, estate tax obligations, and receive strategic recommendations for tax-efficient asset transfers and distributions.
              </p>
              
              <h3 className="text-xl font-semibold mt-6 mb-3">Military-Grade Security</h3>
              
              <p className="mt-2">
                <strong>ITAR Compliance:</strong> Built for FIPS 140-2 certified devices with hardware security module (HSM) support. Suitable for managing ITAR-controlled technical data and defense-related intellectual property.
              </p>
              <p className="mt-2">
                <strong>AES-256 Encryption:</strong> All documents encrypted at rest with per-document data encryption keys (DEKs) managed by AWS KMS. Optional client-side encryption for zero-knowledge architecture.
              </p>
              <p className="mt-2">
                <strong>Biometric Authentication:</strong> Multi-factor authentication with fingerprint and facial recognition. Optional FIDO2 hardware key support for maximum security.
              </p>
              <p className="mt-2">
                <strong>Audit Logging:</strong> Immutable, append-only audit logs track every document access, modification, and deletion with cryptographic integrity verification.
              </p>

            </div>

            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <CTAButton
                label="View Live Demo"
                href="https://github.com/richcobrien1/CortexAI"
                variant="dark"
              />
              <CTAButton
                label="Contact Sales"
                href="mailto:admin@v2u.us?subject=CortexAI%20Inquiry&body=Hi%20Team%2C%0A%0AI%27m%20interested%20in%20learning%20more%20about%20CortexAI..."
                variant="dark"
              />
            </div>
          </Section>
        </PanelWrapper>

        {/* Features Panel - Light */}
        <PanelWrapper variant="light">
          <Section
            id="cortexai-features"
            title="Key Features"
            variant="light"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-black">
              <div className="space-y-2">
                <h4 className="font-semibold text-lg">🛡️ Military-Grade Security</h4>
                <p className="opacity-80">ITAR-compliant, FIPS 140-2 certified, AES-256 encryption with hardware security module support</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-lg">🔍 RAG-Powered Search</h4>
                <p className="opacity-80">Ask questions in natural language and search across thousands of documents instantly</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-lg">🔔 Smart Alerts</h4>
                <p className="opacity-80">Automated deadline tracking for renewals, expirations, and critical events</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-lg">📊 Portfolio Analytics</h4>
                <p className="opacity-80">Real-time valuation tracking, market trends, and AI-powered forecasting</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-lg">🌍 Global Intelligence</h4>
                <p className="opacity-80">Legislative monitoring, geopolitical risk analysis, and market intelligence</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-lg">👥 Role-Based Access</h4>
                <p className="opacity-80">Grant controlled access to family, advisors, executors with granular permissions</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-lg">📱 Cross-Platform</h4>
                <p className="opacity-80">Access on web, iOS, Android with real-time synchronization</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-lg">🤖 AI Assistant</h4>
                <p className="opacity-80">Conversational AI for document analysis, insights, and strategic recommendations</p>
              </div>
            </div>
          </Section>
        </PanelWrapper>

        {/* How It Works - Dark */}
        <PanelWrapper variant="dark">
          <Section
            id="cortexai-process"
            title="How It Works"
            variant="dark"
          >
            <div className="space-y-6 text-white">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-white/10 rounded-full flex items-center justify-center font-bold">1</div>
                <div>
                  <h4 className="font-semibold text-lg mb-2">Upload Your Assets</h4>
                  <p className="opacity-80">Import documents, deeds, titles, patents, and records. AI automatically extracts metadata, deadlines, and key information.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-white/10 rounded-full flex items-center justify-center font-bold">2</div>
                <div>
                  <h4 className="font-semibold text-lg mb-2">Organize & Categorize</h4>
                  <p className="opacity-80">Properties are automatically categorized by type, jurisdiction, and importance. Create custom tags and folders for your organization system.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-white/10 rounded-full flex items-center justify-center font-bold">3</div>
                <div>
                  <h4 className="font-semibold text-lg mb-2">Monitor & Get Alerts</h4>
                  <p className="opacity-80">Receive intelligent alerts for deadlines, market changes, and optimization opportunities. AI monitors global events that may impact your assets.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-white/10 rounded-full flex items-center justify-center font-bold">4</div>
                <div>
                  <h4 className="font-semibold text-lg mb-2">Analyze & Optimize</h4>
                  <p className="opacity-80">View portfolio analytics, valuation trends, and AI-powered insights. Make informed decisions with comprehensive intelligence.</p>
                </div>
              </div>
            </div>
          </Section>
        </PanelWrapper>

        {/* Premium Content Gate */}
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
