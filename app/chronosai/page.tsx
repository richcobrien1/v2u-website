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

  useEffect(() => {
    const cookies = document.cookie.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=')
      acc[key] = value
      return acc
    }, {} as Record<string, string>)

    setHasAccess(cookies['v2u-access'] === 'granted')
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

        {/* ── RAPID+TCT Stand Banner Display ── */}
        <PanelWrapper variant="dark">
          <div className="px-4 py-6 md:px-8">
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="text-emerald-400 text-xs font-bold uppercase tracking-widest">RAPID+TCT 2026 · Boston · Apr 14–17</span>
                </div>
                <h2 className="text-2xl font-bold text-white">Trade Show Display Stand</h2>
              </div>
              <a
                href="/downloads/ChronosAI-Stand-Portrait.html"
                download="ChronosAI-Stand-Portrait.html"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/8 border border-white/15 text-white/70 hover:text-white hover:bg-white/15 text-sm transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download Portrait Version
              </a>
            </div>

            {/* ── Embedded Landscape Stand Banner ── */}
            <div className="w-full rounded-xl overflow-hidden border border-emerald-400/20"
              style={{
                background: 'radial-gradient(ellipse at 20% 30%, #0d2b1e 0%, #050e09 55%, #000000 100%)',
                backgroundImage: `radial-gradient(ellipse at 20% 30%, #0d2b1e 0%, #050e09 55%, #000000 100%)`,
              }}
            >
              {/* Grid overlay */}
              <div className="relative w-full p-6 md:p-8"
                style={{
                  backgroundImage: 'linear-gradient(rgba(52,211,153,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(52,211,153,0.04) 1px,transparent 1px)',
                  backgroundSize: '40px 40px',
                }}
              >
                {/* Left accent bar */}
                <div className="absolute top-0 left-0 bottom-0 w-0.5"
                  style={{background:'linear-gradient(180deg,transparent,rgb(52,211,153),transparent)'}}
                ></div>

                <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">

                  {/* LEFT: Branding + features */}
                  <div className="flex-1 flex flex-col justify-between gap-6">
                    <div>
                      <div className="inline-block mb-3 px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase"
                        style={{background:'rgba(52,211,153,0.12)',border:'1px solid rgba(52,211,153,0.45)',color:'rgb(52,211,153)'}}>
                        ⚡ RAPID + TCT 2026 · Boston · April 14–17
                      </div>
                      <div className="flex items-center gap-3 mb-3">
                        <Image src="/ChronosAI_Consumer.png" alt="Chronos-AI" width={44} height={44} className="object-contain" />
                        <span className="text-3xl md:text-4xl font-extrabold leading-tight">
                          <span className="text-white">Generative 3D</span><br/>
                          <span style={{color:'rgb(52,211,153)'}}>Model Assistant</span>
                        </span>
                      </div>
                      <p className="text-white/50 text-sm mb-4">AI-driven design · Real-time viewer · Desktop &amp; Mobile</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {['AI Prompt System','3D Viewer','Atomic · Composite · Master','Import / Export','Modification History','Windows · Linux · Android'].map(tag => (
                        <span key={tag} className="px-3 py-1 rounded-full text-xs font-semibold"
                          style={{background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.11)',color:'rgba(255,255,255,0.72)'}}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* MIDDLE: About panel */}
                  <div className="flex-1 flex items-center">
                    <div className="w-full rounded-xl p-5"
                      style={{background:'rgba(33,33,33,0.6)',border:'1px solid rgba(255,255,255,0.1)'}}>
                      <p className="text-white font-bold text-sm mb-3">About Lothric Labs &amp; Chronos-AI</p>
                      <p className="text-sm leading-relaxed" style={{color:'rgba(255,255,255,0.72)'}}>
                        Lothric Labs is a veteran-owned additive manufacturing company driving innovation since 2016. Chronos-AI is their flagship AI modeling assistant — describe what you need in plain language and watch it become precise 3D geometry, ready for print or simulation. Three prompt tiers: Atomic, Composite, and Master — for everything from fine edits to full assemblies.
                      </p>
                    </div>
                  </div>

                  {/* RIGHT: QR code */}
                  <div className="flex-shrink-0 flex items-center justify-center lg:w-52">
                    <div className="rounded-xl p-4 flex flex-col items-center w-full"
                      style={{background:'rgba(20,40,30,0.75)',border:'1px solid rgba(52,211,153,0.35)'}}>
                      <div className="bg-white rounded-lg p-2 mb-3 w-32 h-32 flex items-center justify-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAcIAAAHCAQAAAABUY/ToAAAEPUlEQVR4nO1cW26rMBCdGZD6SaQuoEshO6vuku4OwlK6gErhsxLRXM3DhFQXOXHSR5w5HingOQLcI3seNshQhoEKiQDBzIGyFmsIZg6UtVhDMHOgrMUagpkDZS3WEMwcKGuxhmDW2EPoaOXkgDBsAHCbGvQabsdktb3b9ywBFbEekNmzYC/KGUVIYwv8RyQlDYj4xLyDRo34nt+zAFRCeigmmCz6vQhp3ySp7LVhAoBu8gbeNyKfhk1wu/t6Twrm9/VQzx+I+CLDzfjEzG8tHKe2L7rn2aDzTT8hmN/YQ4PNWyKabgLEFx2HDqjXvuieZ4PON/2EYH5dD7X+t5N5agRA6N6RZWpjgMOiFfu/eu0G96Rg1thDgwZcG5nL3p5YHWvcjk+sp+piW3DmYdoPP20BqISkCGYWfAq75vNWY560/5wifOos6PE0BPNpamssBoOeJzjGaqGhKpVAxUxIotGR5hjMS1Mnw03n8tFTbQ0NVakEup55QBiwTXpRjO77mKOkJhLv/4anvRh0OcURzHPz1PuGcSsjjcT2y8FIoGGa+0hS9dCD6Nsc6EGY4DOT+D6n12wuc0xwksAOn7o+JdDVtQ52V8gcIPkxdxrUKVJLGaWs6hEaqlAJVMwEV4QqR86tGDa37hYaEpmlwmvE9rUpga6P7Scfgj7lgnZmktwj+wkNVagEKmaCzWUKmajMf57TQGCnc0Ff/abQUI1KoFuMQ2AZoBm2FKRbZoViLqtXCXQtc5CIvpd1Hp5KlCj/5cPyQ2kByAHd9/7ppy0AlZAUwcyhTQcHZIAJeNimoqrWOgzd1KLZjs8T9upjR9/mQA/G7HTJa7twnXlniWlJVsvSWPeH5mzjfb7n5aACzoPG9uxuzxycebKaffJyfyjqZbUqga72qfcpcPdUoh+xZxs95biI/GPtR2VKoJvkGPl0zPF6WWPZ6WOUH7F9lUqga5m9LFec6/a4VVdIRyQL+j+Q/0jxXlbn//zTFoBKSIpgnheXoagEoHtvNQZjGDfAgwZo4/OkR9iz2MkoZczo2xzo0fyhJhVUzRWaHSBOTpGX8WMNWqVKoKuZnU9ZMLyISjTbKGG9bi17fdOdZhrlxxq0ypVQABZ4WG+F+tm7TvH+IjsdNddqlUA33NfRzZVWm7eWi0IiP1SvEuh23/3o39D2tNomM9RvgeiIZB9ziLmsaiVcE9uzYF5ArSH8sPF6Gb4e/ey9BP23uWcBqISkCOb3ffcD3LtOrhBYkmi558wQeeos6EGZvLMd0lJktR3SigPacvzd73ra80EX2J4imBf3UC8jkqwVsq1CIPKRFDVudSmI5iL/zzwbFMw693UI0sLF4z4gmHeaefU19gbVqgS65Xc/Ws82zlMbW546TW2xR7FmJRQA4xvnVf0/KZgZUM5gFcHMgbIWawhmDpS1WEMwc6CsxRqCmcN99dA/dtBDTqkEcVUAAAAASUVORK5CYII="
                          alt="QR Code — chronosai.v2u.us"
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <p className="text-white font-bold text-sm text-center mb-1">Free Preview<br/>Download</p>
                      <p className="text-xs text-center mb-2" style={{color:'rgba(255,255,255,0.6)'}}>Register &amp; download your<br/>exclusive tradeshow build</p>
                      <p className="text-xs font-bold text-center" style={{color:'rgb(52,211,153)',letterSpacing:'0.05em'}}>↑ Scan to download free</p>
                    </div>
                  </div>

                </div>

                {/* Footer */}
                <div className="mt-6 pt-4 flex items-center justify-between"
                  style={{borderTop:'1px solid rgba(255,255,255,0.13)'}}>
                  <span className="text-white font-bold text-sm tracking-widest uppercase">chronosai.v2u.us</span>
                  <span className="text-xs" style={{color:'rgba(255,255,255,0.4)'}}>lothriclabs.com &nbsp;·&nbsp; admin@v2u.us</span>
                </div>

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
