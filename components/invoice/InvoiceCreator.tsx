'use client'

import { useState, useCallback, useRef } from 'react'
import React from 'react'
import { useReactToPrint } from 'react-to-print'
import toast from 'react-hot-toast'
import {
  Plus, Trash2, Download, Printer, RotateCcw, FileText,
  ChevronDown, X, Upload, RefreshCw, Settings2, Loader2, Heart
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

const defaultItem = (isInitial = false): InvoiceItem => ({
  id: isInitial ? '1' : Math.random().toString(36).substring(2, 9),
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
  invoiceDate: '',
  paymentTerms: '',
  dueDate: '',
  poNumber: '',
  items: [defaultItem(true)],
  discount: 0,
  taxRate: 0,
  shipping: 0,
  amountPaid: 0,
  notes: '',
  terms: '',
  footerNote: '',
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
  'w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-[15px] text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm'

function cls(...parts: (string | undefined | false)[]) {
  return parts.filter(Boolean).join(' ')
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   MAIN COMPONENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
export default function InvoiceCreator() {
  const [data, setData] = useState<InvoiceData>(defaultData())
  const [showSettings, setShowSettings] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [mounted, setMounted] = useState(false)

  React.useEffect(() => {
    setMounted(true)
    setData(prev => {
      let needsUpdate = false;
      const updates = { ...prev };
      if (!prev.invoiceDate) {
        updates.invoiceDate = new Date().toISOString().split('T')[0];
        needsUpdate = true;
      }
      if (!prev.dueDate) {
        updates.dueDate = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];
        needsUpdate = true;
      }
      return needsUpdate ? updates : prev;
    });
  }, [])
  
  // Modals & History State
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [showGuideModal, setShowGuideModal] = useState(false)
  const [showHelpModal, setShowHelpModal] = useState(false)
  const [showPrivacyModal, setShowPrivacyModal] = useState(false)
  const [showTermsModal, setShowTermsModal] = useState(false)
  const [showAboutModal, setShowAboutModal] = useState(false)
  const [historyItems, setHistoryItems] = useState<InvoiceData[]>([])

  const printRef = useRef<HTMLDivElement>(null)
  const printContainerRef = useRef<HTMLDivElement>(null)
  const logoInputRef = useRef<HTMLInputElement>(null)

  const saveToHistory = (invoiceData: InvoiceData) => {
    try {
      const historyStr = localStorage.getItem('invoice-gen-history')
      let history: InvoiceData[] = historyStr ? JSON.parse(historyStr) : []
      history = history.filter(i => i.invoiceNumber !== invoiceData.invoiceNumber)
      history.unshift({ ...invoiceData })
      history = history.slice(0, 15)
      localStorage.setItem('invoice-gen-history', JSON.stringify(history))
    } catch {}
  }

  const loadHistory = () => {
    try {
      const historyStr = localStorage.getItem('invoice-gen-history')
      if (historyStr) setHistoryItems(JSON.parse(historyStr))
    } catch {}
    setShowHistoryModal(true)
  }

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
    onBeforeGetContent: () => {
      saveToHistory(data)
      return new Promise<void>(resolve => setTimeout(resolve, 300))
    },
  })

  const sym = getCurrencySymbol(data.currency)
  const balanceDue = Math.max(0, data.total - data.amountPaid)

  const downloadPDF = async () => {
    if (isGenerating) return
    if (!printRef.current || !printContainerRef.current) {
      toast.error('PDF renderer not ready. Please try again in a moment.')
      return
    }
    saveToHistory(data)
    setIsGenerating(true)
    const toastId = toast.loading('Generating PDF…')
    const container = printContainerRef.current
    // Snapshot the element reference before going async
    const printEl = printRef.current
    try {
      const jsPDFModule = await import('jspdf')
      const jsPDF = jsPDFModule.default || (jsPDFModule as any).jsPDF
      const html2canvasModule = await import('html2canvas')
      const html2canvas = html2canvasModule.default || html2canvasModule

      // Reveal the container so html2canvas can render it.
      // Use position:fixed with visibility:hidden instead of display:none
      // so the browser still lays out the element (required for html2canvas)
      // while keeping it invisible to the user.
      container.style.position = 'fixed'
      container.style.top = '-9999px'
      container.style.left = '-9999px'
      container.style.width = '794px'
      container.style.height = 'auto'
      container.style.display = 'block'
      container.style.overflow = 'visible'
      container.style.pointerEvents = 'none'

      // Wait for fonts/images to settle and browser to paint
      await new Promise(r => setTimeout(r, 500))

      const canvas = await html2canvas(printEl, {
        scale: 2, // Scale 2 is much safer for mobile devices/iOS Safari memory limits
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        width: 794,
        windowWidth: 794,
      })

      // Hide again
      container.style.display = 'none'
      container.style.position = ''
      container.style.top = ''
      container.style.left = ''
      container.style.width = ''
      container.style.height = ''
      container.style.overflow = ''
      container.style.pointerEvents = ''

      // Use PNG for lossless crisp text
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

      const pdfW = pdf.internal.pageSize.getWidth()
      const pdfH = pdf.internal.pageSize.getHeight()
      const imgW = canvas.width
      const imgH = canvas.height
      const scaledH = (imgH * pdfW) / imgW

      if (scaledH <= pdfH + 2) {
        pdf.addImage(imgData, 'PNG', 0, 0, pdfW, Math.min(scaledH, pdfH), undefined, 'FAST')
      } else {
        const pxPerPage = Math.floor((pdfH / scaledH) * imgH)
        let yPx = 0
        let page = 0
        while (yPx < imgH) {
          const sliceH = Math.min(pxPerPage, imgH - yPx)
          if (sliceH < 10 && page > 0) break
          const pageCanvas = document.createElement('canvas')
          pageCanvas.width = imgW
          pageCanvas.height = sliceH
          pageCanvas.getContext('2d')!.drawImage(canvas, 0, yPx, imgW, sliceH, 0, 0, imgW, sliceH)
          const sliceMmH = (sliceH * pdfW) / imgW
          if (page > 0) pdf.addPage()
          pdf.addImage(pageCanvas.toDataURL('image/png'), 'PNG', 0, 0, pdfW, sliceMmH, undefined, 'FAST')
          yPx += sliceH
          page++
        }
      }

      const fileName = `Invoice-${data.invoiceNumber}.pdf`
      const pdfBlob = pdf.output('blob')
      const blobUrl = URL.createObjectURL(pdfBlob)
      const link = document.createElement('a')
      link.href = blobUrl
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      setTimeout(() => URL.revokeObjectURL(blobUrl), 2000)

      toast.success('PDF downloaded!', { id: toastId })
    } catch (err) {
      console.error('PDF generation error:', err)
      // Ensure container is always hidden on error
      container.style.display = 'none'
      container.style.position = ''
      container.style.visibility = ''
      toast.error('Failed to generate PDF. Check the browser console for details.', { id: toastId })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f0f2f5] font-sans relative z-0">

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
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-500">
            <button onClick={() => setShowHelpModal(true)} className="hover:text-gray-800 transition">Help</button>
            <button onClick={loadHistory} className="hover:text-gray-800 transition">History</button>
            <button onClick={() => setShowGuideModal(true)} className="hover:text-gray-800 transition">Invoicing Guide</button>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Settings — icon only on mobile */}
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="flex items-center gap-1.5 text-[13px] font-medium text-gray-700 bg-white border border-gray-200 rounded-lg px-2 sm:px-3 hover:bg-gray-50 hover:text-gray-900 transition shadow-sm h-9 min-w-[36px] justify-center"
              title="Settings"
            >
              <Settings2 className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">Settings</span>
            </button>

            {/* Download — hidden on mobile (bottom bar handles it) */}
            <button
              onClick={downloadPDF}
              disabled={isGenerating}
              className="hidden sm:flex items-center gap-1.5 px-4 text-[13px] font-semibold text-white bg-green-500 hover:bg-green-600 disabled:opacity-60 rounded-lg transition shadow-sm h-9"
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


      {/* ── MAIN: INVOICE CARD + SIDEBAR ── */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 pb-28 lg:pb-6 print:hidden">
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 items-start">

          {/* ═══════════════════════ INVOICE BUILDER ═══════════════════════ */}
          <div className="w-full lg:flex-1 space-y-6">

            {/* ── CARD: Branding & Header ── */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 sm:p-6">
              <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Branding & Invoice Details</h3>
              <div className="flex flex-col sm:flex-row items-start justify-between gap-6 mb-6">

                {/* Logo */}
                <div>
                  {data.senderLogo ? (
                    <div className="relative group inline-block">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
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
              <div className="mb-2">
                <label className="flex items-center gap-1.5 text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Sender Details</label>
                <textarea
                  value={data.senderInfo}
                  onChange={e => set('senderInfo', e.target.value)}
                  placeholder="e.g., Your Name, Your Company, Address..."
                  rows={3}
                  className={cls(inputBase, 'resize-none')}
                />
              </div>
            </div>

            {/* ── CARD: Client & Dates ── */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Left */}
                <div className="space-y-4">
                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Client Details</label>
                    <input
                      value={data.clientName}
                      onChange={e => set('clientName', e.target.value)}
                      placeholder="e.g. Client Name"
                      className={cls(inputBase, 'mb-2 font-semibold')}
                    />
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <input
                        value={data.clientPhone || ''}
                        onChange={e => set('clientPhone', e.target.value)}
                        placeholder="Phone Number"
                        className={cls(inputBase)}
                      />
                      <input
                        value={data.clientEmail || ''}
                        onChange={e => set('clientEmail', e.target.value)}
                        placeholder="Email Address"
                        className={cls(inputBase)}
                      />
                    </div>
                    <textarea
                      value={data.clientAddress}
                      onChange={e => set('clientAddress', e.target.value)}
                      placeholder="e.g. 123 Anywhere St., Any City"
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
                      <label className="flex items-center gap-1.5 text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">{label}</label>
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

            {/* ── CARD: LINE ITEMS ── */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">

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
                          placeholder="e.g., Web Design, Consulting..."
                          className={inputBase}
                        />
                        <input
                          value={item.description}
                          onChange={e => updateItem(item.id, { description: e.target.value })}
                          placeholder="e.g., Includes 5 custom pages..."
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
                          placeholder="e.g., Web Design, Consulting..."
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
                          placeholder="e.g., Includes 5 custom pages..."
                          className={cls(inputBase, 'text-xs bg-white')}
                        />
                      </div>

                      {/* Qty / Rate / Amount row */}
                      <div className="grid grid-cols-3 gap-0 px-3 pb-3 pt-2">
                        <div className="pr-2">
                          <label className="flex items-center gap-1.5 text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Qty</label>
                          <input
                            type="number" min="1" step="1"
                            value={item.quantity}
                            onChange={e => updateItem(item.id, { quantity: parseInt(e.target.value) || 1 })}
                            className={cls(inputBase, 'text-center bg-white')}
                          />
                        </div>
                        <div className="px-1">
                          <label className="flex items-center gap-1.5 text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Rate</label>
                          <input
                            type="number" min="0" step="0.01"
                            value={item.unitPrice}
                            onChange={e => updateItem(item.id, { unitPrice: parseFloat(e.target.value) || 0 })}
                            className={cls(inputBase, 'text-right bg-white')}
                          />
                        </div>
                        <div className="pl-2 flex flex-col justify-end">
                          <label className="flex items-center gap-1.5 text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Amount</label>
                          <div
                            className="h-[50px] flex items-center justify-end px-3 rounded-xl text-sm font-bold border"
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
                  className="flex items-center gap-2 text-sm font-bold text-blue-600 bg-blue-50/50 hover:bg-blue-50 border border-blue-200/60 rounded-xl px-5 py-3 shadow-sm hover:shadow transition-all duration-300 w-full justify-center"
                >
                  <Plus className="w-4 h-4" /> Add Line Item
                </button>
              </div>
              </div>
            </div>

            {/* ── CARD: NOTES + TOTALS ── */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
              <div className="p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">

                <div className="space-y-5">
                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Notes (Optional)</label>
                    <textarea
                      value={data.notes}
                      onChange={e => set('notes', e.target.value)}
                      rows={3}
                      placeholder="e.g., Please make checks payable to Your Company..."
                      className={cls(inputBase, 'resize-none')}
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Terms (Optional)</label>
                    <textarea
                      value={data.terms}
                      onChange={e => set('terms', e.target.value)}
                      rows={3}
                      placeholder="e.g., Payment due within 30 days. Late fees apply."
                      className={cls(inputBase, 'resize-none')}
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Footer Note (Optional)</label>
                    <textarea
                      value={data.footerNote}
                      onChange={e => set('footerNote', e.target.value)}
                      rows={2}
                      placeholder="e.g., Thank you for your business!"
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
                className="w-full flex items-center justify-center gap-2 py-3.5 text-sm font-bold text-white rounded-2xl transition hover:-translate-y-0.5 shadow-[0_8px_16px_-6px_rgba(0,0,0,0.3)] hover:shadow-[0_12px_20px_-8px_rgba(0,0,0,0.4)] active:translate-y-0 disabled:opacity-60"
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
                <div className="relative group">
                  <select
                    value={data.currency}
                    onChange={e => set('currency', e.target.value)}
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 pr-8 bg-white text-gray-700 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 appearance-none cursor-pointer hover:border-gray-300 transition shadow-sm"
                  >
                    {CURRENCIES.map(c => (
                      <option key={c.code} value={c.code}>{c.code} – {c.symbol}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none group-hover:text-gray-500 transition" />
                </div>
              </div>

              {/* Brand Color */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Brand Color</label>
                <div className="flex bg-white border border-gray-200 rounded-lg overflow-hidden focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition shadow-sm hover:border-gray-300">
                  <div className="relative w-10 shrink-0 border-r border-gray-200 bg-gray-50 cursor-pointer overflow-hidden group">
                    <input
                      type="color"
                      value={data.brandColor}
                      onChange={e => set('brandColor', e.target.value)}
                      className="absolute inset-0 w-[200%] h-[200%] -translate-x-1/4 -translate-y-1/4 cursor-pointer opacity-0 z-10"
                    />
                    <div className="absolute inset-0 m-1.5 rounded shadow-sm border border-black/10 group-hover:scale-105 transition-transform" style={{ background: data.brandColor }}></div>
                  </div>
                  <input
                    type="text"
                    value={data.brandColor}
                    onChange={e => { if (/^#[0-9a-fA-F]{0,6}$/.test(e.target.value)) set('brandColor', e.target.value) }}
                    className="flex-1 text-sm uppercase px-3 py-2 border-none font-mono focus:outline-none focus:ring-0 bg-transparent text-gray-700"
                    maxLength={7}
                  />
                </div>
              </div>

              {/* Invoice # */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Invoice #</label>
                <div className="flex bg-white border border-gray-200 rounded-lg overflow-hidden focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition shadow-sm hover:border-gray-300">
                  <input
                    value={data.invoiceNumber}
                    onChange={e => set('invoiceNumber', e.target.value)}
                    className="flex-1 text-sm px-3 py-2 border-none focus:outline-none focus:ring-0 bg-transparent text-gray-700"
                  />
                  <button
                    onClick={() => set('invoiceNumber', String(Math.floor(Math.random() * 9000) + 1000))}
                    className="px-3 text-gray-400 hover:text-blue-500 bg-gray-50 border-l border-gray-200 transition"
                    title="Generate random invoice number"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Resources */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Resources</h3>
              <div className="space-y-1.5 flex flex-col items-start">
                <button onClick={() => setShowGuideModal(true)} className="flex items-center gap-1.5 text-xs text-green-600 hover:text-green-700 hover:underline transition">
                  <span className="w-1 h-1 rounded-full bg-green-400 shrink-0" />
                  Invoicing Guide
                </button>
                <button onClick={() => setShowHelpModal(true)} className="flex items-center gap-1.5 text-xs text-green-600 hover:text-green-700 hover:underline transition">
                  <span className="w-1 h-1 rounded-full bg-green-400 shrink-0" />
                  Help & FAQ
                </button>
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

      {/* ── FOOTER ── */}
      <footer className="bg-white border-t border-gray-200 mt-8 print:hidden pb-28 lg:pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          {/* TRUST STATEMENT */}
          <div className="mb-12 bg-green-50 border border-green-100 rounded-xl p-4 sm:p-6 text-center max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-3 shadow-sm">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center shrink-0">
              <Settings2 className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 text-sm sm:text-base">No data is stored on our servers.</h4>
              <p className="text-sm text-gray-600 mt-0.5">All information remains secure in your browser.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-md bg-green-500 flex items-center justify-center">
                  <FileText className="w-3 h-3 text-white" />
                </div>
                <span className="font-bold text-gray-800 text-lg">invoice-gen.net</span>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed max-w-sm mb-4">
                The ultimately simple and free invoice generator for freelancers and small businesses. Create, customize, and download professional PDF invoices in seconds. No sign-up required.
              </p>
            </div>
            
            <div>
              <h4 className="font-bold text-gray-900 mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><button onClick={() => setShowGuideModal(true)} className="hover:text-green-600 transition text-left">Invoicing Guide</button></li>
                <li><button onClick={() => setShowHelpModal(true)} className="hover:text-green-600 transition text-left">Help & FAQ</button></li>
                <li><a href="#" className="hover:text-green-600 transition">Invoice Templates</a></li>
                <li><a href="#" className="hover:text-green-600 transition">Receipt Generator</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-gray-900 mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><a href="mailto:support@invoice-gen.net" className="hover:text-green-600 transition">Contact Us</a></li>
                <li><button onClick={() => setShowPrivacyModal(true)} className="hover:text-green-600 transition text-left">Privacy Policy</button></li>
                <li><button onClick={() => setShowTermsModal(true)} className="hover:text-green-600 transition text-left">Terms of Service</button></li>
                <li><button onClick={() => setShowAboutModal(true)} className="hover:text-green-600 transition text-left">About Us</button></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
            <p>&copy; {new Date().getFullYear()} Invoice-Gen.net — A Product of Ever Legit LLC. All Rights Reserved.</p>
            <p className="flex items-center gap-1.5 flex-wrap">Developed with <Heart className="w-3.5 h-3.5 text-red-500 fill-current shrink-0" /> by <a href="https://www.instagram.com/arshaonone" target="_blank" rel="noopener noreferrer" className="font-semibold text-gray-500 hover:text-green-600 transition">Ashikur Rahman Shaon</a></p>
          </div>
        </div>
      </footer>

      {/* ── MODALS ── */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm print:hidden">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[80vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
              <h3 className="font-bold text-lg text-gray-900">Recent Invoices</h3>
              <button onClick={() => setShowHistoryModal(false)} className="p-1 hover:bg-gray-100 rounded-full text-gray-500 transition"><X className="w-5 h-5"/></button>
            </div>
            <div className="p-4 overflow-y-auto flex-1 bg-gray-50">
              {historyItems.length === 0 ? (
                <div className="text-center py-8 text-gray-500 text-sm">No recent invoices found in your browser.</div>
              ) : (
                <div className="space-y-2">
                  {historyItems.map((inv, i) => (
                    <button 
                      key={i} 
                      onClick={() => { setData(inv); setShowHistoryModal(false); toast.success(`Loaded Invoice #${inv.invoiceNumber}`) }}
                      className="w-full text-left bg-white p-4 rounded-xl border border-gray-200 hover:border-green-400 hover:shadow-sm transition flex justify-between items-center group"
                    >
                      <div>
                        <div className="font-bold text-sm text-gray-900 group-hover:text-green-600 transition flex items-center gap-2">
                          <FileText className="w-3.5 h-3.5 text-gray-400 group-hover:text-green-500" />
                          Invoice #{inv.invoiceNumber}
                        </div>
                        <div className="text-xs text-gray-500 mt-1 pl-5.5">{inv.clientName || 'Unnamed Client'} • <span className="font-medium text-gray-700">{getCurrencySymbol(inv.currency)}{inv.total.toFixed(2)}</span></div>
                      </div>
                      <div className="text-xs font-medium text-gray-400">{inv.invoiceDate}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="px-5 py-3 border-t border-gray-100 bg-white shrink-0">
              <p className="text-[11px] text-gray-400 text-center leading-relaxed">Your invoice history is saved temporarily and securely inside your local browser storage. It is never uploaded to any servers.</p>
            </div>
          </div>
        </div>
      )}

      {showGuideModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm print:hidden">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-lg text-gray-900">How to Generate an Invoice</h3>
              <button onClick={() => setShowGuideModal(false)} className="p-1 hover:bg-gray-100 rounded-full text-gray-500 transition"><X className="w-5 h-5"/></button>
            </div>
            <div className="p-6 space-y-5">
              <div className="flex gap-4 items-start">
                <div className="w-7 h-7 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 shadow-sm border border-green-200">1</div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900">Add Your Details & Logo</h4>
                  <p className="text-sm text-gray-500 mt-1 leading-relaxed">Upload your business logo and enter your company information in the &quot;From&quot; section. These add a professional touch to your invoice.</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="w-7 h-7 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 shadow-sm border border-green-200">2</div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900">Client Information</h4>
                  <p className="text-sm text-gray-500 mt-1 leading-relaxed">Fill out the &quot;Bill To&quot; section with your client&apos;s details. Don&apos;t forget to set the invoice date and due date.</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="w-7 h-7 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 shadow-sm border border-green-200">3</div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900">List Your Services & Items</h4>
                  <p className="text-sm text-gray-500 mt-1 leading-relaxed">Add line items for the services provided. Include quantity, price, and descriptions. Taxes and discounts will be calculated automatically.</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="w-7 h-7 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 shadow-sm border border-green-200">4</div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900">Download or Print PDF</h4>
                  <p className="text-sm text-gray-500 mt-1 leading-relaxed">Review everything, tweak the brand color in the Settings, and hit &quot;Download PDF&quot; (or Print) to generate your high-quality document instantly!</p>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end">
              <button onClick={() => setShowGuideModal(false)} className="px-5 py-2 mt-1 bg-green-500 hover:bg-green-600 text-white text-sm font-bold rounded-lg transition shadow-sm active:scale-95">Got it, let&apos;s start!</button>
            </div>
          </div>
        </div>
      )}

      {showHelpModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm print:hidden">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-lg text-gray-900">Help & FAQ</h3>
              <button onClick={() => setShowHelpModal(false)} className="p-1 hover:bg-gray-100 rounded-full text-gray-500 transition"><X className="w-5 h-5"/></button>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <h4 className="text-sm font-bold text-gray-900">Is this service free?</h4>
                <p className="text-sm text-gray-500 mt-1 leading-relaxed">Yes, generating invoices is 100% free with no hidden costs.</p>
              </div>
              <div className="pt-1">
                <h4 className="text-sm font-bold text-gray-900">Do I need to sign up?</h4>
                <p className="text-sm text-gray-500 mt-1 leading-relaxed">No login or subscription is required to use this tool.</p>
              </div>
              <div className="pt-1">
                <h4 className="text-sm font-bold text-gray-900">Is my data secure?</h4>
                <p className="text-sm text-gray-500 mt-1 leading-relaxed">Yes! All information remains locally on your browser. Your invoice data is never uploaded or saved on our servers.</p>
              </div>
              <div className="pt-1">
                <h4 className="text-sm font-bold text-gray-900">How do I download my invoice?</h4>
                <p className="text-sm text-gray-500 mt-1 leading-relaxed">Simply click the &quot;Download PDF&quot; button at the top or bottom of the screen once you finish editing.</p>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end">
              <button onClick={() => setShowHelpModal(false)} className="px-5 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-bold rounded-lg transition active:scale-95">Got it</button>
            </div>
          </div>
        </div>
      )}

      {showPrivacyModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm print:hidden">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-lg text-gray-900">Privacy Policy</h3>
              <button onClick={() => setShowPrivacyModal(false)} className="p-1 hover:bg-gray-100 rounded-full text-gray-500 transition"><X className="w-5 h-5"/></button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-600 leading-relaxed text-justify">
                We respect your privacy. <strong>Invoice-Gen does not store any personal or invoice data on servers.</strong> All information is processed locally in your browser, ensuring complete security and control over your data.
              </p>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end">
              <button onClick={() => setShowPrivacyModal(false)} className="px-5 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-bold rounded-lg transition active:scale-95">Close</button>
            </div>
          </div>
        </div>
      )}

      {showTermsModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm print:hidden">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-lg text-gray-900">Terms of Service</h3>
              <button onClick={() => setShowTermsModal(false)} className="p-1 hover:bg-gray-100 rounded-full text-gray-500 transition"><X className="w-5 h-5"/></button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-600 leading-relaxed text-justify">
                Invoice-Gen is a free tool for generating invoices. Users are responsible for the accuracy of the information they enter. We do not guarantee legal compliance across all countries or jurisdictions.
              </p>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end">
              <button onClick={() => setShowTermsModal(false)} className="px-5 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-bold rounded-lg transition active:scale-95">Close</button>
            </div>
          </div>
        </div>
      )}

      {showAboutModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm print:hidden flex-col">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between shrink-0">
              <h3 className="font-bold text-lg text-gray-900">About Ever Legit LLC</h3>
              <button onClick={() => setShowAboutModal(false)} className="p-1 hover:bg-gray-100 rounded-full text-gray-500 transition"><X className="w-5 h-5"/></button>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto">
              <p className="text-sm text-gray-600 leading-relaxed text-justify mb-4">
                <strong>Invoice-Gen</strong> is a completely free online invoice generator designed for freelancers, entrepreneurs, and small businesses to create professional invoices easily and instantly. With a clean and user-friendly interface, you can enter your business and client details, add items, and generate a polished invoice within seconds.
              </p>
              <p className="text-sm text-gray-600 leading-relaxed text-justify mb-4">
                Built for simplicity and speed, Invoice-Gen requires no technical knowledge and works seamlessly across desktop and mobile devices. It is a 100% free tool &mdash; no login required, no payment needed, and no limitations on usage.
              </p>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <h4 className="font-semibold text-gray-900 text-sm mb-3">A Product of Ever Legit LLC</h4>
                <ul className="space-y-2 text-sm text-gray-600 list-disc pl-5">
                  <li>Mission: Make essential tools free and available to everyone.</li>
                  <li>Simplicity and user-friendly design</li>
                  <li>Privacy and data security</li>
                </ul>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end shrink-0">
              <button onClick={() => setShowAboutModal(false)} className="px-5 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-bold rounded-lg transition active:scale-95">Close</button>
            </div>
          </div>
        </div>
      )}

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
  try {
    const date = new Date(d + 'T12:00:00')
    const mm = String(date.getMonth() + 1).padStart(2, '0')
    const dd = String(date.getDate()).padStart(2, '0')
    const yyyy = date.getFullYear()
    return `${mm}/${dd}/${yyyy}`
  } catch { return d }
}

const PrintableInvoice = React.forwardRef<HTMLDivElement, { data: InvoiceData }>(
  function PrintableInvoice({ data }, ref) {
    const sym = getCurrencySymbol(data.currency)

    // Helper to format address or multi-line text nicely
    const renderMultiline = (text: string | undefined) => {
      if (!text) return null
      return text.split('\n').map((line, i) => (
        <div key={i}>{line}</div>
      ))
    }

    // Filter out empty items
    const validItems = data.items.filter(i => i.name || i.quantity || i.unitPrice || i.total)

    return (
      <div ref={ref} style={{ fontFamily: 'Georgia, serif', background: '#fff', color: '#111', minHeight: '1122px', width: '794px', padding: '80px 70px', boxSizing: 'border-box', fontSize: 13, position: 'relative' }}>
        
        {/* Header Block */}
        <div style={{ textAlign: 'right', marginBottom: 60, fontFamily: 'Inter, sans-serif' }}>
          <div style={{ fontSize: 36, fontWeight: 800, color: '#000', letterSpacing: '0.15em', textTransform: 'uppercase' }}>INVOICE</div>
          {data.invoiceNumber && (
            <div style={{ fontSize: 14, fontWeight: 600, color: '#333', marginTop: 8 }}>#{data.invoiceNumber}</div>
          )}
        </div>

        {/* Contact info grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '12px 0', marginBottom: 60, color: '#444', lineHeight: '1.6' }}>
          
          {/* BILLED TO */}
          {(data.clientName || data.clientCompany || data.clientAddress || data.clientPhone || data.clientEmail) && (
            <>
              <div style={{ fontWeight: 700, color: '#000', fontFamily: 'Inter, sans-serif', fontSize: 11, letterSpacing: '0.1em', paddingTop: 2 }}>BILLED TO:</div>
              <div>
                {data.clientName && <div style={{ color: '#111' }}>{data.clientName}</div>}
                {data.clientCompany && <div style={{ color: '#111' }}>{data.clientCompany}</div>}
                {data.clientAddress && renderMultiline(data.clientAddress)}
                {data.clientPhone && <div>{data.clientPhone}</div>}
                {data.clientEmail && <div>{data.clientEmail}</div>}
              </div>
            </>
          )}

          {/* Spacer if both exist */}
          {(data.clientName || data.clientCompany || data.clientAddress) && (data.senderName || data.senderAddress || data.senderInfo) && (
            <div style={{ gridColumn: '1 / -1', height: 12 }}></div>
          )}

          {/* PAY TO */}
          {(data.senderName || data.senderAddress || data.senderPhone || data.senderEmail || data.senderInfo) && (
            <>
              <div style={{ fontWeight: 700, color: '#000', fontFamily: 'Inter, sans-serif', fontSize: 11, letterSpacing: '0.1em', paddingTop: 2 }}>PAY TO:</div>
              <div>
                {data.senderInfo ? (
                  renderMultiline(data.senderInfo)
                ) : (
                  <>
                    {data.senderName && <div style={{ color: '#111' }}>{data.senderName}</div>}
                    {data.senderAddress && renderMultiline(data.senderAddress)}
                    {data.senderPhone && <div>{data.senderPhone}</div>}
                    {data.senderEmail && <div>{data.senderEmail}</div>}
                  </>
                )}
              </div>
            </>
          )}

          {/* Dates & Terms (mapped like Bank details in demo) */}
          {(data.invoiceDate || data.dueDate || data.paymentTerms || data.poNumber) && (
            <>
              <div style={{ gridColumn: '1 / -1', height: 16 }}></div>
              
              {data.invoiceDate && (
                <>
                  <div style={{ color: '#000', fontFamily: 'Inter, sans-serif', fontSize: 11 }}>Date</div>
                  <div>{fmtDate(data.invoiceDate)}</div>
                </>
              )}
              {data.dueDate && (
                <>
                  <div style={{ color: '#000', fontFamily: 'Inter, sans-serif', fontSize: 11 }}>Due Date</div>
                  <div>{fmtDate(data.dueDate)}</div>
                </>
              )}
              {data.paymentTerms && (
                <>
                  <div style={{ color: '#000', fontFamily: 'Inter, sans-serif', fontSize: 11 }}>Terms</div>
                  <div>{data.paymentTerms}</div>
                </>
              )}
              {data.poNumber && (
                <>
                  <div style={{ color: '#000', fontFamily: 'Inter, sans-serif', fontSize: 11 }}>PO Number</div>
                  <div>{data.poNumber}</div>
                </>
              )}
            </>
          )}
        </div>

        {/* Table layout */}
        <div style={{ minHeight: '300px', marginBottom: 40 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontFamily: 'Inter, sans-serif', fontSize: 11 }}>
            <thead>
              <tr style={{ borderTop: '2px solid #000', borderBottom: '2px solid #000' }}>
                <th style={{ padding: '12px 0', fontWeight: 800, color: '#000', width: '50%', letterSpacing: '0.1em' }}>DESCRIPTION</th>
                <th style={{ padding: '12px 0', fontWeight: 800, color: '#000', textAlign: 'center', letterSpacing: '0.1em' }}>RATE</th>
                <th style={{ padding: '12px 0', fontWeight: 800, color: '#000', textAlign: 'center', letterSpacing: '0.1em' }}>HOURS/QTY</th>
                <th style={{ padding: '12px 0', fontWeight: 800, color: '#000', textAlign: 'right', letterSpacing: '0.1em' }}>AMOUNT</th>
              </tr>
            </thead>
            <tbody style={{ fontFamily: 'Georgia, serif', fontSize: 13, color: '#444' }}>
              {validItems.length > 0 && validItems.map((item, idx) => (
                <tr key={item.id} style={{ borderBottom: '1px solid #e5e5e5' }}>
                  <td style={{ padding: '16px 0', color: '#111' }}>
                    {item.name}
                    {item.description && <div style={{ fontSize: 12, marginTop: 4, color: '#666', fontFamily: 'Georgia, serif' }}>{item.description}</div>}
                  </td>
                  <td style={{ padding: '16px 0', textAlign: 'center' }}>{item.unitPrice ? `${sym}${item.unitPrice.toFixed(2)}` : ''}</td>
                  <td style={{ padding: '16px 0', textAlign: 'center' }}>{item.quantity || ''}</td>
                  <td style={{ padding: '16px 0', textAlign: 'right' }}>{item.total ? `${sym}${item.total.toFixed(2)}` : ''}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals Section */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 2 }}>
            <div style={{ width: 300, display: 'flex', flexDirection: 'column', color: '#444', fontFamily: 'Georgia, serif', fontSize: 13 }}>
              
              <div style={{ borderTop: '2px solid #000', paddingTop: 16, paddingBottom: 8, display: 'flex', justifyContent: 'space-between' }}>
                <span>Sub-Total</span>
                <span style={{ color: '#111' }}>{sym}{data.subtotal.toFixed(2)}</span>
              </div>
              
              {data.taxRate > 0 && (
                <div style={{ paddingBottom: 8, display: 'flex', justifyContent: 'space-between' }}>
                  <span>Sales Tax ({data.taxRate}%)</span>
                  <span style={{ color: '#111' }}>{sym}{data.taxAmount.toFixed(2)}</span>
                </div>
              )}
              
              {data.shipping > 0 && (
                <div style={{ paddingBottom: 8, display: 'flex', justifyContent: 'space-between' }}>
                  <span>Shipping</span>
                  <span style={{ color: '#111' }}>{sym}{data.shipping.toFixed(2)}</span>
                </div>
              )}
              
              {data.discount > 0 && (
                <div style={{ paddingBottom: 8, display: 'flex', justifyContent: 'space-between' }}>
                  <span>Discount</span>
                  <span style={{ color: '#111' }}>-{sym}{data.discount.toFixed(2)}</span>
                </div>
              )}
              
              {/* Total Block */}
              <div style={{ borderTop: '1px solid #e5e5e5', borderBottom: '2px solid #000', padding: '16px 0', marginTop: 8, display: 'flex', justifyContent: 'space-between', color: '#000', fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 800, letterSpacing: '0.1em' }}>
                <span style={{ textTransform: 'uppercase' }}>Total</span>
                <span>{sym}{data.total.toFixed(2)}</span>
              </div>
              
              {data.amountPaid > 0 && (
                <div style={{ paddingTop: 16, display: 'flex', justifyContent: 'space-between', color: '#000', fontFamily: 'Inter, sans-serif', fontSize: 11, fontWeight: 700 }}>
                  <span style={{ textTransform: 'uppercase' }}>Balance Due</span>
                  <span>{sym}{Math.max(0, data.total - data.amountPaid).toFixed(2)}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Any extra notes */}
        {(data.notes || data.terms || data.footerNote) && (
          <div style={{ color: '#555', fontSize: 12, lineHeight: '1.6', position: 'absolute', bottom: 60, left: 70, right: 70, fontFamily: 'Georgia, serif' }}>
             {data.notes && <div style={{ marginBottom: 12 }}>{renderMultiline(data.notes)}</div>}
             {data.terms && <div style={{ marginBottom: 12 }}>{renderMultiline(data.terms)}</div>}
             {data.footerNote && <div>{renderMultiline(data.footerNote)}</div>}
          </div>
        )}

      </div>
    )
  }
)

