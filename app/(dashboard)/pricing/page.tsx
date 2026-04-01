import type { Metadata } from 'next'
import PricingClient from '@/components/pricing/PricingClient'

export const metadata: Metadata = { title: 'Pricing' }

export default function PricingPage() {
  return <PricingClient />
}
