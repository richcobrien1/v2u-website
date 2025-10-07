'use client'

import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Section from '@/components/Section'
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

      <div className="pt-24 px-4 md:px-4 space-y-4">
        {/* Hero Section */}
        <div className="rounded-xl p-6 mb-4" style={{
          background: 'linear-gradient(to bottom right, #0F8378FF, #015451FF)'
        }}>
          <Section
            variant="dark"
            title=""
            body=""
            rounded={true}
          >
            <div className="text-center text-white">
              <h1 className="mb-6 text-4xl font-bold md:text-6xl">Partner With Us</h1>
              <p className="text-xl md:text-2xl opacity-90">
                Join our ecosystem of innovation and growth
              </p>
            </div>
          </Section>
        </div>

        {/* Partner Types Section */}
        <div className="px-4 md:px-4 space-y-4">
          <div className="rounded-xl p-6 mb-4">
            <Section
              title="Partnership Opportunities"
              variant="light"
              background={{ from: '#0F8378FF', to: '#dfdfdfff' }}
              rounded={true}
            >
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
            </Section>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="px-4 md:px-4 space-y-4">
          <div className="rounded-xl p-6 mb-4 bg-[#212121ff] text-white">
            <Section
              title="Partner Benefits"
              variant="dark"
              background={{ from: '#015451FF', to: '#212121ff' }}
              rounded={true}
            >
              <div className="grid gap-6 md:grid-cols-2">
                {benefits.map((benefit, index) => (
                  <PanelWrapper key={index} variant="light">
                    <h3 className="mb-3 text-lg font-semibold">{benefit.title}</h3>
                    <p className="text-gray-700">{benefit.description}</p>
                  </PanelWrapper>
                ))}
              </div>
            </Section>
          </div>
        </div>

        {/* Become a Partner Section */}
        <div className="px-4 md:px-4 space-y-4">
          <div className="rounded-xl p-6 mb-4">
            <Section
              title="Become a Partner"
              variant="light"
              background={{ from: '#0F8378FF', to: '#dfdfdfff' }}
              rounded={true}
            >
              <p className="mb-8 text-gray-700">
                Ready to explore partnership opportunities with v2u? We&apos;d love to discuss how we can work together to create value for our customers.
              </p>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="text-left">
                  <h3 className="mb-2 font-semibold">Business Development</h3>
                  <p className="text-sm text-gray-600">partners@v2u.us</p>
                  <p className="text-sm text-gray-600">Strategic partnerships and alliances</p>
                </div>
                <div className="text-left">
                  <h3 className="mb-2 font-semibold">Technical Partnerships</h3>
                  <p className="text-sm text-gray-600">tech.partners@v2u.us</p>
                  <p className="text-sm text-gray-600">API integrations and technical collaborations</p>
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
            </Section>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}