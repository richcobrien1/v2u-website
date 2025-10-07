'use client'

import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Section from '@/components/Section'
import PanelWrapper from '@/components/PanelWrapper'

export default function HelpCenterPage() {
  const faqs = [
    {
      question: "How do I get started with v2u?",
      answer: "Getting started is easy! Sign up for an account, choose your plan, and follow our quick setup guide. Our onboarding process will walk you through connecting your media sources and configuring your first automation workflow."
    },
    {
      question: "What file formats does v2u support?",
      answer: "v2u supports a wide range of media formats including MP4, MOV, AVI, MP3, WAV, and more. Our platform automatically transcodes content to ensure compatibility across different devices and platforms."
    },
    {
      question: "How does billing work?",
      answer: "We offer flexible billing options including monthly and annual plans. You're billed based on your usage tier and any additional storage or processing needs. You can view and manage your billing in your account dashboard."
    },
    {
      question: "Is my data secure?",
      answer: "Security is our top priority. All data is encrypted in transit and at rest. We use enterprise-grade security measures and comply with industry standards for data protection and privacy."
    },
    {
      question: "Can I integrate v2u with my existing tools?",
      answer: "Yes! v2u offers comprehensive API access and pre-built integrations with popular platforms like YouTube, Vimeo, social media networks, and content management systems."
    },
    {
      question: "What kind of support do you offer?",
      answer: "We provide 24/7 technical support, comprehensive documentation, video tutorials, and a community forum. Enterprise customers also receive dedicated account management and priority support."
    }
  ]

  const resources = [
    {
      title: "Getting Started Guide",
      description: "Complete walkthrough for new users",
      type: "Guide"
    },
    {
      title: "API Documentation",
      description: "Technical documentation for developers",
      type: "Docs"
    },
    {
      title: "Video Tutorials",
      description: "Step-by-step video guides",
      type: "Video"
    },
    {
      title: "Community Forum",
      description: "Connect with other users and experts",
      type: "Community"
    }
  ]

  return (
    <main className="min-h-screen bg-[var(--site-bg)] text-[var(--site-fg)]">
      <Header />

      <div className="pt-24 px-4 md:px-4 space-y-4">
        {/* Hero Section */}
        <div className="rounded-xl p-6 mb-4" style={{
          background: 'linear-gradient(to bottom right, #0F8378FF, #015451FF)'
        }}>
          <Section
            variant="dark"
            title=""
            body=""
            rounded={true}
          >
            <div className="text-center text-white">
              <h1 className="mb-6 text-4xl font-bold md:text-6xl">Help Center</h1>
              <p className="text-xl md:text-2xl opacity-90">
                Find answers, get support, and make the most of v2u
              </p>
            </div>
          </Section>
        </div>

        {/* Search Section */}
        <div className="px-4 md:px-4 space-y-4">
          <div className="rounded-xl p-6 mb-4">
            <Section
              title="Search Our Knowledge Base"
              variant="light"
              background={{ from: '#0F8378FF', to: '#dfdfdfff' }}
              rounded={true}
            >
              <div className="mx-auto max-w-md">
                <input
                  type="text"
                  placeholder="Search for help..."
                  className="w-full rounded-lg border px-4 py-3 focus:border-[#0F8378FF] focus:outline-none"
                />
                <button className="mt-4 w-full rounded-lg bg-[#0F8378FF] py-3 text-white hover:bg-[#015451FF]">
                  Search
                </button>
              </div>
            </Section>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="px-4 md:px-4 space-y-4">
          <div className="rounded-xl p-6 mb-4 bg-[#212121ff] text-white">
            <Section
              title="Frequently Asked Questions"
              variant="dark"
              background={{ from: '#015451FF', to: '#212121ff' }}
              rounded={true}
            >
              <div className="grid gap-6 md:grid-cols-2">
                {faqs.map((faq, index) => (
                  <PanelWrapper key={index} variant="light">
                    <h3 className="mb-3 font-semibold">{faq.question}</h3>
                    <p className="text-gray-700">{faq.answer}</p>
                  </PanelWrapper>
                ))}
              </div>
            </Section>
          </div>
        </div>

        {/* Resources Section */}
        <div className="px-4 md:px-4 space-y-4">
          <div className="rounded-xl p-6 mb-4">
            <Section
              title="Helpful Resources"
              variant="light"
              background={{ from: '#0F8378FF', to: '#dfdfdfff' }}
              rounded={true}
            >
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {resources.map((resource, index) => (
                  <PanelWrapper key={index} variant={index % 2 === 0 ? "dark" : "light"}>
                    <div className="mb-2 text-sm font-medium text-[#0F8378FF]">{resource.type}</div>
                    <h3 className="mb-2 text-lg font-semibold">{resource.title}</h3>
                    <p className="mb-4 text-sm opacity-90">{resource.description}</p>
                    <button className="text-sm font-medium underline hover:no-underline">
                      Learn More →
                    </button>
                  </PanelWrapper>
                ))}
              </div>
            </Section>
          </div>
        </div>

        {/* Contact Support Section */}
        <div className="px-4 md:px-4 space-y-4">
          <div className="rounded-xl p-6 mb-4 bg-[#212121ff] text-white">
            <Section
              title="Still Need Help?"
              variant="dark"
              background={{ from: '#015451FF', to: '#212121ff' }}
              rounded={true}
            >
              <p className="mb-8 text-gray-300">
                Our support team is here to help. Choose the best way to reach us based on your needs.
              </p>
              <div className="grid gap-6 md:grid-cols-3">
                <div className="text-center">
                  <h3 className="mb-2 font-semibold">Live Chat</h3>
                  <p className="text-sm text-gray-400 mb-3">Available 24/7 for urgent issues</p>
                  <button className="rounded bg-[#0F8378FF] px-4 py-2 text-sm text-white hover:bg-[#015451FF]">
                    Start Chat
                  </button>
                </div>
                <div className="text-center">
                  <h3 className="mb-2 font-semibold">Email Support</h3>
                  <p className="text-sm text-gray-400 mb-3">Response within 24 hours</p>
                  <a
                    href="mailto:support@v2u.us"
                    className="rounded bg-[#0F8378FF] px-4 py-2 text-sm text-white hover:bg-[#015451FF] inline-block"
                  >
                    Email Us
                  </a>
                </div>
                <div className="text-center">
                  <h3 className="mb-2 font-semibold">Phone Support</h3>
                  <p className="text-sm text-gray-400 mb-3">Mon-Fri, 9AM-6PM MST</p>
                  <a
                    href="tel:+17206569650"
                    className="rounded bg-[#0F8378FF] px-4 py-2 text-sm text-white hover:bg-[#015451FF] inline-block"
                  >
                    Call Now
                  </a>
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