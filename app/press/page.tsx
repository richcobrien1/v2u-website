'use client'

import Header from '@/components/Header'
import Footer from '@/components/Footer'
import PanelWrapper from '@/components/PanelWrapper'

export default function PressPage() {
  const pressReleases = [
    {
      title: "v2u Launches Revolutionary Media Automation Platform",
      date: "October 6, 2025",
      excerpt: "v2u introduces cutting-edge AI-powered tools for content creators and media professionals.",
      link: "#"
    },
    {
      title: "v2u Secures Series A Funding to Expand Media Technology Solutions",
      date: "September 15, 2025",
      excerpt: "Strategic investment will accelerate development of next-generation content automation tools.",
      link: "#"
    },
    {
      title: "v2u Partners with Leading Broadcasters for Content Innovation",
      date: "August 22, 2025",
      excerpt: "New partnerships bring advanced media automation to major broadcasting networks.",
      link: "#"
    }
  ]

  const mediaKit = [
    { name: "Company Logo (PNG)", size: "2.1 MB", link: "#" },
    { name: "Company Logo (SVG)", size: "45 KB", link: "#" },
    { name: "Brand Guidelines", size: "5.2 MB", link: "#" },
    { name: "Product Screenshots", size: "12.8 MB", link: "#" },
    { name: "Executive Photos", size: "8.4 MB", link: "#" }
  ]

  return (
    <main className="min-h-screen bg-[var(--site-bg)] text-[var(--site-fg)]">
      <Header />

      <div className="pt-24">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#212121ff] to-[#111111ff] py-20">
          <div className="absolute inset-0 bg-black/40"></div>
          <div className="relative mx-auto max-w-4xl px-4 text-center text-white">
            <h1 className="mb-6 text-4xl font-bold md:text-6xl">Press Center</h1>
            <p className="text-xl md:text-2xl opacity-90">
              Latest news, press releases, and media resources
            </p>
          </div>
        </div>

        {/* Press Releases Section */}
        <div className="py-16">
          <div className="mx-auto max-w-6xl px-4">
            <h2 className="mb-12 text-center text-3xl font-bold">Press Releases</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {pressReleases.map((release, index) => (
                <PanelWrapper key={index} variant={index % 2 === 0 ? "dark" : "light"}>
                  <div className="mb-4 text-sm opacity-75">{release.date}</div>
                  <h3 className="mb-3 text-lg font-semibold">{release.title}</h3>
                  <p className="mb-4 text-sm opacity-90">{release.excerpt}</p>
                  <a
                    href={release.link}
                    className="text-sm font-medium underline hover:no-underline"
                  >
                    Read More →
                  </a>
                </PanelWrapper>
              ))}
            </div>
          </div>
        </div>

        {/* Media Kit Section */}
        <div className="py-16 bg-gradient-to-r from-[#dfdfdfff] to-[#f0f0f0ff]">
          <div className="mx-auto max-w-4xl px-4">
            <h2 className="mb-8 text-center text-3xl font-bold">Media Kit</h2>
            <PanelWrapper variant="light">
              <p className="mb-6 text-center">
                Download our complete media kit containing logos, brand guidelines, and high-resolution images for press use.
              </p>
              <div className="grid gap-4 md:grid-cols-2">
                {mediaKit.map((item, index) => (
                  <div key={index} className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-gray-600">{item.size}</div>
                    </div>
                    <a
                      href={item.link}
                      className="rounded bg-[#0F8378FF] px-4 py-2 text-sm text-white hover:bg-[#015451FF]"
                    >
                      Download
                    </a>
                  </div>
                ))}
              </div>
            </PanelWrapper>
          </div>
        </div>

        {/* Contact Section */}
        <div className="py-16">
          <div className="mx-auto max-w-4xl px-4 text-center">
            <PanelWrapper variant="dark">
              <h2 className="mb-6 text-2xl font-bold">Press Inquiries</h2>
              <p className="mb-6 text-gray-300">
                For press inquiries, interviews, or media requests, please contact our press team.
              </p>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="text-left">
                  <h3 className="font-semibold">Press Contact</h3>
                  <p className="text-sm text-gray-400">press@v2u.us</p>
                  <p className="text-sm text-gray-400">+1 (720) 656-9650</p>
                </div>
                <div className="text-left">
                  <h3 className="font-semibold">Media Relations</h3>
                  <p className="text-sm text-gray-400">Available for interviews and media appearances</p>
                  <p className="text-sm text-gray-400">Response time: 24-48 hours</p>
                </div>
              </div>
            </PanelWrapper>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}