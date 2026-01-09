import type { Metadata } from 'next'
import './globals.css'
import { ClerkProvider } from '@clerk/nextjs'
import { ThemeProvider } from '@/components/theme/ThemeContext' // adjust path if needed
import { SignupProvider } from '@/components/SignupModalProvider'
import { ToastProvider } from '@/components/ToastProvider'
import '@/lib/init-services' // Initialize application services

export const metadata: Metadata = {
  title: 'v2u',
  description: 'v2u — automation-ready media systems',
  icons: {
    icon: '/v2u_avatar.png',
    apple: '/apple-touch-icon.png',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const storedTheme = localStorage.getItem('v2u-theme');
                  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  
                  let shouldBeDark = false;
                  
                  if (storedTheme === 'dark') {
                    shouldBeDark = true;
                  } else if (storedTheme === 'light') {
                    shouldBeDark = false;
                  } else {
                    // 'system' or no preference - use system setting
                    shouldBeDark = systemPrefersDark;
                  }
                  
                  if (shouldBeDark) {
                    document.documentElement.classList.add('dark');
                    document.documentElement.style.setProperty('--site-bg', '#000000');
                    document.documentElement.style.setProperty('--site-fg', '#ffffff');
                  } else {
                    document.documentElement.classList.remove('dark');
                    document.documentElement.style.setProperty('--site-bg', '#ffffff');
                    document.documentElement.style.setProperty('--site-fg', '#000000');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen antialiased">
        <ClerkProvider
          appearance={{
            layout: {
              socialButtonsPlacement: 'bottom',
              socialButtonsVariant: 'iconButton',
            },
            variables: {
              colorPrimary: '#3b82f6',
              colorText: '#1f2937',
              fontFamily: 'Inter, system-ui, sans-serif',
            },
            elements: {
              card: 'shadow-2xl',
              headerTitle: 'text-2xl font-bold',
              headerSubtitle: 'text-gray-600 dark:text-gray-400',
              socialButtonsIconButton: 'border-2 hover:border-blue-500 transition-colors',
              formButtonPrimary: 'bg-blue-600 hover:bg-blue-700 transition-colors',
            }
          }}
        >
          <ThemeProvider>
            <ToastProvider>
              <SignupProvider>
                {children}
              </SignupProvider>
            </ToastProvider>
          </ThemeProvider>
        </ClerkProvider>
      </body>
    </html>
  )
}