'use client'

export const dynamic = 'force-dynamic'

import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Section from '@/components/Section'
import PanelWrapper from '@/components/PanelWrapper'

export default function TermsPage() {
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
              <h1 className="mb-6 text-4xl font-bold md:text-6xl">Terms of Service</h1>
              <p className="text-xl md:text-2xl opacity-90">
                Agreement governing your use of v2u services
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
            title="Agreement to Terms"
            body="By accessing or using v2u's media automation platform and related services ('Services'), you agree to be bound by these Terms of Service ('Terms'). If you do not agree to these Terms, you may not access or use our Services. These Terms apply to all users, including businesses, content creators, and individual subscribers."
            variant="dark"
            rounded={true}
          />
        </div>

        {/* Account Terms */}
        <div className="rounded-xl p-6 mb-4 bg-[#dfdfdf]">
          <Section
            title="Account Terms"
            variant="light"
            rounded={true}
          >
            <div className="space-y-4 text-gray-700">
              <PanelWrapper variant="light" className="bg-transparent">
                <h3 className="mb-3 text-lg font-semibold text-black">Account Creation</h3>
                <ul className="list-disc list-inside space-y-2">
                  <li>You must be at least 18 years old to use our Services</li>
                  <li>You must provide accurate, complete, and current information</li>
                  <li>You are responsible for maintaining the security of your account</li>
                  <li>You are responsible for all activities under your account</li>
                  <li>One person or legal entity may maintain only one account</li>
                </ul>
              </PanelWrapper>

              <PanelWrapper variant="light" className="bg-transparent">
                <h3 className="mb-3 text-lg font-semibold text-black">Account Responsibilities</h3>
                <ul className="list-disc list-inside space-y-2">
                  <li>Keep your password secure and confidential</li>
                  <li>Notify us immediately of any unauthorized access</li>
                  <li>You may not share, sell, or transfer your account</li>
                  <li>You may not use automated tools to create accounts</li>
                </ul>
              </PanelWrapper>
            </div>
          </Section>
        </div>

        {/* Acceptable Use */}
        <div className="rounded-xl p-6 mb-4 bg-[#015451FF]">
          <Section
            title="Acceptable Use Policy"
            rounded={true}
            className="text-white"
          >
            <p className="mb-4 opacity-90">You agree NOT to use our Services to:</p>
            <ul className="list-disc list-inside space-y-2 opacity-90">
              <li>Violate any laws, regulations, or third-party rights</li>
              <li>Distribute spam, malware, viruses, or harmful content</li>
              <li>Harass, threaten, or abuse others</li>
              <li>Infringe on intellectual property rights or copyrights</li>
              <li>Impersonate any person or entity</li>
              <li>Post illegal, fraudulent, defamatory, or obscene content</li>
              <li>Interfere with or disrupt our Services or servers</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Scrape, mine, or harvest data without permission</li>
              <li>Resell or redistribute our Services without authorization</li>
            </ul>
          </Section>
        </div>

        {/* Content Ownership */}
        <div className="rounded-xl p-6 mb-4 bg-[#212121ff]">
          <Section
            title="Content and Intellectual Property"
            variant="dark"
            rounded={true}
          >
            <div className="space-y-4 text-gray-300">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Your Content</h3>
                <p>You retain all rights to content you upload, create, or distribute through our Services. By using our Services, you grant us a limited license to store, process, and distribute your content as necessary to provide the Services.</p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Our Content</h3>
                <p>All v2u platform features, software, designs, logos, and documentation are owned by v2u and protected by intellectual property laws. You may not copy, modify, or reverse engineer our Services.</p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Third-Party Content</h3>
                <p>You are responsible for ensuring you have the rights to any content you distribute through third-party platforms (Facebook, Twitter/X, YouTube, LinkedIn, Instagram, Threads, Spotify, etc.).</p>
              </div>
            </div>
          </Section>
        </div>

        {/* Service Terms */}
        <div className="rounded-xl p-6 mb-4 bg-[#dfdfdf]">
          <Section
            title="Service Availability and Modifications"
            variant="light"
            rounded={true}
          >
            <div className="space-y-4 text-gray-700">
              <p>We strive to maintain 99.9% uptime, but we do not guarantee uninterrupted access. We may:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Modify, suspend, or discontinue Services at any time</li>
                <li>Perform scheduled maintenance with advance notice</li>
                <li>Update features, pricing, or Terms with notice</li>
                <li>Limit access to certain features or resources</li>
              </ul>
              <p className="mt-4 font-semibold text-black">We are not liable for any loss resulting from Service interruptions or modifications.</p>
            </div>
          </Section>
        </div>

        {/* Payment Terms */}
        <div className="rounded-xl p-6 mb-4 bg-[#015451FF]">
          <Section
            title="Payment and Billing"
            rounded={true}
            className="text-white"
          >
            <div className="space-y-4 opacity-90">
              <PanelWrapper variant="dark" className="bg-black/30">
                <h3 className="mb-3 text-lg font-semibold">Subscription Plans</h3>
                <ul className="list-disc list-inside space-y-2">
                  <li>All fees are in U.S. Dollars (USD)</li>
                  <li>Subscriptions renew automatically unless canceled</li>
                  <li>You authorize us to charge your payment method on file</li>
                  <li>Price changes will be communicated 30 days in advance</li>
                </ul>
              </PanelWrapper>

              <PanelWrapper variant="dark" className="bg-black/30">
                <h3 className="mb-3 text-lg font-semibold">Refunds and Cancellations</h3>
                <ul className="list-disc list-inside space-y-2">
                  <li>You may cancel your subscription at any time</li>
                  <li>Cancellations take effect at the end of the billing period</li>
                  <li>No refunds for partial months or unused Services</li>
                  <li>We reserve the right to issue refunds at our discretion</li>
                </ul>
              </PanelWrapper>

              <PanelWrapper variant="dark" className="bg-black/30">
                <h3 className="mb-3 text-lg font-semibold">Failed Payments</h3>
                <p>If payment fails, we may suspend or terminate your account. You remain responsible for outstanding charges.</p>
              </PanelWrapper>
            </div>
          </Section>
        </div>

        {/* Third-Party Services */}
        <div className="rounded-xl p-6 mb-4 bg-[#212121ff]">
          <Section
            title="Third-Party Integrations"
            body="Our Services integrate with third-party platforms (social media, cloud storage, analytics). You are responsible for complying with their terms of service. We are not responsible for the availability, content, or policies of third-party services. Changes to third-party APIs or policies may affect our Services."
            variant="dark"
            rounded={true}
          />
        </div>

        {/* Data and Privacy */}
        <div className="rounded-xl p-6 mb-4 bg-[#dfdfdf]">
          <Section
            title="Data and Privacy"
            variant="light"
            rounded={true}
          >
            <div className="text-gray-700">
              <p className="mb-4">We collect and process data as described in our <a href="/privacy" className="text-[#0F8378FF] underline font-semibold">Privacy Policy</a>. By using our Services, you consent to our data practices, including:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Storing your content and credentials securely</li>
                <li>Processing data to provide automation services</li>
                <li>Sharing data with third-party platforms you connect</li>
                <li>Using analytics to improve our Services</li>
              </ul>
            </div>
          </Section>
        </div>

        {/* Warranties */}
        <div className="rounded-xl p-6 mb-4 bg-[#015451FF]">
          <Section
            title="Warranties and Disclaimers"
            rounded={true}
            className="text-white"
          >
            <div className="space-y-4 opacity-90">
              <p className="font-semibold text-lg">Our Services are provided &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; without warranties of any kind.</p>
              
              <p>We disclaim all warranties, express or implied, including but not limited to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Merchantability and fitness for a particular purpose</li>
                <li>Non-infringement of third-party rights</li>
                <li>Accuracy, reliability, or completeness of content</li>
                <li>Uninterrupted, secure, or error-free operation</li>
                <li>Results obtained from using our Services</li>
              </ul>

              <p className="mt-4">You use our Services at your own risk. We do not guarantee that content distributed through third-party platforms will be delivered, displayed, or perform as expected.</p>
            </div>
          </Section>
        </div>

        {/* Limitation of Liability */}
        <div className="rounded-xl p-6 mb-4 bg-[#212121ff]">
          <Section
            title="Limitation of Liability"
            variant="dark"
            rounded={true}
          >
            <div className="space-y-4 text-gray-300">
              <p className="font-semibold text-white text-lg">TO THE MAXIMUM EXTENT PERMITTED BY LAW:</p>
              
              <p>v2u, its officers, directors, employees, and affiliates SHALL NOT BE LIABLE for any indirect, incidental, special, consequential, or punitive damages, including:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Loss of profits, revenue, or data</li>
                <li>Business interruption or loss of opportunity</li>
                <li>Damage to reputation or goodwill</li>
                <li>Third-party platform issues or API changes</li>
                <li>Content loss, corruption, or unauthorized access</li>
              </ul>

              <p className="mt-4">Our total liability to you for any claims arising from these Terms or the Services shall not exceed the amount you paid us in the 12 months preceding the claim.</p>
            </div>
          </Section>
        </div>

        {/* Indemnification */}
        <div className="rounded-xl p-6 mb-4 bg-[#dfdfdf]">
          <Section
            title="Indemnification"
            body="You agree to indemnify, defend, and hold harmless v2u and its affiliates from any claims, losses, damages, liabilities, and expenses (including legal fees) arising from: (a) your use of the Services, (b) your violation of these Terms, (c) your content or materials, (d) your violation of third-party rights, or (e) your violation of any laws or regulations."
            variant="light"
            rounded={true}
          />
        </div>

        {/* Termination */}
        <div className="rounded-xl p-6 mb-4 bg-[#015451FF]">
          <Section
            title="Termination"
            rounded={true}
            className="text-white"
          >
            <div className="space-y-4 opacity-90">
              <p><strong>By You:</strong> You may terminate your account at any time through your account settings or by contacting support.</p>
              
              <p><strong>By Us:</strong> We may suspend or terminate your account immediately if you:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Violate these Terms or our Acceptable Use Policy</li>
                <li>Fail to pay outstanding fees</li>
                <li>Engage in fraudulent or illegal activity</li>
                <li>Pose a security or legal risk</li>
              </ul>

              <p className="mt-4"><strong>Effect of Termination:</strong> Upon termination, your access to the Services will cease immediately. We may delete your content after 90 days. You remain liable for any outstanding fees.</p>
            </div>
          </Section>
        </div>

        {/* Dispute Resolution */}
        <div className="rounded-xl p-6 mb-4 bg-[#212121ff]">
          <Section
            title="Dispute Resolution and Arbitration"
            variant="dark"
            rounded={true}
          >
            <div className="space-y-4 text-gray-300">
              <p className="font-semibold text-white">Any disputes arising from these Terms or the Services shall be resolved through binding arbitration, not in court, except as follows:</p>
              
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Small claims court cases (under $10,000)</li>
                <li>Injunctive relief to protect intellectual property</li>
              </ul>

              <p className="mt-4"><strong className="text-white">Arbitration Terms:</strong></p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Governed by the American Arbitration Association (AAA)</li>
                <li>Conducted in Denver, Colorado</li>
                <li>You waive the right to a jury trial</li>
                <li>You waive the right to participate in class actions</li>
              </ul>

              <p className="mt-4"><strong className="text-white">Opt-Out:</strong> You may opt out of arbitration within 30 days of accepting these Terms by emailing legal@v2u.us.</p>
            </div>
          </Section>
        </div>

        {/* Governing Law */}
        <div className="rounded-xl p-6 mb-4 bg-[#dfdfdf]">
          <Section
            title="Governing Law"
            body="These Terms are governed by the laws of the State of Colorado and the United States, without regard to conflict of law principles. Any disputes not subject to arbitration shall be brought exclusively in the courts of Denver County, Colorado."
            variant="light"
            rounded={true}
          />
        </div>

        {/* Changes to Terms */}
        <div className="rounded-xl p-6 mb-4 bg-[#015451FF]">
          <Section
            title="Changes to These Terms"
            body="We may update these Terms from time to time. We will notify you of material changes by email or through the Services at least 30 days before they take effect. Continued use of the Services after changes constitutes acceptance of the updated Terms. If you do not agree to the changes, you must stop using the Services and cancel your account."
            rounded={true}
            className="text-white"
          />
        </div>

        {/* General Provisions */}
        <div className="rounded-xl p-6 mb-4 bg-[#212121ff]">
          <Section
            title="General Provisions"
            variant="dark"
            rounded={true}
          >
            <div className="space-y-3 text-gray-300">
              <p><strong className="text-white">Entire Agreement:</strong> These Terms, along with our Privacy Policy, constitute the entire agreement between you and v2u.</p>
              
              <p><strong className="text-white">Severability:</strong> If any provision is found unenforceable, the remaining provisions remain in effect.</p>
              
              <p><strong className="text-white">Waiver:</strong> Our failure to enforce any right does not waive that right.</p>
              
              <p><strong className="text-white">Assignment:</strong> You may not assign these Terms. We may assign them to affiliates or successors.</p>
              
              <p><strong className="text-white">Force Majeure:</strong> We are not liable for delays or failures due to events beyond our reasonable control.</p>
              
              <p><strong className="text-white">No Agency:</strong> These Terms do not create a partnership, employment, or agency relationship.</p>
            </div>
          </Section>
        </div>

        {/* Contact */}
        <div className="rounded-xl p-6 mb-4 bg-[#dfdfdf]">
          <Section
            title="Contact Us"
            variant="light"
            rounded={true}
          >
            <p className="mb-6 text-gray-700">
              If you have questions about these Terms of Service, please contact us:
            </p>
            <div className="grid gap-4 text-left md:grid-cols-2">
              <div className="p-4 rounded-lg bg-[#0F8378FF] text-white">
                <h3 className="font-semibold">Legal</h3>
                <p className="text-sm opacity-90">legal@v2u.us</p>
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
