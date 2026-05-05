import { Metadata } from 'next'
import InvoiceCreator from '@/components/invoice/InvoiceCreator'

export const metadata: Metadata = {
  title: 'Free Online Invoice Generator — invoice-gen.net',
  description: 'Create and download professional invoices in seconds. Free forever, no login required.',
}

export default function Home() {
  return <InvoiceCreator />
}
