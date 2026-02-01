'use client'


import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Section from '@/components/Section'
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
    <main className="min-h-screen bg-(--site-bg) text-(--site-fg)">
      <Header />

      <div className="pt-24 px-4 md:px-4 space-y-4">
        {/* Hero Section */}
        <div className="rounded-xl p-6 mb-4 bg-[#dfdfdf]">
          <Section
            variant="light"
            title=""
            body=""
            rounded={true}
          >
            <div className="text-center text-black">
              <h1 className="mb-6 text-4xl font-bold md:text-6xl">Join Our Team</h1>
              <p className="text-xl md:text-2xl opacity-90">
                Build the future of media automation with us
              </p>
            </div>
          </Section>
        </div>

        {/* Values Section */}
        <div className="rounded-xl p-6 mb-4 bg-[#212121ff]">
          <Section
            title="Why v2u?"
            rounded={true}
            className="text-white"
          >
            <div className="grid gap-6 md:grid-cols-2">
              {values.map((value, index) => (
                <PanelWrapper key={index} className="bg-transparent">
                  <h3 className="mb-3 text-lg font-semibold text-white">{value.title}</h3>
                  <p className="opacity-90 text-gray-300">{value.description}</p>
                </PanelWrapper>
              ))}
            </div>
          </Section>
        </div>

        {/* Open Positions Section */}
        <div className="rounded-xl p-6 mb-4 bg-[#dfdfdf]">
          <Section
            title="Open Positions"
            variant="light"
            rounded={true}
          >
            <div className="grid gap-6 md:grid-cols-2">
              {openPositions.map((position, index) => (
                <PanelWrapper key={index} variant="light" className="bg-transparent">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-black">{position.title}</h3>
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
          </Section>
        </div>

        {/* Culture Section */}
        <div className="rounded-xl p-6 mb-4 bg-[#212121ff]">
          <Section
            title="Our Culture"
            rounded={true}
            className="text-white"
          >
            <p className="mb-8">
              We&apos;re a team of passionate engineers, designers, and media professionals working together to revolutionize content creation. We value collaboration, innovation, and making a real impact in the media industry.
            </p>
            <div className="grid gap-6 md:grid-cols-3">
              <div>
                <h3 className="mb-2 font-semibold">Remote-First</h3>
                <p className="text-sm text-gray-300">Work from anywhere with flexible hours</p>
              </div>
              <div>
                <h3 className="mb-2 font-semibold">Tech Stack</h3>
                <p className="text-sm text-gray-300">Modern tools and cutting-edge technologies</p>
              </div>
              <div>
                <h3 className="mb-2 font-semibold">Growth</h3>
                <p className="text-sm text-gray-300">Continuous learning and career development</p>
              </div>
            </div>
          </Section>
        </div>

        {/* Contact Section */}
        <div className="rounded-xl p-6 mb-4 bg-[#dfdfdf]">
          <Section
            title="Ready to Apply?"
            variant="light"
            rounded={true}
          >
            <p className="mb-8 text-gray-700">
              Don&apos;t see a position that matches your skills? We&apos;re always interested in hearing from talented individuals.
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h3 className="font-semibold text-black">General Inquiries</h3>
                <p className="text-sm text-gray-600">careers@v2u.us</p>
              </div>
              <div>
                <h3 className="font-semibold text-black">Recruiting Team</h3>
                <p className="text-sm text-gray-600">+1 (720) 656-9650</p>
              </div>
            </div>
            <div className="mt-8">
              <a
                href="mailto:careers@v2u.us"
                className="inline-block rounded-lg bg-[#0F8378FF] px-8 py-3 text-white hover:bg-[#015451FF]"
              >
                Send Us Your Resume
              </a>
            </div>
          </Section>
        </div>
      </div>

      <Footer />
    </main>
  )
}