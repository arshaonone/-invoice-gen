'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import {
  Plus, Trash2, Download, Printer, Save, Eye, EyeOff,
  Upload, RefreshCw, ChevronDown
} from 'lucide-react'
import { generateInvoiceNumber, calcInvoiceTotals, CURRENCIES, formatCurrency, getCurrencySymbol, LANGS } from '@/lib/utils'
import { downloadInvoicePDF, printInvoice } from '@/lib/pdf'
import MinimalTemplate from '@/components/invoice/templates/MinimalTemplate'
import ModernTemplate from '@/components/invoice/templates/ModernTemplate'
import BoldTemplate from '@/components/invoice/templates/BoldTemplate'
import type { InvoiceItem } from '@/models/Invoice'

export interface InvoiceData {
  invoiceNumber: string
  status: string
  template: 'minimal' | 'modern' | 'bold'
  brandColor: string
  currency: string
  language: 'en' | 'bn'
  senderName: string
  senderEmail: string
  senderAddress: string
  senderPhone: string
  senderLogo: string
  clientName: string
  clientEmail: string
  clientAddress: string
  clientPhone: string
  clientCompany: string
  invoiceDate: string
  dueDate: string
  items: InvoiceItem[]
  discount: number
  notes: string
  footerNote: string
  subtotal: number
  taxAmount: number
  total: number
}

const defaultItem = (): InvoiceItem => ({
  id: crypto.randomUUID(),
  name: '',
  description: '',
  quantity: 1,
  unitPrice: 0,
  taxRate: 0,
  total: 0,
})

const defaultData = (): InvoiceData => ({
  invoiceNumber: generateInvoiceNumber(),
  status: 'draft',
  template: 'minimal',
  brandColor: '#6366f1',
  currency: 'USD',
  language: 'en',
  senderName: '',
  senderEmail: '',
  senderAddress: '',
  senderPhone: '',
  senderLogo: '',
  clientName: '',
  clientEmail: '',
  clientAddress: '',
  clientPhone: '',
  clientCompany: '',
  invoiceDate: new Date().toISOString().split('T')[0],
  dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
  items: [defaultItem()],
  discount: 0,
  notes: '',
  footerNote: 'Thank you for your business!',
  subtotal: 0,
  taxAmount: 0,
  total: 0,
})

const TEMPLATES = [
  { id: 'minimal', label: 'Minimal', color: '#6366f1' },
  { id: 'modern',  label: 'Modern',  color: '#8b5cf6' },
  { id: 'bold',    label: 'Bold',    color: '#ec4899' },
] as const

