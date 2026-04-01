import type { Metadata } from 'next'
import InvoiceHistoryClient from '@/components/invoice/InvoiceHistoryClient'

export const metadata: Metadata = { title: 'Invoice History' }

export default function InvoicesPage() {
  return <InvoiceHistoryClient />
}
