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

        {/* Hero Panel - Purple Gradient */}
        <div className="rounded-xl p-12 md:p-16 bg-gradient-to-br from-[#5B4DB5] via-[#3730A3] to-[#1E3A8A] text-white">
          <div className="max-w-5xl mx-auto text-center">
            <div className="flex justify-center items-center gap-3 mb-6">
              <Image 
                src="/logo-cortexai-neural-vault.png" 
                alt="CortexAI Logo" 
                width={60} 
                height={60} 
                className="object-contain rounded"
              />
              <h1 className="text-2xl font-bold">Cortex-AI</h1>
            </div>
            
            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              Intelligent Property <span className="text-[#F59E0B]">Protection</span>
            </h2>
            
            <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-3xl mx-auto">
              Secure, AI-powered management for your intellectual property, real estate, digital assets, and estate planning. Never miss a renewal. Never lose a document.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <CTAButton
                label="Start Free Trial"
                href="https://github.com/richcobrien1/CortexAI"
                variant="dark"
                className="bg-[#F59E0B] hover:bg-[#D97706] text-black font-semibold px-8 py-3 rounded-lg"
              />
              <CTAButton
                label="Watch Demo"
                href="#cortexai-demo"
                variant="dark"
                className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-semibold px-8 py-3 rounded-lg border border-white/20"
              />
            </div>
            
            {/* Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="text-4xl mb-4">🛡️</div>
                <h3 className="text-xl font-bold mb-2">Military-Grade Security</h3>
                <p className="text-white/80">AES-256 encryption, ITAR compliance</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="text-4xl mb-4">🧠</div>
                <h3 className="text-xl font-bold mb-2">AI-Powered Search</h3>
                <p className="text-white/80">Natural language queries across all documents</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="text-4xl mb-4">📈</div>
                <h3 className="text-xl font-bold mb-2">Smart Forecasting</h3>
                <p className="text-white/80">Market trends, geopolitical risks, alerts</p>
              </div>
            </div>
          </div>
        </div>

        {/* Manage All Assets Section */}
        <PanelWrapper variant="light">
          <Section
            id="cortexai-assets"
            title="Manage All Your Assets"
            variant="light"
          >
            <div className="px-4 md:px-4 space-y-4 text-black leading-relaxed mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Intellectual Property */}
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                  <div className="text-3xl mb-3">💡</div>
                  <h4 className="text-lg font-bold mb-2">Intellectual Property</h4>
                  <p className="text-sm text-gray-600">Patents, trademarks, copyrights, trade secrets, and licensing agreements</p>
                </div>
                
                {/* Real Estate */}
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                  <div className="text-3xl mb-3">🏠</div>
                  <h4 className="text-lg font-bold mb-2">Real Estate</h4>
                  <p className="text-sm text-gray-600">Property titles, deeds, mortgages, leases, and market analytics</p>
                </div>
                
                {/* Digital Assets */}
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                  <div className="text-3xl mb-3">₿</div>
                  <h4 className="text-lg font-bold mb-2">Digital Assets</h4>
                  <p className="text-sm text-gray-600">Cryptocurrency, NFTs, domains, and digital rights</p>
                </div>
                
                {/* Vehicles & Equipment */}
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                  <div className="text-3xl mb-3">🚗</div>
                  <h4 className="text-lg font-bold mb-2">Vehicles & Equipment</h4>
                  <p className="text-sm text-gray-600">Automobiles, boats, aircraft, heavy equipment tracking</p>
                </div>
                
                {/* Estate Planning */}
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                  <div className="text-3xl mb-3">📜</div>
                  <h4 className="text-lg font-bold mb-2">Estate Planning</h4>
                  <p className="text-sm text-gray-600">Wills, trusts, power of attorney, healthcare directives</p>
                </div>
                
                {/* Legal Documents */}
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                  <div className="text-3xl mb-3">⚖️</div>
                  <h4 className="text-lg font-bold mb-2">Legal Documents</h4>
                  <p className="text-sm text-gray-600">Contracts, agreements, court documents, compliance records</p>
                </div>
              </div>
            </div>
          </Section>
        </PanelWrapper>

        {/* AI Intelligence Section - Dark */}
        <PanelWrapper variant="dark">
          <Section
            id="cortexai-intelligence"
            title="AI-Powered Intelligence"
            variant="dark"
          >
            <div className="space-y-6 text-white leading-relaxed">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-bold mb-2 text-[#F59E0B]">🔍 RAG-Powered Search</h4>
                  <p className="text-white/90">Ask natural language questions about your portfolio and receive instant answers from your document archive. Find specific clauses, dates, or terms across thousands of documents in seconds.</p>
                </div>
                <div>
                  <h4 className="text-lg font-bold mb-2 text-[#F59E0B]">🔔 Renewal & Deadline Alerts</h4>
                  <p className="text-white/90">Never miss a critical deadline with AI-powered alerts for patent renewals, trademark filings, lease expirations, insurance renewals, and contract deadlines at 90/30/7 day intervals.</p>
                </div>
                <div>
                  <h4 className="text-lg font-bold mb-2 text-[#F59E0B]">📊 Market Intelligence</h4>
                  <p className="text-white/90">Receive real-time alerts on market trends, legislative changes, and geopolitical events that may impact your assets. AI analyzes Congress.gov, EUR-Lex, and global news sources.</p>
                </div>
                <div>
                  <h4 className="text-lg font-bold mb-2 text-[#F59E0B]">💰 Valuation Forecasting</h4>
                  <p className="text-white/90">AI-powered portfolio analytics predict asset value trends, identify optimization opportunities, and suggest strategic actions based on market conditions.</p>
                </div>
              </div>
            </div>
          </Section>
        </PanelWrapper>

        {/* Security Section - Light */}
        <PanelWrapper variant="light">
          <Section
            id="cortexai-security"
            title="Military-Grade Security"
            variant="light"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-black">
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <h4 className="text-lg font-bold mb-2">🔒 ITAR Compliance</h4>
                <p className="text-gray-600">Built for FIPS 140-2 certified devices with hardware security module (HSM) support. Suitable for managing ITAR-controlled technical data and defense-related intellectual property.</p>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <h4 className="text-lg font-bold mb-2">🛡️ AES-256 Encryption</h4>
                <p className="text-gray-600">All documents encrypted at rest with per-document data encryption keys (DEKs) managed by AWS KMS. Optional client-side encryption for zero-knowledge architecture.</p>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <h4 className="text-lg font-bold mb-2">👤 Biometric Authentication</h4>
                <p className="text-gray-600">Multi-factor authentication with fingerprint and facial recognition. Optional FIDO2 hardware key support for maximum security.</p>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <h4 className="text-lg font-bold mb-2">📋 Audit Logging</h4>
                <p className="text-gray-600">Immutable, append-only audit logs track every document access, modification, and deletion with cryptographic integrity verification.</p>
              </div>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <CTAButton
                label="View Live Demo"
                href="https://github.com/richcobrien1/CortexAI"
                variant="light"
                className="bg-[#F59E0B] hover:bg-[#D97706] text-black font-semibold px-8 py-3 rounded-lg"
              />
              <CTAButton
                label="Contact Sales"
                href="mailto:admin@v2u.us?subject=CortexAI%20Inquiry&body=Hi%20Team%2C%0A%0AI%27m%20interested%20in%20learning%20more%20about%20CortexAI..."
                variant="light"
                className="bg-gray-200 hover:bg-gray-300 text-black font-semibold px-8 py-3 rounded-lg"
              />
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
