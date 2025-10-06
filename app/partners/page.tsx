'use client'

import Header from '@/components/Header'
import Footer from '@/components/Footer'
import PanelWrapper from '@/components/PanelWrapper'

export default function PartnersPage() {
  const partnerTypes = [
    {
      title: "Technology Partners",
      description: "Strategic alliances with leading technology providers to enhance our platform capabilities.",
      partners: ["Cloud Infrastructure Partners", "AI & ML Providers", "Content Delivery Networks"]
    },
    {
      title: "Media Partners",
      description: "Collaborations with broadcasters, publishers, and content creators to expand our reach.",
      partners: ["Broadcast Networks", "Digital Media Platforms", "Content Studios"]
    },
    {
      title: "Integration Partners",
      description: "Certified partners who integrate v2u solutions into their products and services.",
      partners: ["Software Integrators", "System Integrators", "API Partners"]
    }
  ]

  const benefits = [
    {
      title: "Co-Marketing Opportunities",
      description: "Joint marketing campaigns and co-branded content to reach new audiences."
    },
    {
      title: "Technical Collaboration",
      description: "Shared engineering resources and joint development initiatives."
    },
    {
      title: "Revenue Sharing",
      description: "Mutually beneficial revenue models for successful partnerships."
    },
    {
      title: "Priority Support",
      description: "Dedicated support channels and early access to new features."
    }
  ]

  return (
    <main className="min-h-screen bg-[var(--site-bg)] text-[var(--site-fg)]">
      <Header />

      <div className="pt-24">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#0F8378FF] to-[#015451FF] py-20">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative mx-auto max-w-4xl px-4 text-center text-white">
            <h1 className="mb-6 text-4xl font-bold md:text-6xl">Partner With Us</h1>
            <p className="text-xl md:text-2xl opacity-90">
              Join our ecosystem of innovation and growth
            </p>
          </div>
        </div>

        {/* Partner Types Section */}
        <div className="py-16">
          <div className="mx-auto max-w-6xl px-4">
            <h2 className="mb-12 text-center text-3xl font-bold">Partnership Opportunities</h2>
            <div className="grid gap-8 md:grid-cols-3">
              {partnerTypes.map((type, index) => (
                <PanelWrapper key={index} variant={index % 2 === 0 ? "dark" : "light"}>
                  <h3 className="mb-4 text-xl font-semibold">{type.title}</h3>
                  <p className="mb-6 opacity-90">{type.description}</p>
                  <ul className="space-y-2">
                    {type.partners.map((partner, pIndex) => (
                      <li key={pIndex} className="text-sm opacity-75">• {partner}</li>
                    ))}
                  </ul>
                </PanelWrapper>
              ))}
            </div>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="py-16 bg-gradient-to-r from-[#dfdfdfff] to-[#f0f0f0ff]">
          <div className="mx-auto max-w-6xl px-4">
            <h2 className="mb-12 text-center text-3xl font-bold">Partner Benefits</h2>
            <div className="grid gap-6 md:grid-cols-2">
              {benefits.map((benefit, index) => (
                <PanelWrapper key={index} variant="light">
                  <h3 className="mb-3 text-lg font-semibold">{benefit.title}</h3>
                  <p className="text-gray-700">{benefit.description}</p>
                </PanelWrapper>
              ))}
            </div>
          </div>
        </div>

        {/* Become a Partner Section */}
        <div className="py-16">
          <div className="mx-auto max-w-4xl px-4 text-center">
            <PanelWrapper variant="dark">
              <h2 className="mb-6 text-2xl font-bold">Become a Partner</h2>
              <p className="mb-8 text-gray-300">
                Ready to explore partnership opportunities with v2u? We&apos;d love to discuss how we can work together to create value for our customers.
              </p>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="text-left">
                  <h3 className="mb-2 font-semibold">Business Development</h3>
                  <p className="text-sm text-gray-400">partners@v2u.us</p>
                  <p className="text-sm text-gray-400">Strategic partnerships and alliances</p>
                </div>
                <div className="text-left">
                  <h3 className="mb-2 font-semibold">Technical Partnerships</h3>
                  <p className="text-sm text-gray-400">tech.partners@v2u.us</p>
                  <p className="text-sm text-gray-400">API integrations and technical collaborations</p>
                </div>
              </div>
              <div className="mt-8">
                <a
                  href="mailto:partners@v2u.us"
                  className="inline-block rounded-lg bg-[#0F8378FF] px-8 py-3 text-white hover:bg-[#015451FF]"
                >
                  Contact Partnership Team
                </a>
              </div>
            </PanelWrapper>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}