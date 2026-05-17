'use client'
export const dynamic = 'force-dynamic'

import CTAButton from '@/components/CTAButton'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Section from '@/components/Section'
import PanelWrapper from '@/components/PanelWrapper'
import { Activity } from 'lucide-react'

export default function PeptideProPage() {
  return (
    <main className="w-full h-auto pt-12 bg-bgLight dark:bg-bgDark text-black dark:text-white transition-colors duration-300">
      <Header />

      <div className="page-content">

        {/* Promo Panel - Dark */}
        <PanelWrapper variant="dark">
          <Section
            id="promo-banner"
            title={
              <div className="flex items-center gap-3">
                <Activity className="w-8 h-8 text-emerald-400" />
                <span>PeptidePro</span>
              </div>
            }
            body="PeptidePro is a dedicated platform for managing and exploring premium solutions in health and wellness."
            variant="dark"
          >
            <div className="px-4 md:px-4 space-y-4 text-white leading-relaxed text-left max-w-4xl pt-4">
              <p>
                PeptidePro is our flagship platform for health and wellness optimization, providing tools to effectively manage therapies, track physical markers, and access a rich library of wellness protocols.
              </p>
              <p className="mt-2">
                Designed for both individuals and practitioners, the environment integrates seamlessly with personal devices to provide actionable insights, securely store historical data, and streamline health protocol workflows.
              </p>
            </div>
            
            <div className="mt-8 flex justify-center">
              <CTAButton
                label="Login / Signup to PeptidePro"
                href="https://peptidepro.v2u.us/"
                variant="dark"
                className="text-lg px-8 py-4"
                iconRight="➡️"
              />
            </div>
          </Section>
        </PanelWrapper>

      </div>

      <Footer />
    </main>
  )
}