export default function InvoiceCreator({ invoiceId }: { invoiceId?: string }) {
  const router        = useRouter()
  const [data, setData]       = useState<InvoiceData>(defaultData())
  const [loading, setLoading] = useState(false)
  const [saving, setSaving]   = useState(false)
  const [preview, setPreview] = useState(true)
  const logoInputRef          = useRef<HTMLInputElement>(null)

  // Load existing invoice
  useEffect(() => {
    if (!invoiceId) return
    setLoading(true)
    fetch(`/api/invoices/${invoiceId}`)
      .then(r => r.json())
      .then(inv => {
        setData({ ...defaultData(), ...inv, invoiceDate: inv.invoiceDate?.split('T')[0] ?? '', dueDate: inv.dueDate?.split('T')[0] ?? '' })
        setLoading(false)
      })
      .catch(() => { toast.error('Failed to load invoice'); setLoading(false) })
  }, [invoiceId])

  // Recalculate totals whenever items / discount change
  const recalc = useCallback((items: InvoiceItem[], discount: number) => {
    const { subtotal, taxAmount, total } = calcInvoiceTotals(items, discount)
    setData(prev => ({ ...prev, items, discount, subtotal, taxAmount, total }))
  }, [])

  const setField = <K extends keyof InvoiceData>(key: K, value: InvoiceData[K]) => {
    setData(prev => ({ ...prev, [key]: value }))
  }

  // Item handlers
  const updateItem = (id: string, patch: Partial<InvoiceItem>) => {
    const items = data.items.map(item => {
      if (item.id !== id) return item
      const updated = { ...item, ...patch }
      updated.total = updated.quantity * updated.unitPrice * (1 + updated.taxRate / 100)
      return updated
    })
    recalc(items, data.discount)
  }

  const addItem    = () => recalc([...data.items, defaultItem()], data.discount)
  const removeItem = (id: string) => recalc(data.items.filter(i => i.id !== id), data.discount)

  // Logo upload
  const handleLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => setField('senderLogo', reader.result as string)
    reader.readAsDataURL(file)
  }

  // Save invoice
  const handleSave = async (status = data.status) => {
    setSaving(true)
    try {
      const payload = { ...data, status }
      const method  = invoiceId ? 'PUT' : 'POST'
      const url     = invoiceId ? `/api/invoices/${invoiceId}` : '/api/invoices'

      const res  = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const json = await res.json()

      if (!res.ok) { toast.error(json.error ?? 'Save failed'); setSaving(false); return }
      toast.success(invoiceId ? 'Invoice updated!' : 'Invoice saved!')
      if (!invoiceId) router.push(`/invoices/${json._id}`)
    } catch {
      toast.error('Something went wrong')
    }
    setSaving(false)
  }

  const sym = getCurrencySymbol(data.currency)
  const t   = LANGS[data.language]

  const TemplateComponent = data.template === 'modern' ? ModernTemplate : data.template === 'bold' ? BoldTemplate : MinimalTemplate

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-3 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="max-w-screen-2xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-display font-700 text-gray-900 dark:text-white">
            {invoiceId ? 'Edit Invoice' : 'Create Invoice'}
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">{data.invoiceNumber}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={() => setPreview(!preview)} className="btn-ghost gap-2 text-sm">
            {preview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {preview ? 'Hide Preview' : 'Show Preview'}
          </button>
          <button onClick={() => printInvoice('invoice-preview')} className="btn-ghost gap-2 text-sm">
            <Printer className="w-4 h-4" /> Print
          </button>
          <button onClick={() => downloadInvoicePDF('invoice-preview', `${data.invoiceNumber}.pdf`)} className="btn-secondary gap-2 text-sm">
            <Download className="w-4 h-4" /> PDF
          </button>
          <button onClick={() => handleSave('sent')} disabled={saving} className="btn-secondary gap-2 text-sm">
            Mark Sent
          </button>
          <button onClick={() => handleSave()} disabled={saving} className="btn-primary gap-2 text-sm">
            {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
            {invoiceId ? 'Update' : 'Save'}
          </button>
        </div>
      </div>

      <div className={`grid gap-6 ${preview ? 'xl:grid-cols-2' : 'grid-cols-1'}`}>
        {/* ─── FORM PANEL ─── */}
        <div className="space-y-5">
          {/* Settings row */}
          <div className="card p-5 grid sm:grid-cols-3 gap-4">
            {/* Template picker */}
            <div>
              <label className="label">Template</label>
              <div className="flex gap-2">
                {TEMPLATES.map(tmpl => (
                  <button
                    key={tmpl.id}
                    onClick={() => setField('template', tmpl.id)}
                    className={`flex-1 py-2 text-xs font-semibold rounded-lg border-2 transition-all ${data.template === tmpl.id ? 'border-brand-500 text-brand-500 bg-brand-50 dark:bg-brand-900/20' : 'border-gray-200 dark:border-surface-600 text-gray-500'}`}
                  >
                    {tmpl.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Currency */}
            <div>
              <label className="label">Currency</label>
              <div className="relative">
                <select value={data.currency} onChange={e => setField('currency', e.target.value)} className="input appearance-none pr-8">
                  {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.code} — {c.symbol}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Language + Brand color */}
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="label">Lang</label>
                <select value={data.language} onChange={e => setField('language', e.target.value as 'en' | 'bn')} className="input">
                  <option value="en">English</option>
                  <option value="bn">বাংলা</option>
                </select>
              </div>
              <div>
                <label className="label">Color</label>
                <input type="color" value={data.brandColor} onChange={e => setField('brandColor', e.target.value)}
                  className="w-full h-10 rounded-xl cursor-pointer border border-gray-200 dark:border-surface-600 bg-transparent" />
              </div>
            </div>
          </div>

          {/* Invoice meta */}
          <div className="card p-5 grid sm:grid-cols-3 gap-4">
            <div>
              <label className="label">Invoice #</label>
              <div className="flex gap-2">
                <input value={data.invoiceNumber} onChange={e => setField('invoiceNumber', e.target.value)} className="input flex-1" />
                <button onClick={() => setField('invoiceNumber', generateInvoiceNumber())} className="px-3 py-2 border border-gray-200 dark:border-surface-600 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div>
              <label className="label">Invoice Date</label>
              <input type="date" value={data.invoiceDate} onChange={e => setField('invoiceDate', e.target.value)} className="input" />
            </div>
            <div>
              <label className="label">Due Date</label>
              <input type="date" value={data.dueDate} onChange={e => setField('dueDate', e.target.value)} className="input" />
            </div>
          </div>

          {/* Sender + Client */}
          <div className="grid sm:grid-cols-2 gap-5">
            {/* Sender */}
            <div className="card p-5 space-y-3">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">From (Sender)</h3>
                <button onClick={() => logoInputRef.current?.click()} className="flex items-center gap-1.5 text-xs text-brand-500 hover:text-brand-600">
                  <Upload className="w-3.5 h-3.5" /> Logo
                </button>
                <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogo} />
              </div>
              {data.senderLogo && (
                <div className="flex items-center gap-2">
                  <img src={data.senderLogo} alt="Logo" className="h-10 object-contain rounded" />
                  <button onClick={() => setField('senderLogo', '')} className="text-xs text-red-400 hover:text-red-600">Remove</button>
                </div>
              )}
              {[
                { key: 'senderName', label: 'Name / Business', placeholder: 'Acme Corp' },
                { key: 'senderEmail', label: 'Email', placeholder: 'billing@acme.com' },
                { key: 'senderPhone', label: 'Phone', placeholder: '+1 555 000 0000' },
                { key: 'senderAddress', label: 'Address', placeholder: '123 Main St, City' },
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className="label">{label}</label>
                  <input value={(data as any)[key]} onChange={e => setField(key as keyof InvoiceData, e.target.value)} placeholder={placeholder} className="input" />
                </div>
              ))}
            </div>

            {/* Client */}
            <div className="card p-5 space-y-3">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Bill To (Client)</h3>
              {[
                { key: 'clientName', label: 'Name', placeholder: 'John Client' },
                { key: 'clientCompany', label: 'Company', placeholder: 'Client LLC' },
                { key: 'clientEmail', label: 'Email', placeholder: 'client@example.com' },
                { key: 'clientPhone', label: 'Phone', placeholder: '+1 555 999 9999' },
                { key: 'clientAddress', label: 'Address', placeholder: '456 Oak Ave, Town' },
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className="label">{label}</label>
                  <input value={(data as any)[key]} onChange={e => setField(key as keyof InvoiceData, e.target.value)} placeholder={placeholder} className="input" />
                </div>
              ))}
            </div>
          </div>

          {/* Line items */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Line Items</h3>
              <button onClick={addItem} className="btn-ghost text-sm gap-1.5 text-brand-500 hover:text-brand-600">
                <Plus className="w-4 h-4" /> Add Item
              </button>
            </div>

            {/* Header */}
            <div className="grid grid-cols-12 gap-2 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider px-1">
              <div className="col-span-4">Description</div>
              <div className="col-span-2 text-center">Qty</div>
              <div className="col-span-2 text-center">Price</div>
              <div className="col-span-2 text-center">Tax %</div>
              <div className="col-span-1 text-right">Total</div>
              <div className="col-span-1" />
            </div>

            <div className="space-y-2">
              {data.items.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="grid grid-cols-12 gap-2 items-center"
                >
                  <div className="col-span-4">
                    <input value={item.name} onChange={e => updateItem(item.id, { name: e.target.value })} placeholder="Item name" className="input text-sm" />
                  </div>
                  <div className="col-span-2">
                    <input type="number" min="0" step="0.01" value={item.quantity} onChange={e => updateItem(item.id, { quantity: parseFloat(e.target.value) || 0 })} className="input text-sm text-center" />
                  </div>
                  <div className="col-span-2">
                    <div className="relative">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">{sym}</span>
                      <input type="number" min="0" step="0.01" value={item.unitPrice} onChange={e => updateItem(item.id, { unitPrice: parseFloat(e.target.value) || 0 })} className="input text-sm pl-5" />
                    </div>
                  </div>
                  <div className="col-span-2">
                    <div className="relative">
                      <input type="number" min="0" max="100" step="0.1" value={item.taxRate} onChange={e => updateItem(item.id, { taxRate: parseFloat(e.target.value) || 0 })} className="input text-sm pr-6" />
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">%</span>
                    </div>
                  </div>
                  <div className="col-span-1 text-right">
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{sym}{item.total.toFixed(2)}</span>
                  </div>
                  <div className="col-span-1 flex justify-end">
                    <button onClick={() => removeItem(item.id)} disabled={data.items.length === 1} className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-300 dark:text-gray-600 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 disabled:opacity-30 transition-all">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Totals */}
            <div className="mt-6 border-t border-gray-100 dark:border-surface-700 pt-4 space-y-2 max-w-xs ml-auto">
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>{t.subtotal}</span>
                <span>{formatCurrency(data.subtotal, data.currency)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>{t.taxTotal}</span>
                <span>{formatCurrency(data.taxAmount, data.currency)}</span>
              </div>
              <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
                <span>{t.discount}</span>
                <div className="flex items-center gap-1">
                  <span className="text-xs">{sym}</span>
                  <input type="number" min="0" step="0.01" value={data.discount} onChange={e => recalc(data.items, parseFloat(e.target.value) || 0)} className="w-24 input text-sm text-right py-1 px-2" />
                </div>
              </div>
              <div className="flex justify-between text-base font-bold text-gray-900 dark:text-white pt-2 border-t border-gray-100 dark:border-surface-700">
                <span>{t.total}</span>
                <span style={{ color: data.brandColor }}>{formatCurrency(data.total, data.currency)}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="card p-5 grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">{t.notes}</label>
              <textarea value={data.notes} onChange={e => setField('notes', e.target.value)} rows={3} placeholder="Payment terms, bank details..." className="input resize-none" />
            </div>
            <div>
              <label className="label">Footer Note</label>
              <textarea value={data.footerNote} onChange={e => setField('footerNote', e.target.value)} rows={3} placeholder={t.thankYou} className="input resize-none" />
            </div>
          </div>
        </div>

        {/* ─── LIVE PREVIEW PANEL ─── */}
        {preview && (
          <div className="sticky top-4 h-fit">
            <div className="card p-4 mb-3 flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Live Preview</span>
              <div className="flex items-center gap-2">
                {TEMPLATES.map(tmpl => (
                  <button key={tmpl.id} onClick={() => setField('template', tmpl.id)}
                    className={`w-4 h-4 rounded-full border-2 transition-all ${data.template === tmpl.id ? 'scale-125 border-brand-500' : 'border-gray-300 dark:border-surface-500'}`}
                    style={{ backgroundColor: tmpl.color }} title={tmpl.label}
                  />
                ))}
              </div>
            </div>
            <div className="rounded-2xl overflow-hidden shadow-2xl border border-gray-100 dark:border-surface-600 bg-white max-h-[calc(100vh-10rem)] overflow-y-auto scrollbar-thin">
              <div id="invoice-preview">
                <TemplateComponent data={data} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
