'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { FileText, Plus, Search, Trash2, Edit, Download, Filter, ChevronDown } from 'lucide-react'
import toast from 'react-hot-toast'
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils'
import MinimalTemplate from '@/components/invoice/templates/MinimalTemplate'
import type { InvoiceData } from '@/components/invoice/InvoiceCreator'

interface Invoice {
  _id: string; invoiceNumber: string; clientName: string; clientEmail?: string
  total: number; status: string; createdAt: string; currency: string; template?: string
  brandColor?: string; language?: string
}

const STATUSES = ['all', 'draft', 'sent', 'paid', 'overdue', 'cancelled']
const fadeUp = { hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0 } }

export default function InvoiceHistoryClient() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [status, setStatus]     = useState('all')
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const params = status !== 'all' ? `?status=${status}` : ''
      const res  = await fetch(`/api/invoices${params}`)
      const data = await res.json()
      setInvoices(data.invoices ?? [])
      setLoading(false)
    }
    load()
  }, [status])

  const filtered = invoices.filter(inv =>
    inv.clientName.toLowerCase().includes(search.toLowerCase()) ||
    inv.invoiceNumber.toLowerCase().includes(search.toLowerCase())
  )

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this invoice? This cannot be undone.')) return
    setDeleting(id)
    const res = await fetch(`/api/invoices/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setInvoices(prev => prev.filter(i => i._id !== id))
      toast.success('Invoice deleted')
    } else {
      toast.error('Delete failed')
    }
    setDeleting(null)
  }

  const totalRevenue   = invoices.filter(i => i.status === 'paid').reduce((a, i) => a + i.total, 0)
  const pendingRevenue = invoices.filter(i => i.status === 'sent').reduce((a, i) => a + i.total, 0)

  return (
    <motion.div initial="hidden" animate="visible" className="space-y-6 max-w-7xl">
      {/* Header */}
      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-700 text-gray-900 dark:text-white">Invoice History</h1>
          <p className="text-sm text-gray-400 mt-0.5">{invoices.length} invoice{invoices.length !== 1 ? 's' : ''} total</p>
        </div>
        <Link href="/invoices/create" className="btn-primary gap-2 self-start"><Plus className="w-4 h-4" /> New Invoice</Link>
      </motion.div>

      {/* Stats strip */}
      <motion.div variants={fadeUp} className="grid sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Paid', value: formatCurrency(totalRevenue, 'USD'), color: 'text-emerald-500' },
          { label: 'Pending', value: formatCurrency(pendingRevenue, 'USD'), color: 'text-amber-500' },
          { label: 'Total Count', value: invoices.length.toString(), color: 'text-brand-500' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card p-4 flex items-center justify-between">
            <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
            <span className={`font-bold ${color}`}>{value}</span>
          </div>
        ))}
      </motion.div>

      {/* Filters */}
      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by client or invoice number..." className="input pl-10" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {STATUSES.map(s => (
            <button key={s} onClick={() => setStatus(s)}
              className={`px-3 py-2 text-xs font-semibold rounded-xl capitalize transition-all ${status === s ? 'bg-brand-500 text-white' : 'bg-white dark:bg-surface-800 border border-gray-200 dark:border-surface-600 text-gray-600 dark:text-gray-400 hover:border-brand-300'}`}>
              {s}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Table */}
      <motion.div variants={fadeUp} className="card overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-3">
            {[...Array(5)].map((_, i) => <div key={i} className="h-14 animate-pulse bg-gray-50 dark:bg-surface-800 rounded-xl" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center">
            <FileText className="w-12 h-12 text-gray-200 dark:text-surface-700 mx-auto mb-4" />
            <div className="text-gray-500 dark:text-gray-400 mb-4">{search ? 'No invoices match your search' : 'No invoices yet'}</div>
            {!search && <Link href="/invoices/create" className="btn-primary">Create your first invoice</Link>}
          </div>
        ) : (
          <>
            {/* Table header */}
            <div className="hidden sm:grid grid-cols-12 gap-3 px-6 py-3 bg-gray-50 dark:bg-surface-900/50 border-b border-gray-100 dark:border-surface-700 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              <div className="col-span-3">Invoice #</div>
              <div className="col-span-3">Client</div>
              <div className="col-span-2">Date</div>
              <div className="col-span-1">Status</div>
              <div className="col-span-2 text-right">Amount</div>
              <div className="col-span-1" />
            </div>

            <AnimatePresence>
              {filtered.map((inv, i) => (
                <motion.div key={inv._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: i * 0.03 }}
                  className="grid grid-cols-2 sm:grid-cols-12 gap-3 items-center px-6 py-4 border-b border-gray-50 dark:border-surface-800 table-row-hover last:border-0"
                >
                  <div className="sm:col-span-3">
                    <div className="font-semibold text-sm text-gray-900 dark:text-white">{inv.invoiceNumber}</div>
                    <div className="text-xs text-gray-400 sm:hidden">{inv.clientName}</div>
                  </div>
                  <div className="hidden sm:block sm:col-span-3">
                    <div className="text-sm text-gray-700 dark:text-gray-300">{inv.clientName}</div>
                    {inv.clientEmail && <div className="text-xs text-gray-400">{inv.clientEmail}</div>}
                  </div>
                  <div className="hidden sm:block sm:col-span-2 text-sm text-gray-500">{formatDate(inv.createdAt)}</div>
                  <div className="hidden sm:flex sm:col-span-1">
                    <span className={getStatusColor(inv.status)}>{inv.status}</span>
                  </div>
                  <div className="sm:col-span-2 text-right">
                    <div className="font-bold text-gray-900 dark:text-white text-sm">{formatCurrency(inv.total, inv.currency ?? 'USD')}</div>
                    <span className={`badge sm:hidden ${getStatusColor(inv.status)}`}>{inv.status}</span>
                  </div>
                  <div className="sm:col-span-1 flex justify-end items-center gap-1">
                    <Link href={`/invoices/${inv._id}`} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-900/10 transition-all" title="Edit">
                      <Edit className="w-3.5 h-3.5" />
                    </Link>
                    <button
                      onClick={() => handleDelete(inv._id)}
                      disabled={deleting === inv._id}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all disabled:opacity-50"
                      title="Delete"
                    >
                      {deleting === inv._id
                        ? <div className="w-3.5 h-3.5 border-2 border-red-400/30 border-t-red-500 rounded-full animate-spin" />
                        : <Trash2 className="w-3.5 h-3.5" />
                      }
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </>
        )}
      </motion.div>
    </motion.div>
  )
}
