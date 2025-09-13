import HeaderClient from '@/components/HeaderClient'
import FooterClient from '@/components/FooterClient'
import ThankYouClient from './ThankYouClient'
import { Suspense } from 'react'

export default function ThankYouPage() {
  return (
    <main className="w-full h-auto pt-[48px] bg-[var(--site-bg)] text-[var(--site-fg)] transition-colors duration-300">
      <HeaderClient loggedIn={true} firstName="Welcome" avatar="🟡" />
      <div className="max-w-3xl mx-auto px-6 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">Thank You for Subscribing!</h1>
        <p className="text-lg mb-6 text-black/80">
          Your subscription is confirmed. You now have access to all premium content.
        </p>

        <Suspense fallback={<p className="text-sm text-blue-500">Validating access...</p>}>
          <ThankYouClient />
        </Suspense>
      </div>
      <FooterClient />
    </main>
  )
}