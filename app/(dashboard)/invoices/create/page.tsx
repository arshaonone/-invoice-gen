import type { Metadata } from 'next'
import InvoiceCreator from '@/components/invoice/InvoiceCreator'

export const metadata: Metadata = { title: 'Create Invoice' }

export default function CreateInvoicePage() {
  return <InvoiceCreator />
}
