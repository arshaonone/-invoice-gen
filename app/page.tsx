import { Metadata } from 'next'
import InvoiceCreator from '@/components/invoice/InvoiceCreator'

export const metadata: Metadata = {
  title: 'invoice-gen.net — Free Online Invoice Generator',
  description: 'Create and download professional invoices in seconds. Free forever, no sign up required.',
}

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 flex py-10 px-4">
      <div className="flex-1 max-w-7xl mx-auto">
        <InvoiceCreator />
      </div>
    </main>
  )
}
