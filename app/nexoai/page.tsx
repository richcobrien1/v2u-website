'use client'

import { useEffect, useState } from 'react'
import CTAButton from '@/components/CTAButton'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Section from '@/components/Section'
import PanelWrapper from '@/components/PanelWrapper'
import Image from 'next/image'

export default function NexoAIPage() {
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
            id="nexoai-main"
            title={
              <div className="flex items-center gap-3">
                <Image 
                  src="/v2u.png" 
                  alt="NexoAI Logo" 
                  width={40} 
                  height={40} 
                  className="object-contain rounded"
                />
                <span>NexoAI</span>
              </div>
            }
            body="AI-powered service business automation platform with multi-tenant capabilities, CRM, invoicing, scheduling, and cross-platform support. Built for service professionals who want to automate and scale their operations."
            variant="dark"
          >
            {/* TODO: Add NexoAI demo video or screenshots here */}
            
            <div className="px-4 md:px-4 space-y-4 text-white leading-relaxed mt-6">
              <p>
                <strong>NexoAI</strong> is a comprehensive service business management platform designed for the modern service professional. Whether you run a consulting firm, legal practice, accounting office, or any service-based business, NexoAI provides the tools you need to streamline operations and grow.
              </p>
              
              <h3 className="text-xl font-semibold mt-6 mb-3">Core Features</h3>
              
              <p className="mt-2">
                <strong>Multi-Tenant Architecture:</strong> Host multiple independent businesses on a single platform. Each tenant gets their own isolated data, branding, domain, and customizations while sharing the robust infrastructure.
              </p>
              <p className="mt-2">
                <strong>Intelligent CRM:</strong> AI-powered customer relationship management that tracks interactions, predicts needs, and automates follow-ups. Never miss an opportunity with smart lead scoring and conversion tracking.
              </p>
              <p className="mt-2">
                <strong>Automated Invoicing & Payments:</strong> Generate professional invoices instantly with customizable templates. Integrate with Stripe for seamless payment processing and automated reminders for overdue payments.
              </p>
              <p className="mt-2">
                <strong>Smart Scheduling:</strong> Advanced appointment booking with availability management, automated reminders, calendar integrations, and conflict detection. Public booking pages for self-service scheduling.
              </p>
              <p className="mt-2">
                <strong>Cross-Platform Access:</strong> Full-featured web application, native iOS and Android mobile apps, and desktop applications for Windows and macOS. Your business data syncs seamlessly across all devices.
              </p>
              
              <h3 className="text-xl font-semibold mt-6 mb-3">Industry Templates</h3>
              
              <p className="mt-2">
                Pre-configured workflows and settings for various industries including consulting, legal services, accounting, healthcare, home services, and more. Get started in minutes with industry best practices built-in.
              </p>
              
              <h3 className="text-xl font-semibold mt-6 mb-3">AI-Powered Insights</h3>
              
              <p className="mt-2">
                Leverage conversational AI to set up your business, analyze documents, generate estimates, and get actionable insights from your business data. NexoAI learns from your operations to provide smarter recommendations over time.
              </p>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <CTAButton
                label="View Live Demo"
                href="https://github.com/richcobrien1/NexoAI"
                variant="dark"
              />
              <CTAButton
                label="Contact Sales"
                href="mailto:admin@v2u.us?subject=NexoAI%20Inquiry&body=Hi%20Team%2C%0A%0AI%27m%20interested%20in%20learning%20more%20about%20NexoAI..."
                variant="dark"
              />
            </div>
          </Section>
        </PanelWrapper>

        {/* Features Panel - Light */}
        <PanelWrapper variant="light">
          <Section
            id="nexoai-features"
            title="What's Included"
            variant="light"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-black">
              <div className="space-y-2">
                <h4 className="font-semibold text-lg">Customer Management</h4>
                <p className="opacity-80">Complete CRM with contact history, notes, documents, and communication tracking</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-lg">Appointment Scheduling</h4>
                <p className="opacity-80">Calendar management, automated reminders, and public booking pages</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-lg">Estimates & Invoices</h4>
                <p className="opacity-80">Professional documents with multiple templates and automated payment tracking</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-lg">Service Catalog</h4>
                <p className="opacity-80">Manage your services, pricing, duration, and packages</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-lg">Team Management</h4>
                <p className="opacity-80">Employee scheduling, permissions, and performance tracking</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-lg">Business Analytics</h4>
                <p className="opacity-80">Revenue tracking, client insights, and operational metrics</p>
              </div>
            </div>
          </Section>
        </PanelWrapper>

        {/* Pricing Panel - Dark */}
        <PanelWrapper variant="dark">
          <Section
            id="nexoai-pricing"
            title="Flexible Pricing"
            body="Choose the plan that fits your business size and needs. All plans include core features with scalable limits."
            variant="dark"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <div className="bg-white/10 p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-2">Free</h3>
                <p className="text-3xl font-bold mb-4">$0<span className="text-sm font-normal">/month</span></p>
                <ul className="space-y-2 text-white/90">
                  <li>✓ Up to 5 users</li>
                  <li>✓ 100 customers</li>
                  <li>✓ Basic features</li>
                  <li>✗ No AI assistant</li>
                </ul>
              </div>
              <div className="bg-white/20 p-6 rounded-lg border-2 border-white/30">
                <div className="text-xs bg-white/20 px-2 py-1 rounded-full inline-block mb-2">RECOMMENDED</div>
                <h3 className="text-xl font-semibold mb-2">Basic</h3>
                <p className="text-3xl font-bold mb-4">$49<span className="text-sm font-normal">/month</span></p>
                <ul className="space-y-2 text-white/90">
                  <li>✓ Up to 15 users</li>
                  <li>✓ 500 customers</li>
                  <li>✓ All features</li>
                  <li>✓ AI assistant</li>
                </ul>
              </div>
              <div className="bg-white/10 p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-2">Professional</h3>
                <p className="text-3xl font-bold mb-4">$99<span className="text-sm font-normal">/month</span></p>
                <ul className="space-y-2 text-white/90">
                  <li>✓ Up to 50 users</li>
                  <li>✓ Unlimited customers</li>
                  <li>✓ Advanced AI</li>
                  <li>✓ Priority support</li>
                </ul>
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
