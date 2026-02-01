'use client'
export const dynamic = 'force-dynamic'



import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Section from '@/components/Section'
import PanelWrapper from '@/components/PanelWrapper'

export default function CompanyPage() {
  return (
    <main className="min-h-screen bg-(--site-bg) text-(--site-fg)">
      <Header />

      <div className="pt-24 px-4 md:px-4 space-y-4">
        {/* Hero Section */}
        <div className="rounded-xl p-6 mb-4 bg-[#0F8378FF]">
          <Section
            title=""
            body=""
            rounded={true}
          >
            <div className="text-center text-white">
              <h1 className="mb-6 text-4xl font-bold md:text-6xl">About v2u</h1>
              <p className="text-xl md:text-2xl opacity-90">
                Revolutionizing media automation and content delivery systems
              </p>
            </div>
          </Section>
        </div>

        {/* Mission Section */}
        <div className="rounded-xl p-6 mb-4 bg-[#212121ff]">
          <Section
            title="Our Mission"
            body="At v2u, we're dedicated to empowering creators, businesses, and organizations with cutting-edge automation tools that streamline media production and distribution. Our platform combines AI-driven workflows with robust infrastructure to transform how content is created, managed, and delivered to audiences worldwide."
            variant="dark"
            rounded={true}
          />
        </div>

        {/* Values Section */}
        <div className="rounded-xl p-6 mb-4 bg-[#dfdfdf]">
          <Section
            title="Our Values"
            variant="light"
            rounded={true}
          >
            <div className="grid gap-8 md:grid-cols-3">
              <PanelWrapper variant="light" className="bg-transparent">
                <h3 className="mb-4 text-xl font-semibold text-black">Innovation</h3>
                <p className="text-gray-700">
                  We push the boundaries of technology to create solutions that anticipate the future needs of content creators and media professionals.
                </p>
              </PanelWrapper>

              <PanelWrapper variant="light" className="bg-transparent">
                <h3 className="mb-4 text-xl font-semibold text-black">Reliability</h3>
                <p className="text-gray-700">
                  Our systems are built for enterprise-grade performance, ensuring your content reaches your audience when and how it should.
                </p>
              </PanelWrapper>

              <PanelWrapper variant="light" className="bg-transparent">
                <h3 className="mb-4 text-xl font-semibold text-black">Simplicity</h3>
                <p className="text-gray-700">
                  Complex technology should be easy to use. We design intuitive interfaces that make powerful tools accessible to everyone.
                </p>
              </PanelWrapper>
            </div>
          </Section>
        </div>

        {/* Team Section */}
        <div className="rounded-xl p-6 mb-4 bg-[#015451FF]">
          <Section
            title="Our Team"
            body="v2u was founded by a team of experienced engineers, designers, and media professionals who understand the challenges of modern content creation. Our diverse backgrounds in software development, broadcast media, and digital marketing enable us to build solutions that truly serve our users' needs."
            rounded={true}
            className="text-white"
          />
        </div>

        {/* Contact Section */}
        <div className="rounded-xl p-6 mb-4 bg-[#dfdfdf]">
          <Section
            title="Get in Touch"
            variant="light"
            rounded={true}
          >
            <p className="mb-6 text-gray-700">
              Ready to transform your media workflow? We&apos;d love to hear from you.
            </p>
            <div className="grid gap-4 text-left md:grid-cols-2">
              <div className="p-4 rounded-lg bg-[#0F8378FF] text-white">
                <h3 className="font-semibold">Business Inquiries</h3>
                <p className="text-sm opacity-90">admin@v2u.us</p>
              </div>
              <div className="p-4 rounded-lg bg-[#015451FF] text-white">
                <h3 className="font-semibold">Support</h3>
                <p className="text-sm opacity-90">support@v2u.us</p>
              </div>
              <div className="p-4 rounded-lg bg-[#015451FF] text-white">
                <h3 className="font-semibold">Phone</h3>
                <p className="text-sm opacity-90">+1 (720) 656-9650</p>
              </div>
              <div className="p-4 rounded-lg bg-[#015451FF] text-white">
                <h3 className="font-semibold">Address</h3>
                <p className="text-sm opacity-90">9200 E Mineral Avenue, Flr 100<br />Centennial, CO 80112</p>
              </div>
            </div>
          </Section>
        </div>
      </div>

      <Footer />
    </main>
  )
}