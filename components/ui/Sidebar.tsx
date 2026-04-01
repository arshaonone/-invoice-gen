'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import {
  LayoutDashboard, FileText, PlusCircle, History,
  Settings, CreditCard, LogOut, FileCheck, ChevronDown
} from 'lucide-react'
import ThemeToggle from '@/components/ui/ThemeToggle'
import { useState } from 'react'

const NAV = [
  { href: '/dashboard',          icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/invoices/create',    icon: PlusCircle,      label: 'Create Invoice' },
  { href: '/invoices',           icon: History,         label: 'Invoice History' },
  { href: '/settings',           icon: Settings,        label: 'Settings' },
  { href: '/pricing',            icon: CreditCard,      label: 'Upgrade to Pro' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className={`hidden lg:flex flex-col bg-white dark:bg-surface-900 border-r border-gray-100 dark:border-surface-700 h-screen sticky top-0 transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'}`}
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-4 h-16 border-b border-gray-100 dark:border-surface-700">
        {!collapsed && (
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-500 to-violet-500 flex items-center justify-center shadow-glow">
              <FileCheck className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-display font-700 text-gray-900 dark:text-white text-sm">invoice-gen<span className="text-brand-500">.net</span></span>
          </Link>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-surface-700 transition-all"
        >
          <ChevronDown className={`w-4 h-4 transition-transform ${collapsed ? '-rotate-90' : 'rotate-90'}`} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-thin">
        {NAV.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={active ? 'nav-item-active' : 'nav-item'}
              title={collapsed ? label : undefined}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {!collapsed && <span>{label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* User + controls */}
      <div className="p-3 border-t border-gray-100 dark:border-surface-700 space-y-2">
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {!collapsed && (
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-all flex-1"
            >
              <LogOut className="w-4 h-4" /> Sign out
            </button>
          )}
        </div>
        {!collapsed && session?.user && (
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-gray-50 dark:bg-surface-800">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-400 to-violet-400 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {session.user.name?.[0]?.toUpperCase() ?? 'U'}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-gray-900 dark:text-white truncate">{session.user.name}</div>
              <div className="text-xs text-gray-400 truncate">{(session.user as { plan?: string }).plan === 'pro' ? '⚡ Pro' : 'Free plan'}</div>
            </div>
          </div>
        )}
      </div>
    </motion.aside>
  )
}
