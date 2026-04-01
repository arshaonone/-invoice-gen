import type { Metadata } from 'next'
import InvoiceCreator from '@/components/invoice/InvoiceCreator'

export const metadata: Metadata = { title: 'Edit Invoice' }

export default function EditInvoicePage({ params }: { params: { id: string } }) {
  return <InvoiceCreator invoiceId={params.id} />
}
