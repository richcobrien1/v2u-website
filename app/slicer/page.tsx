'use client'

import { useEffect, useState } from 'react'
import CTAButton from '@/components/CTAButton'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Section from '@/components/Section'
import PanelWrapper from '@/components/PanelWrapper'
import Image from 'next/image'

export default function SlicerPage() {
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
            title={
              <div className="flex items-center gap-3">
                <Image 
                  src="/Slicer_Icon.gif" 
                  alt="Slicer Logo" 
                  width={34} 
                  height={38} 
                  className="object-contain rounded"
                />
                <span>Slicer</span>
              </div>
            }
            body="A 3D Model application with AI Capability and output to standard model printers. Slicer harnesses the power of AI for retrieval, modification and output for standard 3d models. Web-based, native apps versions available."
            variant="dark"
          >
            {/* Auto-playing Video */}
            <div className="w-full mb-6">
              <div className="relative w-full h-full">
                <video
                  autoPlay
                  loop
                  muted
                  controls
                  className="w-full h-full rounded-lg"
                  poster="/Slicer_Full_Screen.jpg"
                >
                  <source src="/videos/Slicer_Full_Screen.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>

            {/* ✅ Description Block */}
            <div className="px-4 md:px-4 space-y-4 text-white leading-relaxed">
              <p>
                <strong>Slicer</strong> revolutionizes 3D modeling and printing by integrating cutting-edge AI capabilities directly into the design workflow. Our platform combines traditional 3D modeling tools with intelligent AI assistance for model retrieval, automated modifications, and optimized printing preparation.
              </p>
              <p className="mt-2">
                <strong>AI-Powered Model Retrieval:</strong> Instantly find and access thousands of 3D models through intelligent search and recommendation algorithms. Our AI understands your design intent and suggests relevant models, components, and modifications to accelerate your creative process.
              </p>
              <p className="mt-2">
                <strong>Intelligent Modification Engine:</strong> Transform existing models with AI-driven modifications. Whether you need to scale, optimize for printing, or adapt designs for specific use cases, Slicer&apos;s AI handles complex geometric calculations and ensures printability standards are maintained.
              </p>
              <p className="mt-2">
                <strong>Universal Printer Compatibility:</strong> Seamlessly output to standard 3D printers with optimized slicing algorithms. Our platform automatically generates print-ready files with support structures, infill patterns, and layer configurations tailored to your specific printer and material requirements.
              </p>
              <p className="mt-2">
                <strong>Cross-Platform Accessibility:</strong> Available as a comprehensive web application and native desktop apps, Slicer ensures your 3D modeling workflow is accessible anywhere. Cloud synchronization keeps your projects and AI learning preferences consistent across all devices.
              </p>
            </div>

            <CTAButton
              label="Contact Us to Learn More"
              href="mailto:admin@v2u.us?subject=Slicer%20Inquiry&body=Hi%20Team%2C%0A%0AI%20have%20a%20question%20about%20Slicer..."
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