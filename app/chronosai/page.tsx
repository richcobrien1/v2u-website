'use client'


import { useEffect, useState } from 'react'
import CTAButton from '@/components/CTAButton'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Section from '@/components/Section'
import PanelWrapper from '@/components/PanelWrapper'
import Image from 'next/image'

export default function ChronosAIPage() {
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

        {/* ChronosAI Main - Dark */}
        <PanelWrapper variant="dark">
          <Section
            id="chronosai-main"
            title={
              <div className="flex items-center gap-3">
                <Image 
                  src="/ChronosAI_Consumer.png" 
                  alt="ChronosAI Consumer Logo" 
                  width={50} 
                  height={50} 
                  className="object-contain rounded"
                />
                <span>ChronosAI <span className="text-sm opacity-75 font-normal">Patent Pending</span></span>
              </div>
            }
            body="AI-powered 3D modeling and printing platform for hobbyists, makers, and individual creators. ChronosAI harnesses the power of AI for model retrieval, intelligent modification, and optimized output to standard 3D printers. Web-based and native app versions available."
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

            {/* Description Block */}
            <div className="px-4 md:px-4 space-y-4 text-white leading-relaxed">
              <p>
                <strong>ChronosAI</strong> revolutionizes 3D modeling and printing by integrating cutting-edge AI capabilities directly into the design workflow. Our platform combines traditional 3D modeling tools with intelligent AI assistance for model retrieval, automated modifications, and optimized printing preparation.
              </p>
              <p className="mt-2">
                <strong>AI-Powered Model Retrieval:</strong> Instantly find and access thousands of 3D models through intelligent search and recommendation algorithms. Our AI understands your design intent and suggests relevant models, components, and modifications to accelerate your creative process.
              </p>
              <p className="mt-2">
                <strong>Intelligent Modification Engine:</strong> Transform existing models with AI-driven modifications. Whether you need to scale, optimize for printing, or adapt designs for specific use cases, ChronosAI&apos;s AI handles complex geometric calculations and ensures printability standards are maintained.
              </p>
              <p className="mt-2">
                <strong>Universal Printer Compatibility:</strong> Seamlessly output to standard 3D printers with optimized slicing algorithms. Our platform automatically generates print-ready files with support structures, infill patterns, and layer configurations tailored to your specific printer and material requirements.
              </p>
              <p className="mt-2">
                <strong>Cross-Platform Accessibility:</strong> Available as a comprehensive web application and native desktop apps, ChronosAI ensures your 3D modeling workflow is accessible anywhere. Cloud synchronization keeps your projects and AI learning preferences consistent across all devices.
              </p>
            </div>

            <CTAButton
              label="Contact Us to Learn More"
              href="mailto:admin@v2u.us?subject=ChronosAI%20Inquiry&body=Hi%20Team%2C%0A%0AI%20have%20a%20question%20about%20ChronosAI..."
              variant="dark"
              className="mt-6"
            />
          </Section>
        </PanelWrapper>

        {/* ChronosAI Commercial - Light */}
        <PanelWrapper variant="light">
          <Section
            id="chronosai-commercial"
            title={
              <div className="flex items-center gap-3">
                <Image 
                  src="/ChronosAI_Commercial.png" 
                  alt="ChronosAI Commercial Logo" 
                  width={50} 
                  height={50} 
                  className="object-contain rounded"
                />
                <span>ChronosAI Commercial <span className="text-sm opacity-75 font-normal">Patent Pending</span></span>
              </div>
            }
            body="Enterprise-grade 3D modeling and manufacturing platform designed for commercial operations, small to mid-sized businesses, and professional design studios."
            variant="light"
          >
            {/* TODO: Add ChronosAI Commercial specific image/video here */}
            
            <div className="px-4 md:px-4 space-y-4 text-black leading-relaxed">
              <p>
                <strong>ChronosAI Commercial</strong> extends our core platform with enterprise features tailored for business operations, including vendor management, cost optimization, batch processing, and team collaboration tools.
              </p>
              <p className="mt-2">
                <strong>Multi-Vendor Support:</strong> Integrate with multiple material suppliers and service bureaus. Automatically compare pricing, lead times, and quality metrics across vendors to optimize your production decisions.
              </p>
              <p className="mt-2">
                <strong>Advanced Security:</strong> Enterprise-grade security with role-based access control, audit logging, IP protection, and secure collaboration features for distributed teams.
              </p>
              <p className="mt-2">
                <strong>Business Intelligence:</strong> Comprehensive analytics for production costs, material usage, printer utilization, and quality metrics. Export detailed reports for accounting and operational analysis.
              </p>
              <p className="mt-2">
                <strong>Workflow Automation:</strong> Streamline your production pipeline with automated job queuing, print scheduling, quality checks, and post-processing workflows.
              </p>
            </div>

            <CTAButton
              label="Contact Sales"
              href="mailto:admin@v2u.us?subject=ChronosAI%20Commercial%20Inquiry&body=Hi%20Sales%20Team%2C%0A%0AI%27m%20interested%20in%20ChronosAI%20Commercial..."
              variant="light"
              className="mt-6"
            />
          </Section>
        </PanelWrapper>

        {/* ChronosAI Industrial/Aerospace - Dark */}
        <PanelWrapper variant="dark">
          <Section
            id="chronosai-industrial"
            title={
              <div className="flex items-center gap-3">
                <Image 
                  src="/Chronos_Industrial.png" 
                  alt="ChronosAI Industrial Logo" 
                  width={50} 
                  height={50} 
                  className="object-contain rounded"
                />
                <span>ChronosAI Industrial / Aerospace <span className="text-sm opacity-75 font-normal">Patent Pending</span></span>
              </div>
            }
            body="Mission-critical 3D modeling and additive manufacturing platform for industrial applications, aerospace, defense, and highly regulated industries."
            variant="dark"
          >
            <div className="px-4 md:px-4 space-y-4 text-white leading-relaxed">
              <p>
                <strong>ChronosAI Industrial/Aerospace</strong> delivers the highest level of precision, compliance, and traceability for applications where failure is not an option. Built for industries requiring strict regulatory compliance and certified processes.
              </p>
              <p className="mt-2">
                <strong>Regulatory Compliance:</strong> Full traceability and documentation for AS9100, ISO 9001, FDA, and other industry-specific certifications. Automated compliance reporting and audit trails for every production step.
              </p>
              <p className="mt-2">
                <strong>Advanced Materials:</strong> Support for specialized materials including high-performance polymers, metal alloys, composites, and certified aerospace-grade materials. Material certification tracking and batch traceability.
              </p>
              <p className="mt-2">
                <strong>Precision Engineering:</strong> Sub-micron accuracy analysis, advanced FEA integration, stress simulation, and tolerance verification. Automated quality assurance with real-time monitoring and defect detection.
              </p>
              <p className="mt-2">
                <strong>Secure Infrastructure:</strong> On-premise or private cloud deployment options. Air-gapped operation capability, ITAR compliance, and defense-grade encryption for sensitive designs and data.
              </p>
              <p className="mt-2">
                <strong>Enterprise Integration:</strong> Seamless integration with PLM systems (PTC, Siemens, Dassault), ERP platforms, MES solutions, and existing manufacturing execution systems.
              </p>
            </div>

            <CTAButton
              label="Request Enterprise Demo"
              href="mailto:admin@v2u.us?subject=ChronosAI%20Industrial%20Demo%20Request&body=Hi%20Enterprise%20Team%2C%0A%0AI%27d%20like%20to%20schedule%20a%20demo%20of%20ChronosAI%20Industrial..."
              variant="dark"
              className="mt-6"
            />
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
