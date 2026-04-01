'use client'

import { useState, useCallback, useRef } from 'react'
import React from 'react'
import { useReactToPrint } from 'react-to-print'
import toast from 'react-hot-toast'
import {
  Plus, Trash2, Download, Printer, RotateCcw, FileText,
  ChevronDown, X, Upload, RefreshCw, Settings2
} from 'lucide-react'
import { getCurrencySymbol, CURRENCIES } from '@/lib/utils'

/* ── Types ──────────────────────────────────────────────── */
export interface InvoiceItem {
  id: string
  name: string
  description: string
  quantity: number
  unitPrice: number
  total: number
}

export interface InvoiceData {
  invoiceNumber: string
  brandColor: string
  currency: string
  senderInfo: string
  senderLogo: string
  clientName: string
  clientAddress: string
  invoiceDate: string
  paymentTerms: string
  dueDate: string
  poNumber: string
  items: InvoiceItem[]
  discount: number
  taxRate: number
  shipping: number
  amountPaid: number
  notes: string
  terms: string
  footerNote: string
  subtotal: number
  taxAmount: number
  total: number
}

/* ── Defaults ────────────────────────────────────────────── */
const defaultItem = (): InvoiceItem => ({
  id: crypto.randomUUID(),
  name: '',
  description: '',
  quantity: 1,
  unitPrice: 0,
  total: 0,
})

const defaultData = (): InvoiceData => ({
  invoiceNumber: '1',
  brandColor: '#1a73e8',
  currency: 'USD',
  senderInfo: '',
  senderLogo: '',
  clientName: '',
  clientAddress: '',
  invoiceDate: new Date().toISOString().split('T')[0],
  paymentTerms: '',
  dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
  poNumber: '',
  items: [defaultItem()],
  discount: 0,
  taxRate: 0,
  shipping: 0,
  amountPaid: 0,
  notes: '',
  terms: '',
  footerNote: 'Thank you for your business!',
  subtotal: 0,
  taxAmount: 0,
  total: 0,
})

/* ── Calc ────────────────────────────────────────────────── */
function calcAll(items: InvoiceItem[], discount: number, taxRate: number, shipping: number) {
  const subtotal = items.reduce((a, i) => a + i.quantity * i.unitPrice, 0)
  const taxAmount = subtotal * (taxRate / 100)
  const total = Math.max(0, subtotal + taxAmount + shipping - discount)
  return { subtotal, taxAmount, total }
}

/* ── Input style helper ──────────────────────────────────── */
function cls(...parts: string[]) { return parts.filter(Boolean).join(' ') }

