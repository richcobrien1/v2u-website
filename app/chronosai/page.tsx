'use client'
export const dynamic = 'force-dynamic'



import { useEffect, useState } from 'react'
import CTAButton from '@/components/CTAButton'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Section from '@/components/Section'
import PanelWrapper from '@/components/PanelWrapper'
import Image from 'next/image'

export default function ChronosAIPage() {
  const [hasAccess, setHasAccess] = useState(false)
  const [isExpired, setIsExpired] = useState(false)

  useEffect(() => {
    const cookies = document.cookie.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=')
      acc[key] = value
      return acc
    }, {} as Record<string, string>)

    setHasAccess(cookies['v2u-access'] === 'granted')
    setIsExpired(new Date() > new Date('2026-04-24T23:59:59-04:00'))
  }, [])

  const screenshots = [
    { src: '/ChronosAI-Screenshot-1.jpg', alt: 'Exhaust manifold wireframe view' },
    { src: '/ChronosAI-Screenshot-2.jpg', alt: 'Curiosity rover kit layout' },
    { src: '/ChronosAI-Screenshot-3.jpg', alt: 'Raspberry Pi 4 enclosure view' },
    { src: '/ChronosAI-Screenshot-4.jpg', alt: 'Wrench solid model view' },
    { src: '/ChronosAI-Screenshot-5.jpg', alt: 'Windows app — exhaust manifold wireframe' },
    { src: '/ChronosAI-Screenshot-6.jpg', alt: 'Standard view — close-up exhaust manifold' },
  ]

  const [activeShot, setActiveShot] = useState(0)

  return (
    <main className="w-full h-auto pt-12 bg-bgLight dark:bg-bgDark text-black dark:text-white transition-colors duration-300">
      <Header />

      <div className="page-content">

        {/* ── Hero / Teaser Video ── */}
        <PanelWrapper variant="dark">
          <div className="px-4 py-6 md:px-8">

            {/* Title row */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                <Image src="/ChronosAI_Consumer.png" alt="Chronos-AI" width={56} height={56} className="object-contain" />
                <div>
                  <h1 className="text-3xl md:text-4xl font-extrabold text-white leading-tight">
                    Chronos-AI
                  </h1>
                  <p className="text-emerald-400 text-sm font-semibold tracking-wide uppercase">Patent Pending &nbsp;·&nbsp; Generative 3D Model Assistant</p>
                </div>
              </div>
              {/* RAPID+TCT badge */}
              <div className="flex-shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/15 border border-emerald-400/40">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-emerald-300 text-xs font-bold uppercase tracking-wider">Live Preview · RAPID+TCT 2026 · Boston · Apr 14–17</span>
              </div>
            </div>

            {/* Teaser video */}
            <div className="w-full rounded-xl overflow-hidden mb-6 bg-black">
              <video
                autoPlay
                loop
                muted
                controls
                className="w-full rounded-xl"
                poster="/ChronosAI-Screenshot-5.jpg"
              >
                <source src="/videos/Chronos-AI-Teaser.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>

            <p className="text-white/80 text-lg leading-relaxed mb-8 max-w-4xl">
              <strong className="text-white">Chronos-AI</strong> is an AI-driven 3D modeling assistant that turns plain-language prompts into precise, print-ready geometry in seconds. Built for makers, engineers, and enterprise manufacturing teams — available as a web app and native desktop app for Windows, Linux, and Android.
            </p>

            {/* Feature tags */}
            <div className="flex flex-wrap gap-2 mb-8">
              {['AI Prompt System','3D Viewer','Atomic · Composite · Master Tiers','Import / Export','Modification History','Windows · Linux · Android','Real-Time Geometry','Print Optimization'].map(tag => (
                <span key={tag} className="px-3 py-1.5 rounded-full bg-white/8 border border-white/15 text-white/75 text-xs font-semibold">{tag}</span>
              ))}
            </div>

          </div>
        </PanelWrapper>

        {/* ── Screenshot Gallery ── */}
        <PanelWrapper variant="dark">
          <div className="px-4 py-6 md:px-8">
            <h2 className="text-2xl font-bold text-white mb-6">App Screenshots</h2>

            {/* Main viewer */}
            <div className="w-full rounded-xl overflow-hidden mb-4 bg-black border border-white/10">
              <Image
                src={screenshots[activeShot].src}
                alt={screenshots[activeShot].alt}
                width={1920}
                height={1080}
                className="w-full h-auto object-contain"
                priority={activeShot === 0}
              />
            </div>

            {/* Thumbnails */}
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
              {screenshots.map((shot, i) => (
                <button
                  key={i}
                  onClick={() => setActiveShot(i)}
                  className={`rounded-lg overflow-hidden border-2 transition-all focus:outline-none ${
                    activeShot === i ? 'border-emerald-400 opacity-100' : 'border-white/10 opacity-60 hover:opacity-90'
                  }`}
                >
                  <Image
                    src={shot.src}
                    alt={shot.alt}
                    width={320}
                    height={180}
                    className="w-full h-auto object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        </PanelWrapper>

        {/* ── RAPID+TCT Stand Banner ── */}
        <PanelWrapper variant="dark">
          <div
            className="w-full rounded-xl overflow-hidden relative"
            style={{ background: 'radial-gradient(ellipse at 20% 30%, #0d2b1e 0%, #050e09 55%, #000000 100%)' }}
          >
            {/* grid overlay */}
            <div className="absolute inset-0 pointer-events-none" style={{
              backgroundImage: 'linear-gradient(rgba(52,211,153,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(52,211,153,0.04) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }} />
            {/* left accent bar */}
            <div className="absolute left-0 top-0 bottom-0 w-[3px]" style={{ background: 'linear-gradient(180deg, transparent, rgb(52,211,153), transparent)' }} />

            <div className="relative z-10 flex flex-col gap-6 px-6 py-8 md:px-10 md:py-10">

              {/* three-column layout */}
              <div className="flex flex-col md:flex-row gap-6 md:gap-8">

                {/* LEFT — branding + features */}
                <div className="flex-[1.1] flex flex-col justify-between gap-4">
                  <div>
                    <span className="inline-block mb-3 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider text-emerald-400 border border-emerald-400/45 bg-emerald-400/10">
                      ⚡ RAPID + TCT 2026 · Boston · April 14–17
                    </span>
                    <div className="flex items-center gap-3 mb-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="https://static.wixstatic.com/media/51ea92_e71ea6b741a04f5ab7702815fc490709~mv2.png" alt="Chronos-AI icon" className="w-11 h-11 object-contain" />
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="https://static.wixstatic.com/media/51ea92_7917746402cc4012bae36aa231ad7d76~mv2.png" alt="Chronos-AI" className="h-5 object-contain" />
                    </div>
                    <h2 className="text-3xl md:text-4xl font-extrabold leading-tight tracking-tight mb-2">
                      <span className="text-white">Generative 3D</span><br />
                      <span className="text-emerald-400">Model Assistant</span>
                    </h2>
                    <p className="text-white/50 text-sm">AI-driven design · Real-time viewer · Desktop &amp; Mobile</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {['AI Prompt System', '3D Viewer', 'Atomic · Composite · Master', 'Import / Export', 'Modification History', 'Windows · Linux · Android'].map(tag => (
                      <span key={tag} className="px-3 py-1 rounded-full text-[11px] font-semibold text-white/70 border border-white/10 bg-white/5">{tag}</span>
                    ))}
                  </div>
                </div>

                {/* MIDDLE — about */}
                <div className="flex-1 flex flex-col justify-center">
                  <div className="rounded-xl border border-white/10 bg-white/5 p-5">
                    <p className="text-sm font-bold text-white mb-2">About Lothric Labs &amp; Chronos-AI</p>
                    <p className="text-[13px] text-white/70 leading-relaxed">
                      Lothric Labs is a veteran-owned additive manufacturing company driving innovation since 2016.
                      Chronos-AI is their flagship AI modeling assistant — describe what you need in plain language
                      and watch it become precise 3D geometry, ready for print or simulation. Three prompt tiers:
                      Atomic, Composite, and Master — for everything from fine edits to full assemblies.
                    </p>
                  </div>
                </div>

                {/* RIGHT — QR + download */}
                <div className="flex-shrink-0 md:w-52 flex flex-col items-center justify-center">
                  <div className="w-full rounded-xl border border-emerald-400/35 bg-[rgba(20,40,30,0.75)] p-5 flex flex-col items-center gap-3">
                    <div className="bg-white rounded-lg p-2 w-32 h-32 flex items-center justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAcIAAAHCAQAAAABUY/ToAAAEPUlEQVR4nO1cW26rMBCdGZD6SaQuoEshO6vuku4OwlK6gErhsxLRXM3DhFQXOXHSR5w5HyngOQLcI3seNshQhoEKiQDBzIGyFmsIZg6UtVhDMHOgrMUagpkDZS3WEMwcKGuxhmDW2EPoaOXkgDBsAHCbGvQabsdktb3b9ywBFbEekNmzYC/KGUVIYwv8RyQlDYj4xLyDRo34nt+zAFRCeigmmCz6vQhp3ySp7LVhAoBu8gbeNyKfhk1wu/t6Twrm9/VQzx+I+CLDzfjEzG8tHKe2L7rn2aDzTT8hmN/YQ4PNWyKabgLEFx2HDqjXvuieZ4PON/2EYH5dD7X+t5N5agRA6N6RZWpjgMOiFfu/eu0G96Rg1thDgwZcG5nL3p5YHWvcjk+sp+piW3DmYdoPP20BqISkCGYWfAq75vNWY560/5wifOos6PE0BPNpamssBoOeJzjGaqGhKpVAxUxIotGR5hjMS1Mnw03n8tFTbQ0NVakEup55QBiwTXpRjO77mKOkJhLv/4anvRh0OcURzHPz1PuGcSsjjcT2y8FIoGGa+0hS9dCD6Nsc6EGY4DOT+D6n12wuc0xwksAOn7o+JdDVtQ52V8gcIPkxdxrUKVJLGaWs6hEaqlAJVMwEV4QqR86tGDa37hYaEpmlwmvE9rUpga6P7Scfgj7lgnZmktwj+wkNVagEKmaCzWUKmajMf57TQGCnc0Ff/abQUI1KoFuMQ2AZoBm2FKRbZoViLqtXCXQtc5CIvpd1Hp5KlCj/5cPyQ2kByAHd9/7ppy0AlZAUwcyhTQcHZIAJeNimoqrWOgzd1KLZjs8T9upjR9/mQA/G7HTJa7twnXlniWlJVsvSWPeH5mzjfb7n5aACzoPG9uxuzxycebKaffJyfyjqZbUqga72qfcpcPdUoh+xZxs95biI/GPtR2VKoJvkGPl0zPF6WWPZ6WOUH7F9lUqga5m9LFec6/a4VVdIRyQL+j+Q/0jxXlbn//zTFoBKSIpgnheXoagEoHtvNQZjGDfAgwZo4/OkR9iz2MkoZczo2xzo0fyhJhVUzRWaHSBOTpGX8WMNWqVKoKuZnU9ZMLyISjTbKGG9bi17fdOdZhrlxxq0ypVQABZ4WG+F+tm7TvH+IjsdNddqlUA33NfRzZVWm7eWi0IiP1SvEuh23/3o39D2tNomM9RvgeiIZB9ziLmsaiVcE9uzYF5ArSH8sPF6Gb4e/ey9BP23uWcBqISkCOb3ffcD3LtOrhBYkmi558wQeeos6EGZvLMd0lJktR3SigPacvzd73ra80EX2J4imBf3UC8jkqwVsq1CIPKRFDVudSmI5iL/zzwbFMw693UI0sLF4z4gmHeaefU19gbVqgS65Xc/Ws82zlMbW546TW2xR7FmJRQA4xvnVf0/KZgZUM5gFcHMgbIWawhmDpS1WEMwc6CsxRqCmcN99dA/dtBDTqkEcVUAAAAASUVORK5CYII="
                        alt="QR Code — chronosai.v2u.us/rapid+tct/download"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="text-center">
                      <p className="text-white font-bold text-sm leading-tight mb-1">Free Preview<br />Download</p>
                      <p className="text-white/60 text-xs leading-snug mb-3">Register &amp; download your<br />exclusive tradeshow build</p>
                    </div>
                    {isExpired ? (
                      <span className="w-full text-center px-4 py-2 rounded-lg bg-white/8 border border-white/15 text-white/40 text-xs font-semibold">Preview Period Ended</span>
                    ) : (
                      <a
                        href="https://chronosai.v2u.us/rapid+tct/download"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full text-center px-4 py-2.5 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-600 text-white text-xs font-bold hover:from-emerald-400 hover:to-cyan-500 transition-all shadow-lg shadow-emerald-700/30"
                      >
                        ⬇ Download Free Preview
                      </a>
                    )}
                  </div>
                </div>

              </div>

              {/* footer */}
              <div className="border-t border-white/10 pt-4 flex items-center justify-between">
                <span className="text-white font-bold text-xs tracking-[0.2em] uppercase">chronosai.v2u.us</span>
                <span className="text-white/40 text-xs">lothriclabs.com · admin@v2u.us</span>
              </div>

            </div>
          </div>
        </PanelWrapper>

        {/* ── ChronosAI Consumer ── */}
        <PanelWrapper variant="dark">
          <Section
            id="chronosai-main"
            title={
              <div className="flex items-center gap-3">
                <Image src="/ChronosAI_Consumer.png" alt="ChronosAI Consumer" width={50} height={50} className="object-contain rounded" />
                <span>ChronosAI <span className="text-sm opacity-75 font-normal">Patent Pending</span></span>
              </div>
            }
            body="AI-powered 3D modeling and printing platform for hobbyists, makers, and individual creators. ChronosAI harnesses the power of AI for model retrieval, intelligent modification, and optimized output to standard 3D printers. Web-based and native app versions available."
            variant="dark"
          >
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
