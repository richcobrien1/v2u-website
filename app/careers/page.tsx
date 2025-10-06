'use client'

import Header from '@/components/Header'
import Footer from '@/components/Footer'
import PanelWrapper from '@/components/PanelWrapper'

export default function CareersPage() {
  const openPositions = [
    {
      title: "Senior Software Engineer",
      department: "Engineering",
      location: "Centennial, CO (Remote OK)",
      type: "Full-time",
      description: "Build scalable media processing systems and AI-powered automation tools."
    },
    {
      title: "Product Manager",
      department: "Product",
      location: "Centennial, CO (Remote OK)",
      type: "Full-time",
      description: "Drive product strategy and roadmap for our media automation platform."
    },
    {
      title: "DevOps Engineer",
      department: "Engineering",
      location: "Centennial, CO (Remote OK)",
      type: "Full-time",
      description: "Design and maintain our cloud infrastructure and deployment pipelines."
    },
    {
      title: "UX/UI Designer",
      department: "Design",
      location: "Centennial, CO (Remote OK)",
      type: "Full-time",
      description: "Create intuitive interfaces for complex media production workflows."
    }
  ]

  const values = [
    {
      title: "Innovation First",
      description: "We encourage creative problem-solving and embrace new technologies."
    },
    {
      title: "Work-Life Balance",
      description: "Flexible schedules and remote work options to support your lifestyle."
    },
    {
      title: "Continuous Learning",
      description: "Professional development budget and conference attendance support."
    },
    {
      title: "Impact Driven",
      description: "Your work directly impacts how media is created and distributed worldwide."
    }
  ]

  return (
    <main className="min-h-screen bg-[var(--site-bg)] text-[var(--site-fg)]">
      <Header />

      <div className="pt-24">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#212121ff] to-[#111111ff] py-20">
          <div className="absolute inset-0 bg-black/40"></div>
          <div className="relative mx-auto max-w-4xl px-4 text-center text-white">
            <h1 className="mb-6 text-4xl font-bold md:text-6xl">Join Our Team</h1>
            <p className="text-xl md:text-2xl opacity-90">
              Build the future of media automation with us
            </p>
          </div>
        </div>

        {/* Values Section */}
        <div className="py-16">
          <div className="mx-auto max-w-6xl px-4">
            <h2 className="mb-12 text-center text-3xl font-bold">Why v2u?</h2>
            <div className="grid gap-6 md:grid-cols-2">
              {values.map((value, index) => (
                <PanelWrapper key={index} variant={index % 2 === 0 ? "dark" : "light"}>
                  <h3 className="mb-3 text-lg font-semibold">{value.title}</h3>
                  <p className="opacity-90">{value.description}</p>
                </PanelWrapper>
              ))}
            </div>
          </div>
        </div>

        {/* Open Positions Section */}
        <div className="py-16 bg-gradient-to-r from-[#dfdfdfff] to-[#f0f0f0ff]">
          <div className="mx-auto max-w-6xl px-4">
            <h2 className="mb-12 text-center text-3xl font-bold">Open Positions</h2>
            <div className="grid gap-6 md:grid-cols-2">
              {openPositions.map((position, index) => (
                <PanelWrapper key={index} variant="light">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold">{position.title}</h3>
                    <div className="mt-2 flex flex-wrap gap-2 text-sm">
                      <span className="rounded bg-[#0F8378FF] px-2 py-1 text-white">{position.department}</span>
                      <span className="rounded bg-gray-600 px-2 py-1 text-white">{position.type}</span>
                    </div>
                  </div>
                  <p className="mb-3 text-sm text-gray-600">{position.location}</p>
                  <p className="mb-4 text-gray-700">{position.description}</p>
                  <button className="rounded bg-[#0F8378FF] px-4 py-2 text-sm text-white hover:bg-[#015451FF]">
                    Apply Now
                  </button>
                </PanelWrapper>
              ))}
            </div>
          </div>
        </div>

        {/* Culture Section */}
        <div className="py-16">
          <div className="mx-auto max-w-4xl px-4 text-center">
            <PanelWrapper variant="dark">
              <h2 className="mb-6 text-2xl font-bold">Our Culture</h2>
              <p className="mb-8 text-gray-300">
                We&apos;re a team of passionate engineers, designers, and media professionals working together to revolutionize content creation. We value collaboration, innovation, and making a real impact in the media industry.
              </p>
              <div className="grid gap-6 md:grid-cols-3">
                <div>
                  <h3 className="mb-2 font-semibold">Remote-First</h3>
                  <p className="text-sm text-gray-400">Work from anywhere with flexible hours</p>
                </div>
                <div>
                  <h3 className="mb-2 font-semibold">Tech Stack</h3>
                  <p className="text-sm text-gray-400">Modern tools and cutting-edge technologies</p>
                </div>
                <div>
                  <h3 className="mb-2 font-semibold">Growth</h3>
                  <p className="text-sm text-gray-400">Continuous learning and career development</p>
                </div>
              </div>
            </PanelWrapper>
          </div>
        </div>

        {/* Contact Section */}
        <div className="py-16 bg-gradient-to-r from-[#0F8378FF] to-[#015451FF]">
          <div className="mx-auto max-w-4xl px-4 text-center text-white">
            <h2 className="mb-6 text-2xl font-bold">Ready to Apply?</h2>
            <p className="mb-8 opacity-90">
              Don&apos;t see a position that matches your skills? We&apos;re always interested in hearing from talented individuals.
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h3 className="font-semibold">General Inquiries</h3>
                <p className="text-sm opacity-75">careers@v2u.us</p>
              </div>
              <div>
                <h3 className="font-semibold">Recruiting Team</h3>
                <p className="text-sm opacity-75">+1 (720) 656-9650</p>
              </div>
            </div>
            <div className="mt-8">
              <a
                href="mailto:careers@v2u.us"
                className="inline-block rounded-lg bg-white px-8 py-3 text-[#0F8378FF] hover:bg-gray-100"
              >
                Send Us Your Resume
              </a>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}