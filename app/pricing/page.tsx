import { Metadata } from 'next'
import Pricing from '@/components/Pricing'
import { FileText } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Pricing — invoice-gen.net',
  description: 'Simple and transparent pricing for invoice-gen.net. Start free, upgrade when you need more.',
}

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Top Nav */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-sm">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900 text-sm">
              invoice-<span className="text-indigo-600">gen</span>
              <span className="text-gray-400 font-normal">.net</span>
            </span>
          </Link>

          <nav className="hidden sm:flex items-center gap-6 text-sm font-medium text-gray-500">
            <Link href="/" className="hover:text-gray-900 transition">Generator</Link>
            <Link href="/pricing" className="text-indigo-600 font-semibold">Pricing</Link>
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="px-4 py-2 text-sm font-semibold text-indigo-600 hover:bg-indigo-50 rounded-xl transition"
            >
              Log in
            </Link>
            <Link
              href="/pricing"
              className="hidden sm:flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition shadow-sm"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </header>

      <Pricing />

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-400">
          <p>© {new Date().getFullYear()} invoice-gen.net · Built with ❤️ by arshaon</p>
        </div>
      </footer>
    </div>
  )
}
