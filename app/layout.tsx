import type { Metadata } from 'next'
import { Outfit, Plus_Jakarta_Sans } from 'next/font/google'
import Script from 'next/script'
import './globals.css'
import { Providers } from '@/components/Providers'

const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' })
const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-jakarta' })

export const metadata: Metadata = {
  title: { default: 'invoice-gen.net — Free Online Invoice Generator', template: '%s | invoice-gen.net' },
  description: 'Create, customize, and download professional invoices as PDF in seconds. Free forever. No signup required.',
  keywords: ['invoice generator', 'free invoice', 'online invoice maker', 'PDF invoice', 'invoice software'],
  authors: [{ name: 'invoice-gen.net' }],
  icons: {
    icon: [
      { url: '/favicon.png', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', type: 'image/png' },
    ],
    shortcut: '/favicon.png',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://invoice-gen.net',
    title: 'invoice-gen.net — Free Online Invoice Generator',
    description: 'Create beautiful, professional invoices in seconds. Free forever.',
    siteName: 'invoice-gen.net',
  },
  twitter: { card: 'summary_large_image', title: 'invoice-gen.net', description: 'Create professional invoices in seconds.' },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'),
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${outfit.variable} ${jakarta.variable} font-sans antialiased overflow-x-hidden`} style={{ top: '0px' }}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
