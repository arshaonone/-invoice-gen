import { Metadata } from 'next'
import LandingPage from '@/components/landing/LandingPage'

export const metadata: Metadata = {
  title: 'invoice-gen.net — Create Professional Invoices Free',
  description: 'Create stunning, professional invoices in seconds. Free forever. PDF export, templates, and more.',
}

export default function Home() {
  return <LandingPage />
}
