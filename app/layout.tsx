import type { Metadata } from 'next'
import { Outfit, Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/Providers'

const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' })
const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-jakarta' })

const siteUrl = 'https://www.invoice-gen.net'
const siteTitle = 'Free Online Invoice Generator — invoice-gen.net'
const siteDesc =
  'Create professional invoices instantly and download as PDF. 100% free, no login required. Perfect for freelancers, agencies and small businesses.'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteTitle,
    template: '%s | invoice-gen.net',
  },
  description: siteDesc,
  keywords: [
    'free invoice generator',
    'online invoice maker',
    'invoice PDF download',
    'invoice generator no signup',
    'freelance invoice template',
    'small business invoice',
    'professional invoice creator',
    'invoice maker free',
    'invoice tool online',
    'create invoice online',
  ],
  authors: [{ name: 'invoice-gen.net', url: siteUrl }],
  creator: 'invoice-gen.net',
  publisher: 'Ever Legit LLC',
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-snippet': -1, 'max-image-preview': 'large', 'max-video-preview': -1 },
  },
  alternates: { canonical: siteUrl },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    title: siteTitle,
    description: siteDesc,
    siteName: 'invoice-gen.net',
    images: [{ url: `${siteUrl}/og-image.png`, width: 1200, height: 630, alt: 'invoice-gen.net — Free Invoice Generator' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteTitle,
    description: siteDesc,
    images: [`${siteUrl}/og-image.png`],
  },
  icons: {
    icon: [{ url: '/favicon.png', type: 'image/png' }],
    apple: [{ url: '/apple-touch-icon.png', type: 'image/png' }],
    shortcut: '/favicon.png',
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION ?? '',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebApplication',
              name: 'invoice-gen.net',
              url: siteUrl,
              description: siteDesc,
              applicationCategory: 'BusinessApplication',
              operatingSystem: 'Any',
              offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
              featureList: [
                'Free invoice generation',
                'PDF download',
                'No signup required',
                'Mobile friendly',
                'Professional templates',
              ],
            }),
          }}
        />
      </head>
      <body
        className={`${outfit.variable} ${jakarta.variable} font-sans antialiased overflow-x-hidden`}
        style={{ top: '0px' }}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
