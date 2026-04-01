'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { FileCheck, Menu, X, LayoutDashboard, PlusCircle, History, Settings, CreditCard } from 'lucide-react'
import ThemeToggle from './ThemeToggle'

const NAV = [
  { href: '/dashboard',       icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/invoices/create', icon: PlusCircle,      label: 'Create' },
  { href: '/invoices',        icon: History,         label: 'History' },
  { href: '/settings',        icon: Settings,        label: 'Settings' },
  { href: '/pricing',         icon: CreditCard,      label: 'Upgrade' },
]

export default function MobileNav() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Mobile top bar */}
      <header className="lg:hidden flex items-center justify-between px-4 h-14 bg-white dark:bg-surface-900 border-b border-gray-100 dark:border-surface-700 sticky top-0 z-40">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-500 to-violet-500 flex items-center justify-center">
            <FileCheck className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-display font-700 text-gray-900 dark:text-white text-sm">invoice-gen<span className="text-brand-500">.net</span></span>
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button onClick={() => setOpen(true)} className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-surface-700">
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Drawer */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-white dark:bg-surface-900 p-4 space-y-2">
            <div className="flex items-center justify-between mb-4">
              <span className="font-display font-700 text-gray-900 dark:text-white">Menu</span>
              <button onClick={() => setOpen(false)} className="p-1 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                <X className="w-5 h-5" />
              </button>
            </div>
            {NAV.map(({ href, icon: Icon, label }) => {
              const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
              return (
                <Link key={href} href={href} onClick={() => setOpen(false)} className={active ? 'nav-item-active' : 'nav-item'}>
                  <Icon className="w-4 h-4" /> {label}
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </>
  )
}
