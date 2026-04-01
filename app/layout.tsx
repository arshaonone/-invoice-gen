import type { Metadata } from 'next'
import { Inter, Poppins } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/Providers'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const poppins = Poppins({ subsets: ['latin'], weight: ['400', '500', '600', '700', '800'], variable: '--font-poppins' })

export const metadata: Metadata = {
  title: { default: 'invoice-gen.net — Professional Invoice Generator', template: '%s | invoice-gen.net' },
  description: 'Create, customize, and send professional invoices in seconds. Trusted by 10,000+ businesses worldwide. Free & Pro plans available.',
  keywords: ['invoice generator', 'free invoice', 'online invoice maker', 'PDF invoice', 'invoice software'],
  authors: [{ name: 'invoice-gen.net' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://invoice-gen.net',
    title: 'invoice-gen.net — Professional Invoice Generator',
    description: 'Create beautiful, professional invoices in seconds. Free forever.',
    siteName: 'invoice-gen.net',
  },
  twitter: { card: 'summary_large_image', title: 'invoice-gen.net', description: 'Create professional invoices in seconds.' },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'),
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${poppins.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
