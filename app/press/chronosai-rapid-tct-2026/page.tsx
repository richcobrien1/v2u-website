'use client'
export const dynamic = 'force-dynamic'

import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'
import Image from 'next/image'

export default function ChronosAIPressReleasePage() {
  return (
    <main className="w-full h-auto pt-12 bg-bgLight dark:bg-bgDark text-black dark:text-white transition-colors duration-300">
      <Header />

      <div className="page-content max-w-4xl mx-auto px-4 py-10">

        {/* Back link */}
        <Link href="/press" className="inline-flex items-center gap-2 text-emerald-500 hover:text-emerald-400 text-sm font-medium mb-8 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Press Center
        </Link>

        {/* Header block */}
        <div className="mb-8 pb-8 border-b border-white/10 dark:border-white/10">
          <div className="flex items-center gap-2 mb-4">
            <span className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-400 text-xs font-bold uppercase tracking-wider">Press Release</span>
            <span className="text-white/40 dark:text-white/40 text-sm">For Immediate Release</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-extrabold text-white leading-tight mb-4">
            Chronos-AI Makes World Debut at RAPID+TCT 2026 in Boston, Showcasing Patent-Pending AI-Driven 3D Modeling Technology
          </h1>

          <div className="flex flex-wrap gap-4 text-sm text-white/50">
            <span>April 13, 2026</span>
            <span>·</span>
            <span>Boston, Massachusetts</span>
            <span>·</span>
            <span>Contact: <a href="mailto:press@v2u.us" className="text-emerald-400 hover:text-emerald-300">press@v2u.us</a></span>
          </div>
        </div>

        {/* Chronos-AI icon */}
        <div className="flex justify-center mb-8">
          <Image src="/ChronosAI_Consumer.png" alt="Chronos-AI" width={120} height={120} className="object-contain" />
        </div>

        {/* Press release body */}
        <div className="prose prose-invert max-w-none space-y-6 text-white/85 leading-relaxed text-base">

          <p className="text-lg font-semibold text-white">
            BOSTON, MA — Lothric Labs and v2u today announced the public preview of Chronos-AI, a next-generation generative 3D modeling assistant, at the RAPID+TCT 2026 trade show held April 14–17 at the Boston Convention &amp; Exhibition Center.
          </p>

          <p>
            Chronos-AI is a patent-pending AI-powered platform that allows engineers, designers, and manufacturers to describe 3D geometry in plain language and instantly receive precise, print-ready models — no manual CAD experience required. The platform features three AI prompt tiers: <strong className="text-white">Atomic</strong> for granular edits, <strong className="text-white">Composite</strong> for multi-part assemblies, and <strong className="text-white">Master</strong> for complex, full-system builds.
          </p>

          <p>
            The RAPID+TCT debut marks the first time Chronos-AI has been shown publicly, giving attendees hands-on access to the platform&apos;s real-time 3D viewer, voice-activated AI prompt system, and one-click export to standard 3D printer formats. The application is available as a web app and as native desktop builds for Windows, Linux, and Android.
          </p>

          <blockquote className="border-l-4 border-emerald-400 pl-6 py-2 bg-white/5 rounded-r-lg">
            <p className="italic text-white/90">
              &ldquo;Chronos-AI is the result of years of real-world manufacturing experience combined with cutting-edge AI. We built it because we were frustrated with tools that required expert training just to make a simple part. Our goal is to make professional 3D modeling accessible to anyone who can describe what they need.&rdquo;
            </p>
            <footer className="mt-2 text-sm text-white/50 not-italic">— Lothric Labs, Founder</footer>
          </blockquote>

          <p>
            Lothric Labs is a veteran-owned additive manufacturing company that has been driving innovation in 3D printing since 2016. The company partnered with v2u — a technology platform building real-world AI applications — to bring Chronos-AI from concept to production-ready software.
          </p>

          <h2 className="text-xl font-bold text-white mt-8 mb-2">Key Features at Preview Launch</h2>
          <ul className="space-y-2 list-none pl-0">
            {[
              'AI Prompt System — Atomic, Composite, and Master tiers for any complexity level',
              'Real-Time 3D Viewer — Solid, wireframe, and combined rendering modes',
              'Voice-Activated Commands — Hands-free control of the full modeling workflow',
              'Import / Export — STL and standard 3D print formats supported',
              'Modification History — Full undo/redo and session persistence',
              'Cross-Platform — Web, Windows, Linux, and Android native apps',
            ].map(f => (
              <li key={f} className="flex items-start gap-3">
                <span className="mt-1 w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0"></span>
                <span>{f}</span>
              </li>
            ))}
          </ul>

          <h2 className="text-xl font-bold text-white mt-8 mb-2">About v2u</h2>
          <p>
            v2u is an AI innovation platform that builds, operates, and launches real-world AI-powered applications. From additive manufacturing to logistics, media, and enterprise automation — v2u partners with domain experts to create products that solve genuine problems. Learn more at <a href="https://www.v2u.us" className="text-emerald-400 hover:text-emerald-300">www.v2u.us</a>.
          </p>

          <h2 className="text-xl font-bold text-white mt-8 mb-2">About Lothric Labs</h2>
          <p>
            Lothric Labs is a veteran-owned additive manufacturing and engineering company headquartered in the United States. Founded in 2016, Lothric Labs specializes in precision 3D printing solutions for commercial, industrial, and aerospace applications. Learn more at <a href="https://www.lothriclabs.com" className="text-emerald-400 hover:text-emerald-300">lothriclabs.com</a>.
          </p>

          <h2 className="text-xl font-bold text-white mt-8 mb-2">Visit Us at RAPID+TCT 2026</h2>
          <div className="bg-white/5 border border-emerald-400/20 rounded-xl p-6">
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-white/50 uppercase tracking-wider text-xs mb-1">Event</p>
                <p className="text-white font-semibold">RAPID+TCT 2026</p>
              </div>
              <div>
                <p className="text-white/50 uppercase tracking-wider text-xs mb-1">Dates</p>
                <p className="text-white font-semibold">Tuesday, April 14 – Friday, April 17, 2026</p>
              </div>
              <div>
                <p className="text-white/50 uppercase tracking-wider text-xs mb-1">Venue</p>
                <p className="text-white font-semibold">Boston Convention &amp; Exhibition Center</p>
                <p className="text-white/60">Boston, Massachusetts</p>
              </div>
              <div>
                <p className="text-white/50 uppercase tracking-wider text-xs mb-1">More Info</p>
                <a href="https://www.rapid3devent.com" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:text-emerald-300 font-semibold">rapid3devent.com</a>
              </div>
            </div>
          </div>

          <div className="mt-10 pt-8 border-t border-white/10">
            <p className="text-white/50 text-sm font-semibold uppercase tracking-wider mb-2">Press Contact</p>
            <p className="text-white font-medium">v2u Media Relations</p>
            <p className="text-white/60 text-sm">
              <a href="mailto:press@v2u.us" className="text-emerald-400 hover:text-emerald-300">press@v2u.us</a>
              &nbsp;·&nbsp;
              <a href="tel:+17205197257" className="text-emerald-400 hover:text-emerald-300">+1 (720) 519-7257</a>
              &nbsp;·&nbsp;
              <a href="https://www.v2u.us" className="text-emerald-400 hover:text-emerald-300">www.v2u.us</a>
            </p>
          </div>

          <p className="text-white/30 text-xs mt-6">###</p>

        </div>
      </div>

      <Footer />
    </main>
  )
}
