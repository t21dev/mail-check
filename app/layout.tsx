import type { Metadata, Viewport } from 'next'
import { TooltipProvider } from '@/components/ui/tooltip'
import { OfflineBanner } from '@/components/offline-banner'
import { PwaRegister } from '@/components/pwa-register'
import './globals.css'

const SITE_URL = 'https://mail-check.t21.dev'

export const metadata: Metadata = {
  title: {
    default: 'mail-check by t21.dev — Verify Email Addresses Instantly',
    template: '%s | mail-check by t21.dev',
  },
  description:
    'Free email verification tool by t21.dev. Check if email addresses actually exist using MX record lookup and SMTP validation — without sending a single email.',
  keywords: [
    'email verification',
    'email checker',
    'MX lookup',
    'SMTP validation',
    'bulk email check',
    'disposable email detection',
    'catch-all detection',
    'email deliverability',
  ],
  authors: [{ name: 't21dev', url: 'https://github.com/t21dev' }],
  creator: 't21dev',
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    siteName: 'mail-check by t21.dev',
    title: 'mail-check by t21.dev — Verify Email Addresses Instantly',
    description:
      'Free email verification tool by t21.dev. Check if email addresses actually exist using MX record lookup and SMTP validation — without sending a single email.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'mail-check by t21.dev — Verify Email Addresses Instantly',
    description:
      'Free email verification tool by t21.dev. Check syntax, MX records, and SMTP deliverability in one shot.',
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/icon-180x180.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/manifest.json',
  robots: {
    index: true,
    follow: true,
  },
}

export const viewport: Viewport = {
  themeColor: '#22d3ee',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Outfit:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var m=document.cookie.match(/(?:^|; )theme=([^;]*)/);var t=m?decodeURIComponent(m[1]):null;if(t==='dark'){document.documentElement.classList.add('dark')}})();`,
          }}
        />
        <TooltipProvider>
          <OfflineBanner />
          {children}
          <PwaRegister />
        </TooltipProvider>
      </body>
    </html>
  )
}
