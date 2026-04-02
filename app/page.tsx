import { Metadata } from 'next'
import InvoiceCreator from '@/components/invoice/InvoiceCreator'

export const metadata: Metadata = {
  title: 'invoice-gen.net — Free Online Invoice Generator',
  description: 'Create and download professional invoices in seconds. Free forever, no sign up required.',
}

export default function Home() {
  return <InvoiceCreator />
}
