'use client'


import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Section from '@/components/Section'
import PanelWrapper from '@/components/PanelWrapper'

export default function PrivacyPage() {
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
              <h1 className="mb-6 text-4xl font-bold md:text-6xl">Privacy Policy</h1>
              <p className="text-xl md:text-2xl opacity-90">
                Your privacy is important to us
              </p>
              <p className="text-sm mt-4 opacity-75">
                Last Updated: November 8, 2025
              </p>
            </div>
          </Section>
        </div>

        {/* Introduction */}
        <div className="rounded-xl p-6 mb-4 bg-[#212121ff]">
          <Section
            title="Introduction"
            body="v2u ('we,' 'us,' or 'our') is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our media automation platform and related services. By accessing or using our services, you agree to this Privacy Policy."
            variant="dark"
            rounded={true}
          />
        </div>

        {/* Information We Collect */}
        <div className="rounded-xl p-6 mb-4 bg-[#dfdfdf]">
          <Section
            title="Information We Collect"
            variant="light"
            rounded={true}
          >
            <div className="space-y-6">
              <PanelWrapper variant="light" className="bg-transparent">
                <h3 className="mb-4 text-xl font-semibold text-black">Personal Information</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>Name, email address, and phone number</li>
                  <li>Account credentials and authentication information</li>
                  <li>Payment and billing information</li>
                  <li>Company name and business details</li>
                  <li>Profile information and preferences</li>
                </ul>
              </PanelWrapper>

              <PanelWrapper variant="light" className="bg-transparent">
                <h3 className="mb-4 text-xl font-semibold text-black">Technical Information</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>IP address, browser type, and device information</li>
                  <li>Usage data and analytics</li>
                  <li>Cookies and tracking technologies</li>
                  <li>Log files and error reports</li>
                </ul>
              </PanelWrapper>

              <PanelWrapper variant="light" className="bg-transparent">
                <h3 className="mb-4 text-xl font-semibold text-black">Content and Media</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>Content you upload, create, or distribute through our platform</li>
                  <li>Metadata associated with your media files</li>
                  <li>Third-party platform credentials (encrypted and stored securely)</li>
                  <li>Social media account connections and API data</li>
                </ul>
              </PanelWrapper>
            </div>
          </Section>
        </div>

        {/* How We Use Your Information */}
        <div className="rounded-xl p-6 mb-4 bg-[#015451FF]">
          <Section
            title="How We Use Your Information"
            rounded={true}
            className="text-white"
          >
            <ul className="list-disc list-inside space-y-2 opacity-90">
              <li>Provide, maintain, and improve our services</li>
              <li>Process your transactions and manage your account</li>
              <li>Automate content distribution to your connected platforms</li>
              <li>Send you service updates, notifications, and support messages</li>
              <li>Analyze usage patterns to enhance user experience</li>
              <li>Detect, prevent, and address technical issues and security threats</li>
              <li>Comply with legal obligations and enforce our terms of service</li>
            </ul>
          </Section>
        </div>

        {/* Data Sharing */}
        <div className="rounded-xl p-6 mb-4 bg-[#212121ff]">
          <Section
            title="How We Share Your Information"
            variant="dark"
            rounded={true}
          >
            <div className="space-y-4 text-gray-300">
              <p><strong className="text-white">Service Providers:</strong> We share data with trusted third-party services that help us operate our platform (hosting, analytics, payment processing).</p>
              
              <p><strong className="text-white">Third-Party Platforms:</strong> When you connect social media accounts, we share necessary data to publish content on your behalf (Facebook, Twitter/X, YouTube, LinkedIn, Instagram, Threads, Spotify, etc.).</p>
              
              <p><strong className="text-white">Legal Requirements:</strong> We may disclose information if required by law, subpoena, or to protect our rights and safety.</p>
              
              <p><strong className="text-white">Business Transfers:</strong> In the event of a merger, acquisition, or sale of assets, your information may be transferred to the acquiring entity.</p>
              
              <p className="font-semibold text-white mt-4">We do NOT sell your personal information to third parties.</p>
            </div>
          </Section>
        </div>

        {/* Data Security */}
        <div className="rounded-xl p-6 mb-4 bg-[#dfdfdf]">
          <Section
            title="Data Security"
            body="We implement industry-standard security measures to protect your information, including encryption, secure storage (Cloudflare KV), and access controls. However, no method of transmission over the internet is 100% secure. While we strive to protect your data, we cannot guarantee absolute security."
            variant="light"
            rounded={true}
          />
        </div>

        {/* Your Rights */}
        <div className="rounded-xl p-6 mb-4 bg-[#015451FF]">
          <Section
            title="Your Privacy Rights"
            rounded={true}
            className="text-white"
          >
            <p className="mb-4 opacity-90">You have the right to:</p>
            <ul className="list-disc list-inside space-y-2 opacity-90">
              <li><strong>Access:</strong> Request a copy of your personal data</li>
              <li><strong>Correction:</strong> Update or correct inaccurate information</li>
              <li><strong>Deletion:</strong> Request deletion of your account and data</li>
              <li><strong>Portability:</strong> Export your data in a standard format</li>
              <li><strong>Opt-Out:</strong> Unsubscribe from marketing communications</li>
              <li><strong>Withdraw Consent:</strong> Revoke consent for data processing where applicable</li>
            </ul>
            <p className="mt-6 opacity-90">To exercise these rights, contact us at <a href="mailto:privacy@v2u.us" className="underline font-semibold">privacy@v2u.us</a></p>
          </Section>
        </div>

        {/* Cookies */}
        <div className="rounded-xl p-6 mb-4 bg-[#212121ff]">
          <Section
            title="Cookies and Tracking"
            body="We use cookies and similar technologies to enhance your experience, analyze usage, and deliver personalized content. You can control cookie preferences through your browser settings. Disabling cookies may limit some features of our platform."
            variant="dark"
            rounded={true}
          />
        </div>

        {/* Third-Party Links */}
        <div className="rounded-xl p-6 mb-4 bg-[#dfdfdf]">
          <Section
            title="Third-Party Services"
            body="Our platform integrates with third-party services (social media platforms, cloud storage, analytics providers). These services have their own privacy policies, and we encourage you to review them. We are not responsible for the privacy practices of external services."
            variant="light"
            rounded={true}
          />
        </div>

        {/* Children's Privacy */}
        <div className="rounded-xl p-6 mb-4 bg-[#015451FF]">
          <Section
            title="Children's Privacy"
            body="Our services are not intended for individuals under the age of 18. We do not knowingly collect personal information from children. If you believe we have inadvertently collected data from a minor, please contact us immediately."
            rounded={true}
            className="text-white"
          />
        </div>

        {/* International Users */}
        <div className="rounded-xl p-6 mb-4 bg-[#212121ff]">
          <Section
            title="International Data Transfers"
            body="Your information may be processed and stored in the United States or other countries where we or our service providers operate. By using our services, you consent to the transfer of your data to countries that may have different data protection laws than your jurisdiction."
            variant="dark"
            rounded={true}
          />
        </div>

        {/* Data Retention */}
        <div className="rounded-xl p-6 mb-4 bg-[#dfdfdf]">
          <Section
            title="Data Retention"
            body="We retain your personal information for as long as necessary to provide our services, comply with legal obligations, resolve disputes, and enforce our agreements. When you delete your account, we will remove or anonymize your data within 90 days, except where we are required by law to retain it."
            variant="light"
            rounded={true}
          />
        </div>

        {/* Changes to Policy */}
        <div className="rounded-xl p-6 mb-4 bg-[#015451FF]">
          <Section
            title="Changes to This Privacy Policy"
            body="We may update this Privacy Policy from time to time. We will notify you of significant changes by posting the updated policy on this page and updating the 'Last Updated' date. Continued use of our services after changes constitutes acceptance of the updated policy."
            rounded={true}
            className="text-white"
          />
        </div>

        {/* Contact */}
        <div className="rounded-xl p-6 mb-4 bg-[#dfdfdf]">
          <Section
            title="Contact Us"
            variant="light"
            rounded={true}
          >
            <p className="mb-6 text-gray-700">
              If you have questions or concerns about this Privacy Policy or our data practices, please contact us:
            </p>
            <div className="grid gap-4 text-left md:grid-cols-2">
              <div className="p-4 rounded-lg bg-[#0F8378FF] text-white">
                <h3 className="font-semibold">Email</h3>
                <p className="text-sm opacity-90">privacy@v2u.us</p>
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
                <h3 className="font-semibold">Mailing Address</h3>
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
