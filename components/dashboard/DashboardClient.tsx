'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import {
  TrendingUp, FileText, DollarSign, Clock, Plus,
  ArrowRight, Sparkles, CheckCircle, AlertCircle
} from 'lucide-react'
import { formatCurrency, formatDate, getStatusColor, formatDateRelative } from '@/lib/utils'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface DashStats {
  totalRevenue: number
  totalInvoices: number
  pending: number
  paid: number
  overdue: number
  recent: Array<{
    _id: string; invoiceNumber: string; clientName: string
    total: number; status: string; createdAt: string; currency: string
  }>
  monthly: Record<string, number>
}

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }
const stagger = { visible: { transition: { staggerChildren: 0.08 } } }

export default function DashboardClient() {
  const { data: session } = useSession()
  const [stats, setStats]   = useState<DashStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/dashboard')
      .then(r => r.json())
      .then(data => { setStats(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const chartData = stats
    ? Object.entries(stats.monthly).map(([month, revenue]) => ({ month, revenue }))
    : []

  const firstName = session?.user?.name?.split(' ')[0] ?? 'there'

  const STAT_CARDS = stats ? [
    { label: 'Total Revenue', value: formatCurrency(stats.totalRevenue, 'USD'), icon: DollarSign, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/10', change: '+12.5%' },
    { label: 'Total Invoices', value: stats.totalInvoices.toString(), icon: FileText, color: 'text-brand-500', bg: 'bg-brand-50 dark:bg-brand-900/10', change: '+8 this month' },
    { label: 'Pending', value: stats.pending.toString(), icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/10', change: 'Awaiting payment' },
    { label: 'Overdue', value: stats.overdue.toString(), icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/10', change: 'Action needed' },
  ] : []

  return (
    <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-8 max-w-7xl">
      {/* Header */}
      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-700 text-gray-900 dark:text-white">
            Good morning, {firstName} 👋
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Here&apos;s what&apos;s happening with your invoices today.</p>
        </div>
        <Link href="/invoices/create" className="btn-primary gap-2 self-start sm:self-auto">
          <Plus className="w-4 h-4" /> New Invoice
        </Link>
      </motion.div>

      {/* Stats */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card p-6 h-28 animate-pulse">
              <div className="h-4 bg-gray-100 dark:bg-surface-700 rounded w-1/2 mb-3" />
              <div className="h-8 bg-gray-100 dark:bg-surface-700 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : (
        <motion.div variants={stagger} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {STAT_CARDS.map(({ label, value, icon: Icon, color, bg, change }) => (
            <motion.div key={label} variants={fadeUp} className="card card-hover p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> {change}
                </span>
              </div>
              <div className="text-2xl font-display font-700 text-gray-900 dark:text-white mb-1">{value}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">{label}</div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Chart + Recent */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <motion.div variants={fadeUp} className="lg:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-display font-600 text-gray-900 dark:text-white">Revenue Overview</h2>
              <p className="text-sm text-gray-400">Monthly paid invoices</p>
            </div>
          </div>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f022" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
                <Tooltip
                  contentStyle={{ background: '#1e1e30', border: '1px solid #252540', borderRadius: '12px', color: '#f1f5f9', fontSize: 12 }}
                  formatter={(v: number) => [`$${v.toFixed(2)}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2.5} fill="url(#revenueGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex flex-col items-center justify-center text-gray-400">
              <AreaChart className="w-10 h-10 mb-3 opacity-20" />
              <p className="text-sm">No revenue data yet.</p>
              <Link href="/invoices/create" className="text-brand-500 text-sm mt-1 hover:underline">Create your first invoice →</Link>
            </div>
          )}
        </motion.div>

        {/* Quick actions */}
        <motion.div variants={fadeUp} className="card p-6 space-y-4">
          <h2 className="font-display font-600 text-gray-900 dark:text-white">Quick Actions</h2>
          {[
            { label: 'Create Invoice', href: '/invoices/create', icon: Plus, desc: 'New invoice in 60s', color: 'text-brand-500 bg-brand-50 dark:bg-brand-900/20' },
            { label: 'View History', href: '/invoices', icon: FileText, desc: 'All your invoices', color: 'text-violet-500 bg-violet-50 dark:bg-violet-900/20' },
            { label: 'Upgrade Plan', href: '/pricing', icon: Sparkles, desc: 'Unlock Pro features', color: 'text-amber-500 bg-amber-50 dark:bg-amber-900/20' },
          ].map(({ label, href, icon: Icon, desc, color }) => (
            <Link key={label} href={href} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-surface-700 transition-all group">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-gray-900 dark:text-white">{label}</div>
                <div className="text-xs text-gray-400">{desc}</div>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-300 dark:text-gray-600 group-hover:text-gray-500 transition-colors" />
            </Link>
          ))}
        </motion.div>
      </div>

      {/* Recent invoices */}
      <motion.div variants={fadeUp} className="card overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-surface-700">
          <h2 className="font-display font-600 text-gray-900 dark:text-white">Recent Invoices</h2>
          <Link href="/invoices" className="text-sm text-brand-500 hover:text-brand-600 flex items-center gap-1">
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="p-6 space-y-3">
            {[...Array(3)].map((_, i) => <div key={i} className="h-12 bg-gray-50 dark:bg-surface-800 rounded-xl animate-pulse" />)}
          </div>
        ) : stats?.recent.length === 0 ? (
          <div className="py-16 flex flex-col items-center justify-center text-gray-400">
            <FileText className="w-10 h-10 mb-3 opacity-20" />
            <p className="text-sm">No invoices yet.</p>
            <Link href="/invoices/create" className="btn-primary mt-4 text-sm">Create your first invoice</Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-50 dark:divide-surface-700">
            {stats?.recent.map((inv, i) => (
              <motion.div
                key={inv._id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center justify-between px-6 py-4 table-row-hover"
              >
                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 rounded-xl bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-4 h-4 text-brand-500" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">{inv.invoiceNumber}</div>
                    <div className="text-xs text-gray-400">{inv.clientName} · {formatDateRelative(inv.createdAt)}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={getStatusColor(inv.status)}>{inv.status}</span>
                  <div className="text-sm font-semibold text-gray-900 dark:text-white text-right">
                    {formatCurrency(inv.total, inv.currency ?? 'USD')}
                  </div>
                  <Link href={`/invoices/${inv._id}`} className="btn-ghost text-xs px-3 py-1.5">
                    Edit
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Free plan banner */}
      {(session?.user as { plan?: string })?.plan !== 'pro' && (
        <motion.div variants={fadeUp} className="flex items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-brand-500/10 to-violet-500/10 border border-brand-200 dark:border-brand-800">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-brand-500 flex-shrink-0" />
            <div>
              <div className="text-sm font-semibold text-gray-900 dark:text-white">You&apos;re on the Free plan</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Upgrade to Pro for unlimited invoices, all templates, and more.</div>
            </div>
          </div>
          <Link href="/pricing" className="btn-primary flex-shrink-0 text-sm">Upgrade now</Link>
        </motion.div>
      )}
    </motion.div>
  )
}
