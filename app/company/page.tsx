'use client'

import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Section from '@/components/Section'
import PanelWrapper from '@/components/PanelWrapper'

export default function CompanyPage() {
  return (
    <main className="min-h-screen bg-[var(--site-bg)] text-[var(--site-fg)]">
      <Header />

      <div className="pt-24">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#0F8378FF] to-[#015451FF] py-20">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative mx-auto max-w-4xl px-4 text-center text-white">
            <h1 className="mb-6 text-4xl font-bold md:text-6xl">About v2u</h1>
            <p className="text-xl md:text-2xl opacity-90">
              Revolutionizing media automation and content delivery systems
            </p>
          </div>
        </div>

        {/* Mission Section */}
        <div className="px-4 md:px-4 space-y-4">
          <div className="rounded-xl p-6 mb-4">
            <Section
              title="Our Mission"
              body="At v2u, we're dedicated to empowering creators, businesses, and organizations with cutting-edge automation tools that streamline media production and distribution. Our platform combines AI-driven workflows with robust infrastructure to transform how content is created, managed, and delivered to audiences worldwide."
              variant="light"
              background={{ from: '#0F8378FF', to: '#dfdfdfff' }}
              rounded={true}
            />
          </div>
        </div>

        {/* Values Section */}
        <div className="px-4 md:px-4 space-y-4">
          <div className="rounded-xl p-6 mb-4 bg-[#212121ff] text-white">
            <Section
              title="Our Values"
              variant="dark"
              background={{ from: '#015451FF', to: '#212121ff' }}
              rounded={true}
            >
              <div className="grid gap-8 md:grid-cols-3">
                <PanelWrapper variant="dark">
                  <h3 className="mb-4 text-xl font-semibold">Innovation</h3>
                  <p className="text-gray-300">
                    We push the boundaries of technology to create solutions that anticipate the future needs of content creators and media professionals.
                  </p>
                </PanelWrapper>

                <PanelWrapper variant="light">
                  <h3 className="mb-4 text-xl font-semibold">Reliability</h3>
                  <p className="text-gray-700">
                    Our systems are built for enterprise-grade performance, ensuring your content reaches your audience when and how it should.
                  </p>
                </PanelWrapper>

                <PanelWrapper variant="dark">
                  <h3 className="mb-4 text-xl font-semibold">Simplicity</h3>
                  <p className="text-gray-300">
                    Complex technology should be easy to use. We design intuitive interfaces that make powerful tools accessible to everyone.
                  </p>
                </PanelWrapper>
              </div>
            </Section>
          </div>
        </div>

        {/* Team Section */}
        <div className="px-4 md:px-4 space-y-4">
          <div className="rounded-xl p-6 mb-4">
            <Section
              title="Our Team"
              body="v2u was founded by a team of experienced engineers, designers, and media professionals who understand the challenges of modern content creation. Our diverse backgrounds in software development, broadcast media, and digital marketing enable us to build solutions that truly serve our users' needs."
              variant="light"
              background={{ from: '#0F8378FF', to: '#dfdfdfff' }}
              rounded={true}
            />
          </div>
        </div>

        {/* Contact Section */}
        <div className="px-4 md:px-4 space-y-4">
          <div className="rounded-xl p-6 mb-4 bg-[#212121ff] text-white">
            <Section
              title="Get in Touch"
              variant="dark"
              background={{ from: '#015451FF', to: '#212121ff' }}
              rounded={true}
            >
              <p className="mb-6 text-gray-300">
                Ready to transform your media workflow? We&apos;d love to hear from you.
              </p>
              <div className="grid gap-4 text-left md:grid-cols-2">
                <div>
                  <h3 className="font-semibold">Business Inquiries</h3>
                  <p className="text-sm text-gray-400">admin@v2u.us</p>
                </div>
                <div>
                  <h3 className="font-semibold">Support</h3>
                  <p className="text-sm text-gray-400">support@v2u.us</p>
                </div>
                <div>
                  <h3 className="font-semibold">Phone</h3>
                  <p className="text-sm text-gray-400">+1 (720) 656-9650</p>
                </div>
                <div>
                  <h3 className="font-semibold">Address</h3>
                  <p className="text-sm text-gray-400">9200 E Mineral Avenue, Flr 100<br />Centennial, CO 80112</p>
                </div>
              </div>
            </Section>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}