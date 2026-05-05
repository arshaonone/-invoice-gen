import { Metadata } from 'next'
import InvoiceCreator from '@/components/invoice/InvoiceCreator'

export const metadata: Metadata = {
  title: 'Invoice Editor — invoice-gen.net',
  description: 'Create and download professional invoices in seconds. Free forever, no login required.',
}

export default function EditorPage() {
  return <InvoiceCreator />
}
