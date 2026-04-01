'use client'

import { useState, useCallback, useRef } from 'react'
import React from 'react'
import { useReactToPrint } from 'react-to-print'
import toast from 'react-hot-toast'
import {
  Plus, Trash2, Download, Printer, RotateCcw, FileText,
  ChevronDown, X, Upload, RefreshCw, Settings2, Loader2
} from 'lucide-react'
import { getCurrencySymbol, CURRENCIES } from '@/lib/utils'

/* ── Types ──────────────────────────────────────────────── */
export interface InvoiceItem {
  id: string
  name: string
  description: string
  quantity: number
  unitPrice: number
  taxRate: number
  total: number
}

export interface InvoiceData {
  invoiceNumber: string
  brandColor: string
  currency: string
  language: 'en' | 'bn'
  senderInfo: string
  senderLogo: string
  senderName: string
  senderEmail: string
  senderPhone: string
  senderAddress: string
  clientName: string
  clientAddress: string
  clientCompany: string
  clientEmail: string
  clientPhone: string
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
  invoiceNumber: '1',
  brandColor: '#1a73e8',
  currency: 'USD',
  language: 'en',
  senderInfo: '',
  senderLogo: '',
  senderName: '',
  senderEmail: '',
  senderPhone: '',
  senderAddress: '',
  clientName: '',
  clientAddress: '',
  clientCompany: '',
  clientEmail: '',
  clientPhone: '',
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

function calcAll(items: InvoiceItem[], discount: number, taxRate: number, shipping: number) {
  const subtotal = items.reduce((a, i) => a + i.quantity * i.unitPrice, 0)
  const taxAmount = subtotal * (taxRate / 100)
  const total = Math.max(0, subtotal + taxAmount + shipping - discount)
  return { subtotal, taxAmount, total }
}

const inputBase =
  'w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all bg-white'

function cls(...parts: (string | undefined | false)[]) {
  return parts.filter(Boolean).join(' ')
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   MAIN COMPONENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
export default function InvoiceCreator() {
  const [data, setData] = useState<InvoiceData>(defaultData())
  const [showSettings, setShowSettings] = useState(false)
  const [showBanner, setShowBanner] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const printRef = useRef<HTMLDivElement>(null)
  const printContainerRef = useRef<HTMLDivElement>(null)
  const logoInputRef = useRef<HTMLInputElement>(null)

  const set = <K extends keyof InvoiceData>(key: K, val: InvoiceData[K]) =>
    setData(prev => ({ ...prev, [key]: val }))

  const recalc = useCallback(
    (items: InvoiceItem[], discount = data.discount, taxRate = data.taxRate, shipping = data.shipping) => {
      const { subtotal, taxAmount, total } = calcAll(items, discount, taxRate, shipping)
      setData(prev => ({ ...prev, items, discount, taxRate, shipping, subtotal, taxAmount, total }))
    },
    [data.discount, data.taxRate, data.shipping]
  )

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

  const handleLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => set('senderLogo', reader.result as string)
    reader.readAsDataURL(file)
  }

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `Invoice-${data.invoiceNumber}`,
    onBeforeGetContent: () => new Promise<void>(resolve => setTimeout(resolve, 300)),
  })

  const sym = getCurrencySymbol(data.currency)
  const balanceDue = Math.max(0, data.total - data.amountPaid)

  const downloadPDF = async () => {
    if (!printRef.current || !printContainerRef.current || isGenerating) return
    setIsGenerating(true)
    const toastId = toast.loading('Generating PDF…')
    const container = printContainerRef.current
    try {
      const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
        import('jspdf'),
        import('html2canvas'),
      ])

      // Reveal the container off-screen so html2canvas can render it
      container.style.display = 'block'
      container.style.position = 'fixed'
      container.style.left = '-9999px'
      container.style.top = '0'
      container.style.width = '794px'
      container.style.zIndex = '-1'

      // Wait for fonts/images to settle
      await new Promise(r => setTimeout(r, 300))

      const canvas = await html2canvas(printRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff',
        width: 794,
        windowWidth: 794,
      })

      // Hide again
      container.style.display = 'none'
      container.style.position = ''
      container.style.left = ''
      container.style.top = ''
      container.style.width = ''
      container.style.zIndex = ''

      const imgData = canvas.toDataURL('image/jpeg', 0.92)
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

      const pdfW = pdf.internal.pageSize.getWidth()
      const pdfH = pdf.internal.pageSize.getHeight()
      const imgW = canvas.width
      const imgH = canvas.height
      const scaledH = (imgH * pdfW) / imgW // mm height of full content

      if (scaledH <= pdfH) {
        // Fits on one page
        pdf.addImage(imgData, 'JPEG', 0, 0, pdfW, scaledH)
      } else {
        // Multi-page: slice canvas into A4-sized chunks
        const pxPerPage = Math.floor((pdfH / scaledH) * imgH)
        let yPx = 0
        let page = 0
        while (yPx < imgH) {
          const sliceH = Math.min(pxPerPage, imgH - yPx)
          const pageCanvas = document.createElement('canvas')
          pageCanvas.width = imgW
          pageCanvas.height = sliceH
          pageCanvas.getContext('2d')!.drawImage(canvas, 0, yPx, imgW, sliceH, 0, 0, imgW, sliceH)
          const sliceMmH = (sliceH * pdfW) / imgW
          if (page > 0) pdf.addPage()
          pdf.addImage(pageCanvas.toDataURL('image/jpeg', 0.92), 'JPEG', 0, 0, pdfW, sliceMmH)
          yPx += sliceH
          page++
        }
      }

      pdf.save(`Invoice-${data.invoiceNumber}.pdf`)
      toast.success('PDF downloaded!', { id: toastId })
    } catch (err) {
      console.error('PDF generation error:', err)
      // Ensure container is hidden on error
      container.style.display = 'none'
      toast.error('Failed to generate PDF', { id: toastId })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f0f2f5] font-sans">

      {/* ── TOP NAV ── */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 print:hidden shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-3">

          {/* Brand */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-green-500 flex items-center justify-center shadow-sm">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900 text-sm">
              invoice-<span className="text-green-500">gen</span>
              <span className="text-gray-400 font-normal">.net</span>
            </span>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6 text-sm text-gray-500">
            <a href="#" className="hover:text-gray-800 transition">Help</a>
            <a href="#" className="hover:text-gray-800 transition">History</a>
            <a href="#" className="hover:text-gray-800 transition">Invoicing Guide</a>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Settings — icon only on mobile */}
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="flex items-center gap-1.5 text-xs text-gray-600 border border-gray-200 rounded-lg px-2 sm:px-3 py-2 hover:bg-gray-50 transition min-w-[36px] justify-center"
              title="Settings"
            >
              <Settings2 className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">Settings</span>
            </button>

            {/* Download — hidden on mobile (bottom bar handles it) */}
            <button
              onClick={downloadPDF}
              disabled={isGenerating}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-green-500 hover:bg-green-600 disabled:opacity-60 rounded-lg transition shadow-sm"
            >
              {isGenerating
                ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Generating…</>
                : <><Download className="w-3.5 h-3.5" /> Download PDF</>}
            </button>
          </div>
        </div>
      </header>

      {/* ── SETTINGS PANEL ── */}
      {showSettings && (
        <div className="bg-slate-50 border-b border-slate-200 print:hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap gap-4 items-center">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Settings</span>

            <label className="flex items-center gap-2 text-xs text-gray-600">
              <span className="font-medium text-gray-700">Currency</span>
              <div className="relative">
                <select
                  value={data.currency}
                  onChange={e => set('currency', e.target.value)}
                  className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 pr-7 bg-white text-gray-700 focus:outline-none focus:border-blue-400 appearance-none cursor-pointer"
                >
                  {CURRENCIES.map(c => (
                    <option key={c.code} value={c.code}>{c.code} – {c.symbol}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
              </div>
            </label>

            <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
              <span className="font-medium text-gray-700">Brand Color</span>
              <input
                type="color"
                value={data.brandColor}
                onChange={e => set('brandColor', e.target.value)}
                className="w-8 h-8 rounded-lg cursor-pointer border border-gray-200 p-0.5 bg-white"
              />
              <span className="font-mono text-gray-400">{data.brandColor}</span>
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

      {/* ── BANNER ── */}
      {showBanner && (
        <div className="bg-white border-b border-gray-100 print:hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 relative">
            <button
              onClick={() => setShowBanner(false)}
              className="absolute top-4 right-4 text-gray-300 hover:text-gray-500 transition p-1"
            >
              <X className="w-4 h-4" />
            </button>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-0.5">Free Invoice Template</h1>
            <p className="text-green-600 font-semibold text-sm mb-1">Create professional invoices with one click!</p>
            <p className="text-xs sm:text-sm text-gray-500 max-w-xl leading-relaxed">
              Create, customize, and download professional invoices as PDF directly from your browser. Free forever.
            </p>
          </div>
        </div>
      )}

      {/* ── MAIN: INVOICE CARD + SIDEBAR ── */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 pb-28 lg:pb-6 print:hidden">
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 items-start">

          {/* ═══════════════════════ INVOICE CARD ═══════════════════════ */}
          <div className="w-full lg:flex-1 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">

            {/* ── Header: Logo + INVOICE title ── */}
            <div className="p-4 sm:p-8">
              <div className="flex items-start justify-between gap-4 mb-6">

                {/* Logo */}
                <div>
                  {data.senderLogo ? (
                    <div className="relative group inline-block">
                      <img
                        src={data.senderLogo}
                        alt="Logo"
                        className="h-16 w-36 sm:h-20 sm:w-44 object-contain border-2 border-dashed border-gray-200 rounded-xl p-1"
                      />
                      <button
                        onClick={() => set('senderLogo', '')}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-400 hover:bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow"
                      >×</button>
                    </div>
                  ) : (
                    <button
                      onClick={() => logoInputRef.current?.click()}
                      className="h-16 w-36 sm:h-20 sm:w-44 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center gap-1.5 text-gray-400 hover:border-blue-400 hover:text-blue-400 hover:bg-blue-50 transition"
                    >
                      <Upload className="w-5 h-5" />
                      <span className="text-xs font-medium">Add Logo</span>
                    </button>
                  )}
                  <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogo} />
                </div>

                {/* INVOICE title */}
                <div className="flex flex-col items-end gap-2">
                  <h2 className="text-3xl sm:text-4xl font-black tracking-widest uppercase" style={{ color: data.brandColor }}>
                    INVOICE
                  </h2>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-400">#</span>
                    <input
                      value={data.invoiceNumber}
                      onChange={e => set('invoiceNumber', e.target.value)}
                      className="w-24 border border-gray-200 rounded-lg px-2.5 py-2 text-sm text-right font-semibold focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
                      placeholder="1"
                    />
                    <button
                      onClick={() => set('invoiceNumber', String(Math.floor(Math.random() * 9000) + 1000))}
                      title="Auto-generate"
                      className="text-gray-300 hover:text-blue-500 transition p-1"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Sender */}
              <div className="mb-4">
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">From</label>
                <textarea
                  value={data.senderInfo}
                  onChange={e => set('senderInfo', e.target.value)}
                  placeholder="Your name, company, email, phone, address..."
                  rows={3}
                  className={cls(inputBase, 'resize-none')}
                />
              </div>

              {/* Bill To / Ship To + Dates */}
              {/* Stack fully on mobile, 2-col on sm+ */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                {/* Left */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Bill To</label>
                    <textarea
                      value={data.clientName}
                      onChange={e => set('clientName', e.target.value)}
                      placeholder="Client name, company, address..."
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

                {/* Right: date fields — 2-col grid on mobile, stacked label+input on sm */}
                <div className="grid grid-cols-2 sm:grid-cols-1 gap-3">
                  {[
                    { label: 'Date',          key: 'invoiceDate',  type: 'date' },
                    { label: 'Due Date',      key: 'dueDate',      type: 'date' },
                    { label: 'Payment Terms', key: 'paymentTerms', type: 'text', placeholder: 'e.g. Net 30' },
                    { label: 'PO Number',     key: 'poNumber',     type: 'text', placeholder: 'PO-0001' },
                  ].map(({ label, key, type, placeholder }) => (
                    <div key={key}>
                      <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
                      <input
                        type={type}
                        value={(data as any)[key]}
                        onChange={e => set(key as keyof InvoiceData, e.target.value)}
                        placeholder={placeholder ?? label}
                        className={inputBase}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── LINE ITEMS ── */}
            <div className="border-t border-gray-100">

              {/* Desktop table header */}
              <div
                className="hidden sm:grid gap-2 px-8 py-3 text-xs font-bold uppercase tracking-wider text-white"
                style={{ background: '#1a1a2e', gridTemplateColumns: '1fr 80px 100px 100px 44px' }}
              >
                <div>Item</div>
                <div className="text-center">Qty</div>
                <div className="text-center">Rate</div>
                <div className="text-right">Amount</div>
                <div />
              </div>

              {/* Mobile section label */}
              <div className="sm:hidden px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white" style={{ background: '#1a1a2e' }}>
                Line Items
              </div>

              {/* Items */}
              <div className="px-4 sm:px-8 py-4 space-y-3">
                {data.items.map((item) => (
                  <div key={item.id}>

                    {/* ── Desktop row ── */}
                    <div
                      className="hidden sm:grid gap-2 items-start"
                      style={{ gridTemplateColumns: '1fr 80px 100px 100px 44px' }}
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
                          placeholder="Details (optional)"
                          className={cls(inputBase, 'mt-1.5 text-xs')}
                        />
                      </div>
                      <input
                        type="number" min="1" step="1"
                        value={item.quantity}
                        onChange={e => updateItem(item.id, { quantity: parseInt(e.target.value) || 1 })}
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
                      <div className="flex items-center justify-end pt-2.5">
                        <span className="text-sm font-semibold text-gray-800">{sym}{item.total.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-center pt-2">
                        <button
                          onClick={() => removeItem(item.id)}
                          disabled={data.items.length === 1}
                          className="w-8 h-8 flex items-center justify-center text-gray-300 hover:text-red-400 hover:bg-red-50 disabled:opacity-20 transition rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* ── Mobile card ── */}
                    <div className="sm:hidden rounded-xl border border-gray-200 bg-gray-50 overflow-hidden">
                      {/* Card header: description + delete */}
                      <div className="flex items-center gap-2 px-3 pt-3">
                        <input
                          value={item.name}
                          onChange={e => updateItem(item.id, { name: e.target.value })}
                          placeholder="Item description..."
                          className={cls(inputBase, 'flex-1 bg-white')}
                        />
                        <button
                          onClick={() => removeItem(item.id)}
                          disabled={data.items.length === 1}
                          className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 disabled:opacity-20 transition rounded-lg border border-gray-200 bg-white shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Optional details */}
                      <div className="px-3 pt-2">
                        <input
                          value={item.description}
                          onChange={e => updateItem(item.id, { description: e.target.value })}
                          placeholder="Additional details (optional)"
                          className={cls(inputBase, 'text-xs bg-white')}
                        />
                      </div>

                      {/* Qty / Rate / Amount row */}
                      <div className="grid grid-cols-3 gap-0 px-3 pb-3 pt-2">
                        <div className="pr-2">
                          <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Qty</label>
                          <input
                            type="number" min="1" step="1"
                            value={item.quantity}
                            onChange={e => updateItem(item.id, { quantity: parseInt(e.target.value) || 1 })}
                            className={cls(inputBase, 'text-center bg-white')}
                          />
                        </div>
                        <div className="px-1">
                          <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Rate</label>
                          <input
                            type="number" min="0" step="0.01"
                            value={item.unitPrice}
                            onChange={e => updateItem(item.id, { unitPrice: parseFloat(e.target.value) || 0 })}
                            className={cls(inputBase, 'text-right bg-white')}
                          />
                        </div>
                        <div className="pl-2 flex flex-col justify-end">
                          <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Amount</label>
                          <div
                            className="h-10 flex items-center justify-end px-3 rounded-lg text-sm font-bold border"
                            style={{ color: data.brandColor, borderColor: `${data.brandColor}30`, background: `${data.brandColor}08` }}
                          >
                            {sym}{item.total.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>
                ))}
              </div>

              {/* Add line item */}
              <div className="px-4 sm:px-8 pb-5">
                <button
                  onClick={addItem}
                  className="flex items-center gap-2 text-sm font-semibold text-green-600 border-2 border-dashed border-green-300 hover:border-green-400 hover:bg-green-50 rounded-xl px-4 py-2.5 transition w-full sm:w-auto justify-center sm:justify-start"
                >
                  <Plus className="w-4 h-4" /> Add Line Item
                </button>
              </div>
            </div>

            {/* ── NOTES + TOTALS ── */}
            <div className="border-t border-gray-100">
              <div className="p-4 sm:p-8 grid grid-cols-1 sm:grid-cols-2 gap-6">

                {/* Notes + Terms */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Notes</label>
                    <textarea
                      value={data.notes}
                      onChange={e => set('notes', e.target.value)}
                      rows={3}
                      placeholder="Any relevant notes for the client..."
                      className={cls(inputBase, 'resize-none')}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Terms</label>
                    <textarea
                      value={data.terms}
                      onChange={e => set('terms', e.target.value)}
                      rows={3}
                      placeholder="Payment terms, late fees, delivery schedule..."
                      className={cls(inputBase, 'resize-none')}
                    />
                  </div>
                </div>

                {/* Totals */}
                <div className="bg-gray-50 rounded-xl p-4 space-y-1">
                  {/* Subtotal */}
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-sm text-gray-600 font-medium">Subtotal</span>
                    <span className="text-sm font-semibold text-gray-900">{sym}{data.subtotal.toFixed(2)}</span>
                  </div>

                  {/* Tax */}
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-sm text-gray-600 font-medium">Tax</span>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 border border-gray-200 rounded-lg overflow-hidden bg-white">
                        <input
                          type="number" min="0" max="100" step="0.1"
                          value={data.taxRate}
                          onChange={e => {
                            const taxRate = parseFloat(e.target.value) || 0
                            const { subtotal, taxAmount, total } = calcAll(data.items, data.discount, taxRate, data.shipping)
                            setData(prev => ({ ...prev, taxRate, subtotal, taxAmount, total }))
                          }}
                          className="w-14 px-2 py-1.5 text-xs text-right focus:outline-none"
                        />
                        <span className="text-xs text-gray-400 pr-2">%</span>
                      </div>
                      <span className="text-sm font-medium text-gray-700 w-20 text-right">{sym}{data.taxAmount.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Discount */}
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-sm text-gray-600 font-medium">Discount</span>
                    <div className="flex items-center gap-1 border border-gray-200 rounded-lg overflow-hidden bg-white">
                      <span className="text-xs text-gray-400 pl-2">{sym}</span>
                      <input
                        type="number" min="0" step="0.01"
                        value={data.discount}
                        onChange={e => recalc(data.items, parseFloat(e.target.value) || 0)}
                        className="w-16 px-2 py-1.5 text-xs text-right focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Shipping */}
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-sm text-gray-600 font-medium">Shipping</span>
                    <div className="flex items-center gap-1 border border-gray-200 rounded-lg overflow-hidden bg-white">
                      <span className="text-xs text-gray-400 pl-2">{sym}</span>
                      <input
                        type="number" min="0" step="0.01"
                        value={data.shipping}
                        onChange={e => {
                          const shipping = parseFloat(e.target.value) || 0
                          const { subtotal, taxAmount, total } = calcAll(data.items, data.discount, data.taxRate, shipping)
                          setData(prev => ({ ...prev, shipping, subtotal, taxAmount, total }))
                        }}
                        className="w-16 px-2 py-1.5 text-xs text-right focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Total */}
                  <div className="flex justify-between items-center py-3">
                    <span className="font-bold text-gray-900">Total</span>
                    <span className="font-bold text-xl" style={{ color: data.brandColor }}>{sym}{data.total.toFixed(2)}</span>
                  </div>

                  {/* Amount Paid */}
                  <div className="flex justify-between items-center py-2 border-t border-gray-200">
                    <span className="text-sm text-gray-500 font-medium">Amount Paid</span>
                    <div className="flex items-center gap-1 border border-gray-200 rounded-lg overflow-hidden bg-white">
                      <span className="text-xs text-gray-400 pl-2">{sym}</span>
                      <input
                        type="number" min="0" step="0.01"
                        value={data.amountPaid}
                        onChange={e => set('amountPaid', parseFloat(e.target.value) || 0)}
                        className="w-20 px-2 py-1.5 text-xs text-right focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Balance Due */}
                  <div className="flex justify-between items-center pt-3 mt-1 border-t-2 border-gray-900">
                    <span className="font-black text-gray-900">Balance Due</span>
                    <span className="font-black text-xl text-gray-900">{sym}{balanceDue.toFixed(2)}</span>
                  </div>
                </div>

              </div>
            </div>

            {/* Footer */}
            <div className="px-4 sm:px-8 py-4 border-t border-gray-100 bg-gray-50/60">
              <input
                value={data.footerNote}
                onChange={e => set('footerNote', e.target.value)}
                placeholder="Thank you for your business!"
                className="w-full text-sm text-center text-gray-400 border-0 border-b border-dashed border-gray-300 focus:outline-none focus:border-blue-400 bg-transparent py-1"
              />
            </div>

          </div>{/* end invoice card */}

          {/* ═══════════════════════ SIDEBAR ═══════════════════════ */}
          <div className="w-full lg:w-52 shrink-0 flex flex-col gap-3">

            {/* Desktop: Download + Print */}
            <div className="hidden lg:flex flex-col gap-2">
              <button
                onClick={downloadPDF}
                disabled={isGenerating}
                className="w-full flex items-center justify-center gap-2 py-3 text-sm font-bold text-white rounded-xl transition shadow-md hover:opacity-90 active:scale-95 disabled:opacity-60"
                style={{ background: data.brandColor }}
              >
                {isGenerating
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating…</>
                  : <><Download className="w-4 h-4" /> Download</>}
              </button>
              <button
                onClick={handlePrint}
                className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition"
              >
                <Printer className="w-4 h-4" /> Print
              </button>
            </div>

            {/* Settings panel */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-4 shadow-sm">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide">Invoice Settings</h3>

              {/* Currency */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Currency</label>
                <div className="relative">
                  <select
                    value={data.currency}
                    onChange={e => set('currency', e.target.value)}
                    className="w-full text-sm border border-gray-200 rounded-lg px-2.5 py-2 pr-8 bg-white text-gray-700 focus:outline-none focus:border-blue-400 appearance-none cursor-pointer"
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
                    className="w-10 h-10 rounded-lg cursor-pointer border border-gray-200 p-0.5 bg-white shrink-0"
                  />
                  <input
                    type="text"
                    value={data.brandColor}
                    onChange={e => { if (/^#[0-9a-fA-F]{0,6}$/.test(e.target.value)) set('brandColor', e.target.value) }}
                    className="flex-1 text-xs border border-gray-200 rounded-lg px-2 py-1.5 font-mono focus:outline-none focus:border-blue-400"
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
                    className="flex-1 text-sm border border-gray-200 rounded-lg px-2.5 py-2 focus:outline-none focus:border-blue-400"
                  />
                  <button
                    onClick={() => set('invoiceNumber', String(Math.floor(Math.random() * 9000) + 1000))}
                    className="px-2 text-gray-300 hover:text-blue-500 border border-gray-200 rounded-lg transition hover:border-blue-300"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Resources */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Resources</h3>
              <div className="space-y-1.5">
                {['Invoice Template', 'Credit Note Template', 'Quote Template', 'Purchase Order'].map(lbl => (
                  <a key={lbl} href="#" className="flex items-center gap-1.5 text-xs text-green-600 hover:text-green-700 hover:underline transition">
                    <span className="w-1 h-1 rounded-full bg-green-400 shrink-0" />
                    {lbl}
                  </a>
                ))}
              </div>
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

      {/* ── MOBILE STICKY BOTTOM BAR ── */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-t border-gray-200 px-4 py-3 flex gap-3 shadow-[0_-4px_24px_rgba(0,0,0,0.1)] print:hidden">
        <button
          onClick={handlePrint}
          className="flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition active:scale-95"
        >
          <Printer className="w-4 h-4" /> Print
        </button>
        <button
          onClick={downloadPDF}
          disabled={isGenerating}
          className="flex-[2] flex items-center justify-center gap-2 py-3.5 text-sm font-bold text-white rounded-xl transition active:scale-95 shadow-lg disabled:opacity-60"
          style={{ background: data.brandColor }}
        >
          {isGenerating
            ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating…</>
            : <><Download className="w-4 h-4" /> Download PDF</>}
        </button>
      </div>

      {/* ── PRINTABLE INVOICE (hidden off-screen, ref-controlled for PDF capture) ── */}
      <div ref={printContainerRef} style={{ display: 'none' }} aria-hidden>
        <div ref={printRef}>
          <PrintableInvoice data={data} />
        </div>
      </div>

    </div>
  )
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   PRINTABLE INVOICE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function fmtDate(d: string) {
  try { return new Date(d + 'T12:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) }
  catch { return d }
}

const PrintableInvoice = React.forwardRef<HTMLDivElement, { data: InvoiceData }>(
  function PrintableInvoice({ data }, ref) {
    const sym = getCurrencySymbol(data.currency)
    const balanceDue = Math.max(0, data.total - data.amountPaid)
    const c = data.brandColor

    return (
      <div ref={ref} style={{ fontFamily: 'Inter, Arial, sans-serif', background: '#fff', color: '#111', minHeight: '297mm', padding: '40px 48px', boxSizing: 'border-box', fontSize: 13 }}>
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
              {([ data.invoiceDate ? ['Date', fmtDate(data.invoiceDate)] : null,
                  data.paymentTerms ? ['Payment Terms', data.paymentTerms] : null,
                  data.dueDate ? ['Due Date', fmtDate(data.dueDate)] : null,
                  data.poNumber ? ['PO Number', data.poNumber] : null,
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
                <th key={h} style={{ padding: '10px 12px', textAlign: i === 0 ? 'left' : 'right', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, width: i === 0 ? '50%' : undefined }}>
                  {h}
                </th>
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
            {data.notes && <div style={{ marginBottom: 16 }}><div style={{ fontSize: 10, fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Notes</div><div style={{ color: '#555', fontSize: 12, whiteSpace: 'pre-line' }}>{data.notes}</div></div>}
            {data.terms && <div><div style={{ fontSize: 10, fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Terms</div><div style={{ color: '#555', fontSize: 12, whiteSpace: 'pre-line' }}>{data.terms}</div></div>}
          </div>
          <div style={{ minWidth: 240 }}>
            {([
              { label: 'Subtotal', val: `${sym}${data.subtotal.toFixed(2)}` },
              data.taxRate  > 0 ? { label: `Tax (${data.taxRate}%)`, val: `${sym}${data.taxAmount.toFixed(2)}` } : null,
              data.discount > 0 ? { label: 'Discount', val: `-${sym}${data.discount.toFixed(2)}` } : null,
              data.shipping > 0 ? { label: 'Shipping', val: `${sym}${data.shipping.toFixed(2)}` } : null,
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

        {data.footerNote && (
          <div style={{ marginTop: 48, paddingTop: 16, borderTop: '1px solid #e5e7eb', textAlign: 'center', color: '#999', fontSize: 12 }}>
            {data.footerNote}
          </div>
        )}
      </div>
    )
  }
)