const inputBase = 'w-full border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all bg-white'

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   INVOICE CREATOR — Main Component
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
export default function InvoiceCreator() {
  const [data, setData] = useState<InvoiceData>(defaultData())
  const [showSettings, setShowSettings] = useState(false)
  const [showBanner, setShowBanner] = useState(true)
  const printRef = useRef<HTMLDivElement>(null)
  const logoInputRef = useRef<HTMLInputElement>(null)

  const set = <K extends keyof InvoiceData>(key: K, val: InvoiceData[K]) =>
    setData(prev => ({ ...prev, [key]: val }))

  const recalc = useCallback((
    items: InvoiceItem[],
    discount = data.discount,
    taxRate = data.taxRate,
    shipping = data.shipping,
  ) => {
    const { subtotal, taxAmount, total } = calcAll(items, discount, taxRate, shipping)
    setData(prev => ({ ...prev, items, discount, taxRate, shipping, subtotal, taxAmount, total }))
  }, [data.discount, data.taxRate, data.shipping])

  /* items */
  const updateItem = (id: string, patch: Partial<InvoiceItem>) => {
    const items = data.items.map(item => {
      if (item.id !== id) return item
      const u = { ...item, ...patch }
      u.total = u.quantity * u.unitPrice
      return u
    })
    recalc(items)
  }
  const addItem = () => recalc([...data.items, defaultItem()])
  const removeItem = (id: string) => recalc(data.items.filter(i => i.id !== id))

  /* logo */
  const handleLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => set('senderLogo', reader.result as string)
    reader.readAsDataURL(file)
  }

  /* print / PDF */
  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `Invoice-${data.invoiceNumber}`,
    onBeforeGetContent: () => new Promise<void>(resolve => setTimeout(resolve, 300)),
  })

  const sym = getCurrencySymbol(data.currency)
  const balanceDue = Math.max(0, data.total - data.amountPaid)

  return (
    <div className="min-h-screen bg-[#f5f7fa] font-sans">

      {/* ── Top Nav Bar ── */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 print:hidden shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-green-500 flex items-center justify-center shadow-sm">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900 text-sm">
              Invoice-<span className="text-green-500">Generator</span>
              <span className="text-gray-400 font-normal">.com</span>
            </span>
          </div>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-6 text-sm text-gray-500">
            <a href="#" className="hover:text-gray-800 transition">Help</a>
            <a href="#" className="hover:text-gray-800 transition">History</a>
            <a href="#" className="hover:text-gray-800 transition">Invoicing Guide</a>
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="flex items-center gap-1.5 text-xs text-gray-600 border border-gray-200 rounded-md px-3 py-1.5 hover:bg-gray-50 transition"
            >
              <Settings2 className="w-3.5 h-3.5" /> Settings
            </button>
            <button
              onClick={() => {
                toast.promise(
                  new Promise<void>((resolve) => {
                    handlePrint()
                    setTimeout(resolve, 500)
                  }),
                  { loading: 'Preparing PDF…', success: 'Download ready!', error: 'Failed' }
                )
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-green-500 hover:bg-green-600 rounded-md transition shadow-sm"
            >
              <Download className="w-3.5 h-3.5" /> Download PDF
            </button>
          </div>
        </div>
      </header>

      {/* ── Settings Drawer ── */}
      {showSettings && (
        <div className="bg-indigo-50 border-b border-indigo-100 print:hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap gap-4 items-center">
            <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">Invoice Settings</span>

            {/* Currency */}
            <label className="flex items-center gap-2 text-xs text-gray-600">
              <span className="font-medium">Currency</span>
              <div className="relative">
                <select
                  value={data.currency}
                  onChange={e => set('currency', e.target.value)}
                  className="text-xs border border-gray-200 rounded-md px-2 py-1.5 pr-7 bg-white text-gray-700 focus:outline-none focus:border-indigo-400 appearance-none cursor-pointer"
                >
                  {CURRENCIES.map(c => (
                    <option key={c.code} value={c.code}>{c.code} – {c.symbol}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
              </div>
            </label>

            {/* Brand Color */}
            <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
              <span className="font-medium">Brand Color</span>
              <div className="relative">
                <input
                  type="color"
                  value={data.brandColor}
                  onChange={e => set('brandColor', e.target.value)}
                  className="w-8 h-8 rounded-md cursor-pointer border border-gray-200 p-0.5 bg-white"
                  title="Choose brand color"
                />
              </div>
              <span className="text-gray-400 font-mono text-xs">{data.brandColor}</span>
            </label>

            <button
              onClick={() => setShowSettings(false)}
              className="ml-auto text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1 transition"
            >
              <X className="w-3.5 h-3.5" /> Close
            </button>
          </div>
        </div>
      )}

      {/* ── Info Banner ── */}
      {showBanner && (
        <div className="bg-white border-b border-gray-100 print:hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 relative">
            <button
              onClick={() => setShowBanner(false)}
              className="absolute top-4 right-4 text-gray-300 hover:text-gray-500 transition"
            >
              <X className="w-4 h-4" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Free Invoice Template</h1>
            <p className="text-green-600 font-semibold text-sm mb-2">Create professional invoices with one click!</p>
            <p className="text-sm text-gray-500 max-w-2xl">
              Invoice Generator is the original free invoice maker, trusted by over 4 million businesses worldwide.
              Quickly create, customize, and send invoices directly from your browser.
            </p>
          </div>
        </div>
      )}

      {/* ── Main Body: Invoice + Sidebar ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 print:hidden">
        <div className="flex flex-col lg:flex-row gap-6 items-start">

          {/* ── INVOICE CARD ── */}
          <div className="flex-1 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">

            {/* ── Header: Logo + INVOICE title ── */}
            <div className="p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6 mb-7">

                {/* Logo Section */}
                <div>
                  {data.senderLogo ? (
                    <div className="relative group inline-block">
                      <img
                        src={data.senderLogo}
                        alt="Logo"
                        className="h-20 w-44 object-contain border-2 border-dashed border-gray-200 rounded-lg p-1"
                      />
                      <button
                        onClick={() => set('senderLogo', '')}
                        className="absolute -top-2 -right-2 w-5 h-5 bg-red-400 hover:bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow"
                      >×</button>
                    </div>
                  ) : (
                    <button
                      onClick={() => logoInputRef.current?.click()}
                      className="h-20 w-44 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-1.5 text-gray-400 hover:border-blue-400 hover:text-blue-400 hover:bg-blue-50 transition group"
                    >
                      <Upload className="w-5 h-5 group-hover:scale-110 transition-transform" />
                      <span className="text-xs font-medium">+ Add Your Logo</span>
                    </button>
                  )}
                  <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogo} />
                </div>

                {/* INVOICE title + number */}
                <div className="flex flex-col sm:items-end gap-3">
                  <h2
                    className="text-4xl font-black tracking-widest uppercase"
                    style={{ color: data.brandColor }}
                  >INVOICE</h2>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-400">#</span>
                    <input
                      value={data.invoiceNumber}
                      onChange={e => set('invoiceNumber', e.target.value)}
                      className="w-28 border border-gray-200 rounded-md px-2.5 py-1.5 text-sm text-right font-semibold focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
                      placeholder="1"
                    />
                    <button
                      onClick={() => set('invoiceNumber', String(Math.floor(Math.random() * 9000) + 1000))}
                      title="Auto-generate number"
                      className="text-gray-300 hover:text-blue-500 transition"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* ── Sender Info ── */}
              <div className="mb-5">
                <textarea
                  value={data.senderInfo}
                  onChange={e => set('senderInfo', e.target.value)}
                  placeholder="Who is this from? (Your name, company, email, phone, address...)"
                  rows={3}
                  className={cls(inputBase, 'resize-none')}
                />
              </div>

              {/* ── Bill To / Ship To  +  Date Fields ── */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Left: Bill To + Ship To */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Bill To</label>
                    <textarea
                      value={data.clientName}
                      onChange={e => set('clientName', e.target.value)}
                      placeholder="Who is this to? (Client name, company, address...)"
                      rows={3}
                      className={cls(inputBase, 'resize-none')}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Ship To</label>
                    <textarea
                      value={data.clientAddress}
                      onChange={e => set('clientAddress', e.target.value)}
                      placeholder="Shipping address (optional)"
                      rows={2}
                      className={cls(inputBase, 'resize-none')}
                    />
                  </div>
                </div>

                {/* Right: Date fields */}
                <div className="space-y-3">
                  {[
                    { label: 'Date',          key: 'invoiceDate',  type: 'date' },
                    { label: 'Payment Terms', key: 'paymentTerms', type: 'text', placeholder: 'e.g. Net 30' },
                    { label: 'Due Date',      key: 'dueDate',      type: 'date' },
                    { label: 'PO Number',     key: 'poNumber',     type: 'text', placeholder: 'PO-0001' },
                  ].map(({ label, key, type, placeholder }) => (
                    <div key={key} className="flex items-center gap-3">
                      <label className="text-xs text-gray-500 font-medium w-32 shrink-0">{label}</label>
                      <input
                        type={type}
                        value={(data as any)[key]}
                        onChange={e => set(key as keyof InvoiceData, e.target.value)}
                        placeholder={placeholder ?? label}
                        className={cls(inputBase, 'flex-1')}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Line Items ── */}
            <div className="border-t border-gray-100">
              {/* Table header — hidden on mobile, shown on sm+ */}
              <div
                className="hidden sm:grid gap-2 px-6 sm:px-8 py-3 text-xs font-bold uppercase tracking-wider text-white"
                style={{ background: '#1a1a2e', gridTemplateColumns: '1fr 90px 100px 100px 36px' }}
              >
                <div>Item</div>
                <div className="text-center">Qty</div>
                <div className="text-center">Rate</div>
                <div className="text-right">Amount</div>
                <div />
              </div>
              {/* Mobile table header */}
              <div className="sm:hidden px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white" style={{ background: '#1a1a2e' }}>
                Line Items
              </div>

              {/* Item rows */}
              <div className="px-6 sm:px-8 py-4 space-y-3">
                {data.items.map((item) => (
                  <div key={item.id} className="space-y-0">
                    {/* Desktop row */}
                    <div
                      className="hidden sm:grid gap-2 items-start"
                      style={{ gridTemplateColumns: '1fr 90px 100px 100px 36px' }}
                    >
                      <div>
                        <input
                          value={item.name}
                          onChange={e => updateItem(item.id, { name: e.target.value })}
                          placeholder="Description of item/service..."
                          className={inputBase}
                        />
                        <input
                          value={item.description}
                          onChange={e => updateItem(item.id, { description: e.target.value })}
                          placeholder="Additional details (optional)"
                          className={cls(inputBase, 'mt-1.5 text-xs')}
                        />
                      </div>
                      <input
                        type="number" min="0" step="0.01"
                        value={item.quantity}
                        onChange={e => updateItem(item.id, { quantity: parseFloat(e.target.value) || 0 })}
                        className={cls(inputBase, 'text-center')}
                      />
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">{sym}</span>
                        <input
                          type="number" min="0" step="0.01"
                          value={item.unitPrice}
                          onChange={e => updateItem(item.id, { unitPrice: parseFloat(e.target.value) || 0 })}
                          className={cls(inputBase, 'pl-6 text-right')}
                        />
                      </div>
                      <div className="flex items-center justify-end pt-2">
                        <span className="text-sm font-semibold text-gray-700">{sym}{item.total.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-end pt-1.5">
                        <button onClick={() => removeItem(item.id)} disabled={data.items.length === 1}
                          className="text-gray-300 hover:text-red-400 disabled:opacity-20 transition" title="Remove">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Mobile card */}
                    <div className="sm:hidden bg-gray-50 border border-gray-200 rounded-lg p-3 space-y-2">
                      <div className="flex items-start gap-2">
                        <input
                          value={item.name}
                          onChange={e => updateItem(item.id, { name: e.target.value })}
                          placeholder="Item description..."
                          className={cls(inputBase, 'flex-1')}
                        />
                        <button onClick={() => removeItem(item.id)} disabled={data.items.length === 1}
                          className="mt-2 text-gray-300 hover:text-red-400 disabled:opacity-20 transition shrink-0" title="Remove">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <input
                        value={item.description}
                        onChange={e => updateItem(item.id, { description: e.target.value })}
                        placeholder="Additional details (optional)"
                        className={cls(inputBase, 'text-xs')}
                      />
                      <div className="grid grid-cols-3 gap-2 items-end">
                        <div>
                          <label className="text-xs text-gray-400 mb-1 block">Qty</label>
                          <input type="number" min="0" step="0.01"
                            value={item.quantity}
                            onChange={e => updateItem(item.id, { quantity: parseFloat(e.target.value) || 0 })}
                            className={cls(inputBase, 'text-center')}
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-400 mb-1 block">Rate ({sym})</label>
                          <input type="number" min="0" step="0.01"
                            value={item.unitPrice}
                            onChange={e => updateItem(item.id, { unitPrice: parseFloat(e.target.value) || 0 })}
                            className={cls(inputBase, 'text-right')}
                          />
                        </div>
                        <div className="text-right pb-1">
                          <div className="text-xs text-gray-400 mb-1">Amount</div>
                          <div className="text-sm font-bold text-gray-800">{sym}{item.total.toFixed(2)}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add line item */}
              <div className="px-6 sm:px-8 pb-5">
                <button
                  onClick={addItem}
                  className="flex items-center gap-1.5 text-xs font-semibold text-green-600 border border-green-300 bg-green-50 hover:bg-green-100 rounded-md px-3 py-1.5 transition"
                >
                  <Plus className="w-3.5 h-3.5" /> Line Item
                </button>
              </div>
            </div>

            {/* ── Notes + Totals ── */}
            <div className="px-6 sm:px-8 py-7 grid grid-cols-1 sm:grid-cols-2 gap-8 border-t border-gray-100 bg-gray-50/50">

              {/* Left: Notes + Terms */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-amber-600 mb-1.5 uppercase tracking-wide">Notes</label>
                  <textarea
                    value={data.notes}
                    onChange={e => set('notes', e.target.value)}
                    rows={3}
                    placeholder="Notes — any relevant information not already covered"
                    className={cls(inputBase, 'resize-none text-amber-700 placeholder-amber-300 border-amber-200 focus:border-amber-400 focus:ring-amber-100')}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-amber-600 mb-1.5 uppercase tracking-wide">Terms</label>
                  <textarea
                    value={data.terms}
                    onChange={e => set('terms', e.target.value)}
                    rows={3}
                    placeholder="Terms and conditions — late fees, payment methods, delivery schedule"
                    className={cls(inputBase, 'resize-none text-amber-700 placeholder-amber-300 border-amber-200 focus:border-amber-400 focus:ring-amber-100')}
                  />
                </div>
              </div>

              {/* Right: Totals */}
              <div className="space-y-2">
                {/* Subtotal */}
                <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
                  <span className="text-sm text-gray-600 font-medium">Subtotal</span>
                  <span className="text-sm font-semibold text-gray-800">{sym}{data.subtotal.toFixed(2)}</span>
                </div>

                {/* Tax */}
                <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
                  <span className="text-sm text-gray-600 font-medium">Tax</span>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={data.taxRate}
                      onChange={e => {
                        const taxRate = parseFloat(e.target.value) || 0
                        const { subtotal, taxAmount, total } = calcAll(data.items, data.discount, taxRate, data.shipping)
                        setData(prev => ({ ...prev, taxRate, subtotal, taxAmount, total }))
                      }}
                      className="w-16 border border-gray-200 rounded-md px-2 py-1 text-xs text-right focus:outline-none focus:border-blue-400 bg-white"
                    />
                    <span className="text-xs text-gray-400">%</span>
                    <span className="text-sm text-gray-700 font-medium w-20 text-right">{sym}{data.taxAmount.toFixed(2)}</span>
                  </div>
                </div>

                {/* Discount */}
                <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
                  <span className="text-sm text-blue-500 font-medium">Discount</span>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={data.discount}
                      onChange={e => recalc(data.items, parseFloat(e.target.value) || 0)}
                      className="w-16 border border-gray-200 rounded-md px-2 py-1 text-xs text-right focus:outline-none focus:border-blue-400 bg-white"
                    />
                    <span className="text-xs text-gray-400">{sym}</span>
                  </div>
                </div>

                {/* Shipping */}
                <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
                  <span className="text-sm text-blue-500 font-medium">Shipping</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-gray-400">{sym}</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={data.shipping}
                      onChange={e => {
                        const shipping = parseFloat(e.target.value) || 0
                        const { subtotal, taxAmount, total } = calcAll(data.items, data.discount, data.taxRate, shipping)
                        setData(prev => ({ ...prev, shipping, subtotal, taxAmount, total }))
                      }}
                      className="w-16 border border-gray-200 rounded-md px-2 py-1 text-xs text-right focus:outline-none focus:border-blue-400 bg-white"
                    />
                  </div>
                </div>

                {/* Total */}
                <div className="flex justify-between items-center py-3 border-b-2 border-gray-200">
                  <span className="font-bold text-gray-900 text-base">Total</span>
                  <span className="font-bold text-lg" style={{ color: data.brandColor }}>
                    {sym}{data.total.toFixed(2)}
                  </span>
                </div>

                {/* Amount Paid */}
                <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
                  <span className="text-sm text-blue-500 font-medium">Amount Paid</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-gray-400">{sym}</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={data.amountPaid}
                      onChange={e => set('amountPaid', parseFloat(e.target.value) || 0)}
                      className="w-20 border border-gray-200 rounded-md px-2 py-1 text-xs text-right focus:outline-none focus:border-blue-400 bg-white"
                    />
                  </div>
                </div>

                {/* Balance Due */}
                <div className="flex justify-between items-center pt-3 border-t-2 border-gray-900">
                  <span className="font-black text-gray-900 text-base">Balance Due</span>
                  <span className="font-black text-xl text-gray-900">
                    {sym}{balanceDue.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* ── Footer Note ── */}
            <div className="px-6 sm:px-8 py-4 border-t border-gray-100 flex items-center justify-between gap-4 bg-white">
              <input
                value={data.footerNote}
                onChange={e => set('footerNote', e.target.value)}
                placeholder="Thank you for your business!"
                className="text-sm text-gray-400 border-b border-dashed border-gray-200 focus:outline-none focus:border-blue-400 bg-transparent flex-1 py-1"
              />
            </div>

          </div>{/* end invoice card */}

          {/* ── RIGHT SIDEBAR ── */}
          <div className="lg:w-56 shrink-0 flex flex-col gap-3">

            {/* Download button */}
            <button
              onClick={() => {
                toast.promise(
                  new Promise<void>((resolve) => {
                    handlePrint()
                    setTimeout(resolve, 500)
                  }),
                  { loading: 'Preparing PDF…', success: 'Download ready!', error: 'Failed' }
                )
              }}
              className="w-full flex items-center justify-center gap-2 py-3 text-sm font-bold text-white rounded-lg transition shadow-md hover:shadow-lg active:scale-95"
              style={{ background: data.brandColor }}
            >
              <Download className="w-4 h-4" />
              ↓ Download
            </button>

            {/* Print button */}
            <button
              onClick={handlePrint}
              className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>

            {/* Invoice Settings panel */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4 shadow-sm">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide">Invoice Settings</h3>

              {/* Currency */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Currency</label>
                <div className="relative">
                  <select
                    value={data.currency}
                    onChange={e => set('currency', e.target.value)}
                    className="w-full text-sm border border-gray-200 rounded-md px-2.5 py-2 pr-8 bg-white text-gray-700 focus:outline-none focus:border-blue-400 appearance-none cursor-pointer"
                  >
                    {CURRENCIES.map(c => (
                      <option key={c.code} value={c.code}>{c.code} – {c.symbol}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Brand Color */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Brand Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={data.brandColor}
                    onChange={e => set('brandColor', e.target.value)}
                    className="w-10 h-10 rounded-md cursor-pointer border border-gray-200 p-0.5 bg-white flex-shrink-0"
                  />
                  <input
                    type="text"
                    value={data.brandColor}
                    onChange={e => {
                      if (/^#[0-9a-fA-F]{0,6}$/.test(e.target.value)) set('brandColor', e.target.value)
                    }}
                    className="flex-1 text-xs border border-gray-200 rounded-md px-2 py-1.5 font-mono focus:outline-none focus:border-blue-400"
                    placeholder="#1a73e8"
                    maxLength={7}
                  />
                </div>
              </div>

              {/* Invoice # */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Invoice #</label>
                <div className="flex gap-1.5">
                  <input
                    value={data.invoiceNumber}
                    onChange={e => set('invoiceNumber', e.target.value)}
                    className="flex-1 text-sm border border-gray-200 rounded-md px-2.5 py-2 focus:outline-none focus:border-blue-400"
                    placeholder="1"
                  />
                  <button
                    onClick={() => set('invoiceNumber', String(Math.floor(Math.random() * 9000) + 1000))}
                    title="Auto-generate"
                    className="px-2 text-gray-300 hover:text-blue-500 border border-gray-200 rounded-md transition hover:border-blue-300"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Quick links */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-2 shadow-sm">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Resources</h3>
              {['Invoice Template','Credit Note Template','Quote Template','Purchase Order'].map(lbl => (
                <a key={lbl} href="#" className="block text-xs text-green-600 hover:text-green-700 hover:underline transition">
                  {lbl}
                </a>
              ))}
            </div>

            {/* Reset */}
            <button
              onClick={() => {
                if (confirm('Reset the form? All data will be lost.')) {
                  setData(defaultData())
                  toast.success('Form reset!')
                }
              }}
              className="text-xs text-gray-400 hover:text-red-500 flex items-center justify-center gap-1.5 transition py-1"
            >
              <RotateCcw className="w-3 h-3" /> Start over
            </button>

          </div>{/* end sidebar */}
        </div>
      </div>

      {/* ── PRINTABLE INVOICE (hidden, for PDF) ── */}
      <div className="hidden" aria-hidden>
        <div ref={printRef}>
          <PrintableInvoice data={data} />
        </div>
      </div>

    </div>
  )
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   PRINTABLE INVOICE — clean A4 layout for PDF/Print
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function formatDate(d: string) {
  try { return new Date(d + 'T12:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) }
  catch { return d }
}

const PrintableInvoice = React.forwardRef<HTMLDivElement, { data: InvoiceData }>(
  function PrintableInvoice({ data }, ref) {
    const sym = getCurrencySymbol(data.currency)
    const balanceDue = Math.max(0, data.total - data.amountPaid)
    const c = data.brandColor

    return (
      <div
        ref={ref}
        style={{ fontFamily: 'Inter, Arial, sans-serif', background: '#fff', color: '#111', minHeight: '297mm', padding: '40px 48px', boxSizing: 'border-box', fontSize: 13 }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
          <div>
            {data.senderLogo
              ? <img src={data.senderLogo} alt="Logo" style={{ height: 56, objectFit: 'contain', marginBottom: 12 }} />
              : data.senderInfo && (
                <div style={{ width: 48, height: 48, borderRadius: 10, background: c, color: '#fff', fontWeight: 800, fontSize: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                  {data.senderInfo[0]?.toUpperCase()}
                </div>
              )
            }
            <div style={{ color: '#555', whiteSpace: 'pre-line', lineHeight: 1.6 }}>{data.senderInfo}</div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 36, fontWeight: 900, letterSpacing: 6, color: c, textTransform: 'uppercase' }}>INVOICE</div>
            <div style={{ color: '#888', marginTop: 4 }}>#{data.invoiceNumber}</div>
            <div style={{ marginTop: 12, lineHeight: 2 }}>
              {([
                data.invoiceDate  ? ['Date', formatDate(data.invoiceDate)] : null,
                data.paymentTerms ? ['Payment Terms', data.paymentTerms]   : null,
                data.dueDate      ? ['Due Date', formatDate(data.dueDate)]  : null,
                data.poNumber     ? ['PO Number', data.poNumber]            : null,
              ].filter((x): x is string[] => x !== null)).map(([label, val]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                  <span style={{ color: '#888' }}>{label}:</span>
                  <span style={{ fontWeight: 600, minWidth: 100, textAlign: 'right' }}>{val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bill To */}
        {data.clientName && (
          <div style={{ marginBottom: 28, background: '#f8f9fa', borderRadius: 8, padding: '14px 18px' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 6 }}>BILL TO</div>
            <div style={{ whiteSpace: 'pre-line', color: '#333', lineHeight: 1.6 }}>{data.clientName}</div>
          </div>
        )}

        {/* Ship To */}
        {data.clientAddress && (
          <div style={{ marginBottom: 28, background: '#f8f9fa', borderRadius: 8, padding: '14px 18px' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 6 }}>SHIP TO</div>
            <div style={{ whiteSpace: 'pre-line', color: '#333', lineHeight: 1.6 }}>{data.clientAddress}</div>
          </div>
        )}

        {/* Items table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 24 }}>
          <thead>
            <tr style={{ background: '#1a1a2e', color: '#fff' }}>
              {['Item', 'Qty', 'Rate', 'Amount'].map((h, i) => (
                <th key={h} style={{
                  padding: '10px 12px',
                  textAlign: i === 0 ? 'left' : 'right',
                  fontWeight: 700,
                  fontSize: 11,
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                  whiteSpace: 'nowrap',
                  width: i === 0 ? '50%' : undefined,
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.items.map((item, i) => (
              <tr key={item.id} style={{ borderBottom: '1px solid #f1f1f1', background: i % 2 === 1 ? '#fafafa' : '#fff' }}>
                <td style={{ padding: '10px 12px' }}>
                  <div style={{ fontWeight: 600 }}>{item.name || '—'}</div>
                  {item.description && <div style={{ color: '#888', fontSize: 11, marginTop: 2 }}>{item.description}</div>}
                </td>
                <td style={{ padding: '10px 12px', textAlign: 'right', color: '#444' }}>{item.quantity}</td>
                <td style={{ padding: '10px 12px', textAlign: 'right', color: '#444' }}>{sym}{item.unitPrice.toFixed(2)}</td>
                <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 600 }}>{sym}{item.total.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals + Notes */}
        <div style={{ display: 'flex', gap: 32, justifyContent: 'space-between' }}>
          <div style={{ flex: 1 }}>
            {data.notes && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#b45309', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Notes</div>
                <div style={{ color: '#555', fontSize: 12, whiteSpace: 'pre-line' }}>{data.notes}</div>
              </div>
            )}
            {data.terms && (
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#b45309', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Terms</div>
                <div style={{ color: '#555', fontSize: 12, whiteSpace: 'pre-line' }}>{data.terms}</div>
              </div>
            )}
          </div>

          <div style={{ minWidth: 240 }}>
            {([
              { label: 'Subtotal', val: `${sym}${data.subtotal.toFixed(2)}` },
              data.taxRate  > 0 ? { label: `Tax (${data.taxRate}%)`, val: `${sym}${data.taxAmount.toFixed(2)}` } : null,
              data.discount > 0 ? { label: 'Discount',               val: `-${sym}${data.discount.toFixed(2)}` } : null,
              data.shipping > 0 ? { label: 'Shipping',               val: `${sym}${data.shipping.toFixed(2)}` }  : null,
            ].filter((x): x is { label: string; val: string } => x !== null)).map(({ label, val }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', color: '#555', fontSize: 13, borderBottom: '1px solid #f1f1f1' }}>
                <span>{label}</span><span>{val}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', fontWeight: 700, fontSize: 15, borderTop: '2px solid #e5e7eb' }}>
              <span>Total</span><span style={{ color: c }}>{sym}{data.total.toFixed(2)}</span>
            </div>
            {data.amountPaid > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', color: '#555', fontSize: 13 }}>
                <span>Amount Paid</span><span>{sym}{data.amountPaid.toFixed(2)}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', fontWeight: 900, fontSize: 16, borderTop: '3px solid #111', marginTop: 4 }}>
              <span>Balance Due</span><span>{sym}{balanceDue.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        {data.footerNote && (
          <div style={{ marginTop: 48, paddingTop: 16, borderTop: '1px solid #e5e7eb', textAlign: 'center', color: '#999', fontSize: 12 }}>
            {data.footerNote}
          </div>
        )}
      </div>
    )
  }
)
