import type { Metadata } from 'next'
import './globals.css'
// import { ClerkProvider } from '@clerk/nextjs'
import { Providers } from './providers'
// import '@/lib/init-services' // Disabled - causes Edge Runtime issues

export const dynamic = 'force-dynamic'

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
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}