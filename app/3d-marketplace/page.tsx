'use client'
export const dynamic = 'force-dynamic'

import CTAButton from '@/components/CTAButton'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Section from '@/components/Section'
import PanelWrapper from '@/components/PanelWrapper'

export default function ThreeDMarketplacePage() {
  return (
    <main className="w-full h-auto pt-12 bg-bgLight dark:bg-bgDark text-black dark:text-white transition-colors duration-300">
      <Header />

      <div className="page-content">

        {/* Hero - Dark */}
        <PanelWrapper variant="dark">
          <Section
            id="3d-marketplace-hero"
            title="3D Marketplace - Coming Soon"
            body="A revolutionary platform connecting smart contract engineers and blockchain designers with businesses worldwide. Browse verified developers, review portfolios, and deploy secure blockchain solutions."
            variant="dark"
          >
            <div className="px-4 md:px-4 space-y-4 text-white leading-relaxed">
              <p>
                <strong>3D Marketplace</strong> is the future of blockchain development outsourcing. We're building a trusted platform where businesses can discover, evaluate, and hire expert smart contract engineers and blockchain architects.
              </p>
              <p className="mt-2">
                <strong>For Businesses:</strong> Access a curated network of verified blockchain developers. Review portfolios, check security audits, read client testimonials, and hire with confidence. Our escrow system ensures payment protection and quality deliverables.
              </p>
              <p className="mt-2">
                <strong>For Developers:</strong> Showcase your expertise, build your reputation, and access a steady stream of high-quality projects. Our platform handles contracts, payments, and dispute resolution so you can focus on coding.
              </p>
              <p className="mt-2">
                <strong>Security First:</strong> All developers undergo rigorous vetting including code audits, identity verification, and portfolio validation. Every smart contract deployed through our platform receives a security score and optional third-party audit.
              </p>
            </div>

            <div className="mt-8 bg-emerald-500/20 border border-emerald-500/50 rounded-lg p-6 text-center">
              <h3 className="text-2xl font-bold mb-3">🚀 Launching Q3 2026</h3>
              <p className="opacity-90 mb-4">Join our waitlist to be notified when we launch and receive exclusive early access benefits.</p>
              <CTAButton
                label="Join Waitlist"
                href="mailto:admin@v2u.us?subject=3D%20Marketplace%20Waitlist&body=Hi%20Team%2C%0A%0APlease%20add%20me%20to%20the%203D%20Marketplace%20waitlist.%0A%0AName%3A%0ACompany%3A%0ARole%3A%20%5BClient%2FDeveloper%5D"
                variant="dark"
              />
            </div>
          </Section>
        </PanelWrapper>

        {/* Features - Light */}
        <PanelWrapper variant="light">
          <Section
            id="marketplace-features"
            title="What to Expect"
            variant="light"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/70 dark:bg-black/30 p-6 rounded-lg text-center">
                <div className="text-4xl mb-4">🔍</div>
                <h3 className="text-xl font-bold mb-3">Verified Talent</h3>
                <p className="opacity-90">Every developer vetted, audited, and verified. Browse portfolios with confidence.</p>
              </div>
              <div className="bg-white/70 dark:bg-black/30 p-6 rounded-lg text-center">
                <div className="text-4xl mb-4">💼</div>
                <h3 className="text-xl font-bold mb-3">Escrow Protection</h3>
                <p className="opacity-90">Smart contract-based escrow ensures secure payments and quality deliverables.</p>
              </div>
              <div className="bg-white/70 dark:bg-black/30 p-6 rounded-lg text-center">
                <div className="text-4xl mb-4">⭐</div>
                <h3 className="text-xl font-bold mb-3">Reputation System</h3>
                <p className="opacity-90">Transparent reviews, ratings, and on-chain reputation tracking.</p>
              </div>
            </div>
          </Section>
        </PanelWrapper>

        {/* Developer Interest - Dark */}
        <PanelWrapper variant="dark">
          <Section
            id="developer-signup"
            title="Smart Contract Developer?"
            body="Join our exclusive network of blockchain engineers. Get access to high-quality projects, fair compensation, and a platform that values your expertise."
            variant="dark"
          >
            <CTAButton
              label="Apply as Developer"
              href="mailto:admin@v2u.us?subject=3D%20Marketplace%20Developer%20Application&body=Hi%20Team%2C%0A%0AI%20would%20like%20to%20apply%20as%20a%20developer%20on%203D%20Marketplace.%0A%0AName%3A%0APortfolio%3A%0AExperience%3A%0ASpecialties%3A"
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
