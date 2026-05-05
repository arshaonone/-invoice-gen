'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import React from 'react'
import Link from 'next/link'
import { useReactToPrint } from 'react-to-print'
import toast from 'react-hot-toast'
import {
  Plus, Trash2, Download, Printer, RotateCcw, FileText,
  ChevronDown, X, Upload, RefreshCw, Settings2, Loader2, Heart,
  LogIn, Tag, Building2, User, Eye, EyeOff
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
  'w-full bg-white border border-gray-200 rounded-xl px-3 py-3 sm:px-4 sm:py-3.5 text-[15px] text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300 shadow-sm min-h-[48px]'

// Date-specific input: restores native picker on all browsers/mobile
const dateInputClass =
  'w-full bg-white border border-gray-200 rounded-xl px-3 py-3 sm:px-4 sm:py-3.5 text-[15px] text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300 shadow-sm min-h-[48px] cursor-pointer'

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
  const [showMobilePreview, setShowMobilePreview] = useState(false)

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
  const previewPanelRef = useRef<HTMLDivElement>(null)
  const [previewScale, setPreviewScale] = useState(0.55)

  useEffect(() => {
    const updateScale = () => {
      if (previewPanelRef.current) {
        const w = previewPanelRef.current.clientWidth - 48
        setPreviewScale(Math.min(Math.max(w / 794, 0.35), 0.9))
      }
    }
    updateScale()
    window.addEventListener('resize', updateScale)
    return () => window.removeEventListener('resize', updateScale)
  }, [])

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
    // Required fields validation
    if (!data.senderName && !data.senderInfo) {
      toast.error('Please enter your company / sender name before downloading.')
      return
    }
    const filledItems = data.items.filter(i => i.name && (i.unitPrice > 0 || i.total > 0))
    if (filledItems.length === 0) {
      toast.error('Please add at least one line item with a name and price.')
      return
    }
    saveToHistory(data)
    setIsGenerating(true)
    const toastId = toast.loading('Generating PDF…')
    const printEl = printRef.current
    const containerEl = printContainerRef.current
    try {
      const jsPDFModule = await import('jspdf')
      const jsPDF = jsPDFModule.default || (jsPDFModule as any).jsPDF
      const html2canvasModule = await import('html2canvas')
      const html2canvas = html2canvasModule.default || html2canvasModule

      // ── Temporarily reposition from fixed→absolute so html2canvas
      //    can locate the element via getBoundingClientRect correctly.
      //    position:fixed at -9999px gives a negative bounding rect,
      //    which causes html2canvas to capture a blank region.
      containerEl.style.position = 'absolute'
      containerEl.style.top = '0px'
      containerEl.style.left = '-9999px'

      // Allow the browser to repaint with the new position
      await new Promise(r => setTimeout(r, 400))

      const canvas = await html2canvas(printEl, {
        scale: 2,
        useCORS: true,
        allowTaint: true,   // needed for logo images that may be data-URIs
        logging: false,
        backgroundColor: '#ffffff',
        width: 794,
        windowWidth: 794,
        scrollX: -9999,     // compensate for the left:-9999px offset
        scrollY: 0,
      })

      // Restore off-screen fixed position
      containerEl.style.position = 'fixed'
      containerEl.style.top = '-9999px'
      containerEl.style.left = '-9999px'

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
          if (sliceH < pxPerPage * 0.12 && page > 0) break
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
      toast.error('Failed to generate PDF. Check the browser console for details.', { id: toastId })
    } finally {
      // Always restore off-screen fixed position in case capture errored mid-way
      if (printContainerRef.current) {
        printContainerRef.current.style.position = 'fixed'
        printContainerRef.current.style.top = '-9999px'
        printContainerRef.current.style.left = '-9999px'
      }
      setIsGenerating(false)
    }
  }

  return (
    <div className="min-h-screen font-sans relative z-0 pb-28 lg:pb-0" style={{ background: 'linear-gradient(135deg, #f0f4ff 0%, #f8faff 50%, #f0f7ff 100%)' }}>

      {/* ── TOP NAV ── */}
      <header className="sticky top-0 z-40 print:hidden" style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(99,102,241,0.12)', boxShadow: '0 1px 24px rgba(99,102,241,0.08)' }}>
        <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2">

          {/* Brand */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg shrink-0" style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)' }}>
              <FileText className="w-4.5 h-4.5 text-white" style={{ width: 18, height: 18 }} />
            </div>
            <span className="font-black text-gray-900 text-[15px] tracking-tight">
              invoice-<span style={{ color: '#6366f1' }}>gen</span><span className="text-gray-400 font-normal text-sm">.net</span>
            </span>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
            <button onClick={() => setShowHelpModal(true)} className="px-3 py-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-all">Help</button>
            <button onClick={loadHistory} className="px-3 py-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-all">History</button>
            <button onClick={() => setShowGuideModal(true)} className="px-3 py-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-all">Guide</button>
            <Link href="/pricing" className="flex items-center gap-1.5 px-3 py-2 rounded-lg font-semibold transition-all" style={{ color: '#6366f1' }}>
              <Tag className="w-3.5 h-3.5" />Pricing
            </Link>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            <button onClick={loadHistory} className="md:hidden w-9 h-9 flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded-xl transition" title="History">
              <RefreshCw className="w-4 h-4" />
            </button>
            <Link href="/pricing" className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl hover:bg-indigo-50 transition" style={{ color: '#6366f1' }} title="Pricing">
              <Tag className="w-4 h-4" />
            </Link>
            <button
              className="hidden sm:flex items-center gap-1.5 text-[13px] font-semibold rounded-xl px-3 h-9 border transition-all shadow-sm"
              style={{ color: '#374151', background: 'white', borderColor: '#e5e7eb' }}
              onClick={() => toast('Login coming soon! 🔐', { icon: '🚀' })}
            >
              <LogIn className="w-3.5 h-3.5" /> Log In
            </button>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="flex items-center gap-1.5 text-[13px] font-medium rounded-xl px-2 sm:px-3 h-9 min-w-[36px] justify-center border transition-all shadow-sm"
              style={{ color: '#374151', background: 'white', borderColor: '#e5e7eb' }}
            >
              <Settings2 className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">Settings</span>
            </button>
            <button
              onClick={downloadPDF}
              disabled={isGenerating}
              className="hidden sm:flex items-center gap-2 px-4 text-[13px] font-bold text-white rounded-xl h-9 transition-all shadow-lg disabled:opacity-60 active:scale-95"
              style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)', boxShadow: '0 4px 14px rgba(99,102,241,0.4)' }}
            >
              {isGenerating ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Generating…</> : <><Download className="w-3.5 h-3.5" /> Download PDF</>}
            </button>
          </div>
        </div>
      </header>

      {/* ── SETTINGS PANEL ── */}
      {showSettings && (
        <div className="print:hidden" style={{ background: 'rgba(249,250,255,0.97)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(99,102,241,0.1)' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-wrap gap-x-5 gap-y-3 items-center">
            <span className="text-xs font-bold uppercase tracking-widest w-full sm:w-auto" style={{ color: '#6366f1' }}>⚙ Settings</span>
            <label className="flex items-center gap-2 text-xs text-gray-600">
              <span className="font-semibold text-gray-700">Currency</span>
              <div className="relative">
                <select value={data.currency} onChange={e => set('currency', e.target.value)}
                  className="text-sm border rounded-xl px-3 py-2 pr-8 bg-white text-gray-700 focus:outline-none appearance-none cursor-pointer min-h-[40px]"
                  style={{ borderColor: 'rgba(99,102,241,0.3)' }}
                >
                  {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.code} – {c.symbol}</option>)}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
              </div>
            </label>
            <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
              <span className="font-semibold text-gray-700">Brand Color</span>
              <input type="color" value={data.brandColor} onChange={e => set('brandColor', e.target.value)}
                className="w-10 h-10 rounded-xl cursor-pointer border-2 p-0.5 bg-white"
                style={{ borderColor: 'rgba(99,102,241,0.3)' }}
              />
              <span className="font-mono text-indigo-400 text-[11px]">{data.brandColor}</span>
            </label>
            <button onClick={() => setShowSettings(false)} className="ml-auto text-xs text-gray-400 hover:text-red-500 flex items-center gap-1.5 transition min-h-[36px] px-2">
              <X className="w-4 h-4" /> Close
            </button>
          </div>
        </div>
      )}


      {/* ── MAIN: TWO-COLUMN LAYOUT ── */}
      <div className="flex print:hidden flex-col lg:flex-row items-start" style={{ minHeight: 'calc(100vh - 64px)' }}>

        {/* ═══════════ LEFT PANEL: FORM ═══════════ */}
        <div className={`w-full lg:w-[58%] lg:border-r border-gray-200 ${showMobilePreview ? 'hidden lg:block' : 'block'}`}>
          <div className="w-full px-4 sm:px-8 py-5 sm:py-7 pb-28 lg:pb-12 space-y-5">

            {/* ── CARD: Branding & Header ── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_16px_rgba(0,0,0,0.06)] p-5 sm:p-6">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: data.brandColor }}>
                  <Building2 className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Sender / Company</h3>
                  <p className="text-[11px] text-gray-400 mt-0.5">Your business details & invoice branding</p>
                </div>
              </div>
              <div className="flex items-start justify-between gap-4 mb-5">

                {/* Logo */}
                <div>
                  {data.senderLogo ? (
                    <div className="relative group inline-block">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={data.senderLogo}
                        alt="Logo"
                        className="h-14 w-28 sm:h-20 sm:w-44 object-contain border-2 border-dashed border-gray-200 rounded-xl p-1"
                      />
                      <button
                        onClick={() => set('senderLogo', '')}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-400 hover:bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow"
                      >×</button>
                    </div>
                  ) : (
                    <button
                      onClick={() => logoInputRef.current?.click()}
                      className="h-14 w-28 sm:h-20 sm:w-44 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center gap-1 text-gray-400 hover:border-blue-400 hover:text-blue-400 hover:bg-blue-50 active:bg-blue-50 transition"
                    >
                      <Upload className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="text-xs font-medium">Add Logo</span>
                    </button>
                  )}
                  <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogo} />
                </div>

                {/* INVOICE title */}
                <div className="flex flex-col items-end gap-2">
                  <h2 className="text-2xl sm:text-4xl font-black tracking-widest uppercase" style={{ color: data.brandColor }}>
                    INVOICE
                  </h2>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm text-gray-400">#</span>
                    <input
                      value={data.invoiceNumber}
                      onChange={e => set('invoiceNumber', e.target.value)}
                      className="w-20 sm:w-24 border border-gray-200 rounded-lg px-2 py-2 text-sm text-right font-semibold focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition min-h-[40px]"
                      placeholder="1"
                    />
                    <button
                      onClick={() => set('invoiceNumber', String(Math.floor(Math.random() * 9000) + 1000))}
                      title="Auto-generate"
                      className="text-gray-300 hover:text-blue-500 transition p-1.5 min-w-[32px] min-h-[32px] flex items-center justify-center"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Company Name */}
              <div className="mb-3">
                <label className="flex items-center gap-1.5 text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Company Name</label>
                <input
                  value={data.senderName}
                  onChange={e => set('senderName', e.target.value)}
                  placeholder="Your Company / Business Name"
                  className={inputBase}
                />
              </div>

              {/* Sender structured fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-2">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Your Name / Contact</label>
                  <input
                    value={data.senderInfo}
                    onChange={e => set('senderInfo', e.target.value)}
                    placeholder="e.g., John Doe"
                    className={inputBase}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Email</label>
                  <input
                    type="email"
                    value={data.senderEmail}
                    onChange={e => set('senderEmail', e.target.value)}
                    placeholder="your@email.com"
                    className={inputBase}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Phone</label>
                  <input
                    value={data.senderPhone}
                    onChange={e => set('senderPhone', e.target.value)}
                    placeholder="+1 555 000 0000"
                    className={inputBase}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Address</label>
                  <input
                    value={data.senderAddress}
                    onChange={e => set('senderAddress', e.target.value)}
                    placeholder="Street, City, Country"
                    className={inputBase}
                  />
                </div>
              </div>
            </div>

            {/* ── CARD: Client Details ── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_16px_rgba(0,0,0,0.06)] p-5 sm:p-6 space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Billed To / Payer</h3>
                  <p className="text-[11px] text-gray-400 mt-0.5">Client or customer receiving this invoice</p>
                </div>
              </div>
              <input
                value={data.clientName}
                onChange={e => set('clientName', e.target.value)}
                placeholder="Client / Company Name"
                className={cls(inputBase, 'font-semibold')}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  value={data.clientPhone || ''}
                  onChange={e => set('clientPhone', e.target.value)}
                  placeholder="Phone Number"
                  className={inputBase}
                />
                <input
                  value={data.clientEmail || ''}
                  onChange={e => set('clientEmail', e.target.value)}
                  placeholder="Email Address"
                  className={inputBase}
                />
              </div>
              <textarea
                value={data.clientAddress}
                onChange={e => set('clientAddress', e.target.value)}
                placeholder="Client Address (Street, City, Country)"
                rows={2}
                className={cls(inputBase, 'resize-none')}
              />
            </div>

            {/* ── CARD: Invoice Dates & Meta ── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_16px_rgba(0,0,0,0.06)] p-5 sm:p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-5 rounded-full" style={{ background: 'linear-gradient(180deg,#6366f1,#4f46e5)' }} />
                <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Invoice Details</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Invoice Date */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Invoice Date</label>
                  <input
                    type="date"
                    value={data.invoiceDate}
                    onChange={e => set('invoiceDate', e.target.value)}
                    className={dateInputClass}
                  />
                </div>
                {/* Due Date */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Due Date</label>
                  <input
                    type="date"
                    value={data.dueDate}
                    onChange={e => set('dueDate', e.target.value)}
                    className={dateInputClass}
                  />
                </div>
                {/* Payment Terms */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Payment Terms</label>
                  <input
                    type="text"
                    value={data.paymentTerms}
                    onChange={e => set('paymentTerms', e.target.value)}
                    placeholder="e.g. Net 30"
                    className={inputBase}
                  />
                </div>
                {/* PO Number */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">PO Number</label>
                  <input
                    type="text"
                    value={data.poNumber}
                    onChange={e => set('poNumber', e.target.value)}
                    placeholder="PO-0001"
                    className={inputBase}
                  />
                </div>
              </div>
            </div>

            {/* ── CARD: LINE ITEMS ── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_16px_rgba(0,0,0,0.06)] overflow-hidden">

              {/* Desktop table header */}
              <div
                className="hidden sm:grid gap-2 px-6 py-3 text-xs font-bold uppercase tracking-wider text-white"
                style={{ background: 'linear-gradient(90deg,#1e1b4b,#312e81)', gridTemplateColumns: '1fr 80px 100px 100px 44px' }}
              >
                <div>Item</div>
                <div className="text-center">Qty</div>
                <div className="text-center">Rate</div>
                <div className="text-right">Amount</div>
                <div />
              </div>

              {/* Mobile section label */}
              <div className="sm:hidden px-4 py-3 text-xs font-bold uppercase tracking-wider text-white flex items-center justify-between" style={{ background: 'linear-gradient(90deg,#1e1b4b,#312e81)' }}>
                <span>Line Items</span>
                <span className="text-white/50 text-[10px] normal-case tracking-normal font-normal">{data.items.length} item{data.items.length !== 1 ? 's' : ''}</span>
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
                        value={item.quantity === 0 ? '' : item.quantity}
                        placeholder="1"
                        onFocus={e => e.target.select()}
                        onChange={e => updateItem(item.id, { quantity: parseInt(e.target.value) || 1 })}
                        className={cls(inputBase, 'text-center')}
                      />
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">{sym}</span>
                        <input
                          type="number" min="0" step="0.01"
                          value={item.unitPrice === 0 ? '' : item.unitPrice}
                          placeholder="0.00"
                          onFocus={e => e.target.select()}
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
                    <div className="sm:hidden rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                      {/* Item name row + delete */}
                      <div className="flex items-center gap-2 px-3 pt-3 pb-2">
                        <input
                          value={item.name}
                          onChange={e => updateItem(item.id, { name: e.target.value })}
                          placeholder="Item name (e.g. Web Design)"
                          className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-3 text-[15px] text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all min-h-[48px]"
                        />
                        <button
                          onClick={() => removeItem(item.id)}
                          disabled={data.items.length === 1}
                          className="w-11 h-11 flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 disabled:opacity-20 transition rounded-xl border border-gray-200 bg-gray-50 shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Description */}
                      <div className="px-3 pb-2">
                        <input
                          value={item.description}
                          onChange={e => updateItem(item.id, { description: e.target.value })}
                          placeholder="Description (optional)"
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-600 placeholder-gray-400 focus:outline-none focus:border-blue-400 transition min-h-[44px]"
                        />
                      </div>

                      {/* Qty / Rate row + Amount badge */}
                      <div className="px-3 pb-3">
                        <div className="grid grid-cols-2 gap-2 mb-2">
                          <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Qty</label>
                            <input
                              type="number" min="1" step="1"
                              value={item.quantity === 0 ? '' : item.quantity}
                              placeholder="1"
                              onFocus={e => e.target.select()}
                              onChange={e => updateItem(item.id, { quantity: parseInt(e.target.value) || 1 })}
                              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-3 text-center text-[15px] font-semibold text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition min-h-[48px]"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Rate ({sym})</label>
                            <input
                              type="number" min="0" step="0.01"
                              value={item.unitPrice === 0 ? '' : item.unitPrice}
                              placeholder="0.00"
                              onFocus={e => e.target.select()}
                              onChange={e => updateItem(item.id, { unitPrice: parseFloat(e.target.value) || 0 })}
                              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-3 text-right text-[15px] font-semibold text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition min-h-[48px]"
                            />
                          </div>
                        </div>
                        {/* Amount total pill */}
                        <div
                          className="flex items-center justify-between px-4 py-2.5 rounded-xl"
                          style={{ background: `${data.brandColor}12`, border: `1px solid ${data.brandColor}25` }}
                        >
                          <span className="text-xs font-bold uppercase tracking-wider" style={{ color: `${data.brandColor}99` }}>Amount</span>
                          <span className="text-base font-black" style={{ color: data.brandColor }}>{sym}{item.total.toFixed(2)}</span>
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
                  className="flex items-center gap-2 text-sm font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 active:bg-blue-100 border border-blue-200 rounded-xl px-5 py-3.5 shadow-sm hover:shadow transition-all duration-200 w-full justify-center min-h-[52px]"
                >
                  <Plus className="w-4 h-4" /> Add Line Item
                </button>
              </div>
            </div>

            {/* ── CARD: NOTES + TOTALS ── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_16px_rgba(0,0,0,0.06)]">
              <div className="p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">

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
                <div className="rounded-2xl p-5 space-y-1" style={{ background: 'linear-gradient(145deg,#f8faff,#f0f4ff)', border: '1px solid rgba(99,102,241,0.12)' }}>
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

            {/* Remove duplicate footerNote field at bottom */}

          </div>{/* end invoice card / space-y-6 cards container */}

          {/* Mobile reset */}
          <button
            onClick={() => { if (confirm('Reset the form? All data will be lost.')) { setData(defaultData()); toast.success('Form reset!') } }}
            className="lg:hidden text-xs text-gray-400 hover:text-red-500 flex items-center justify-center gap-1.5 transition py-1 w-full"
          >
            <RotateCcw className="w-3 h-3" /> Start over
          </button>

        </div>

        {/* ═══════════ RIGHT PANEL: LIVE PREVIEW ═══════════ */}
        <div
          ref={previewPanelRef}
          className={`flex-col sticky w-full lg:w-[42%] ${showMobilePreview ? 'flex' : 'hidden lg:flex'}`}
          style={{ top: 64, height: 'calc(100vh - 64px)', background: 'linear-gradient(145deg,#e8ecf8,#dde3f5)' }}
        >
          {/* Preview toolbar */}
          <div className="px-4 py-2.5 bg-white border-b border-gray-200 flex items-center justify-between shrink-0 shadow-sm">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">Live Preview</span>
              <span className="text-[10px] text-gray-400 font-medium">Updates as you type</span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={handlePrint}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
              >
                <Printer className="w-3 h-3" /> Print
              </button>
              <button
                onClick={downloadPDF}
                disabled={isGenerating}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 rounded-lg transition shadow-sm"
              >
                {isGenerating
                  ? <><Loader2 className="w-3 h-3 animate-spin" /> Generating…</>
                  : <><Download className="w-3 h-3" /> Download PDF</>}
              </button>
            </div>
          </div>

          {/* Scrollable preview area */}
          <div className="flex-1 overflow-y-auto flex justify-center items-start py-6 px-6">
            <div
              className="shadow-2xl shadow-black/25 rounded-sm bg-white overflow-hidden"
              style={{
                width: `${794 * previewScale}px`,
                minHeight: `${1122 * previewScale}px`,
              }}
            >
              <div style={{ transform: `scale(${previewScale})`, transformOrigin: 'top left', width: 794, pointerEvents: 'none' }}>
                <PrintableInvoice data={data} />
              </div>
            </div>
          </div>

          {/* Preview footer bar */}
          <div className="px-4 py-2 bg-white border-t border-gray-200 flex items-center justify-between shrink-0">
            <span className="text-[10px] text-gray-400">A4 format · {Math.round(previewScale * 100)}% zoom</span>
            <button
              onClick={() => { if (confirm('Reset the form? All data will be lost.')) { setData(defaultData()); toast.success('Form reset!') } }}
              className="flex items-center gap-1 text-[10px] text-gray-400 hover:text-red-500 transition"
            >
              <RotateCcw className="w-3 h-3" /> Reset
            </button>
          </div>
        </div>
      </div>

      <footer className="print:hidden" style={{ borderTop: '1px solid rgba(99,102,241,0.1)', background: 'rgba(255,255,255,0.7)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-center">
          <p className="text-xs text-gray-400 text-center">
            &copy; 2019&ndash;{new Date().getFullYear()} <span className="font-semibold text-gray-500">invoice-gen.net</span>. All rights reserved.
          </p>
        </div>
      </footer>


      {/* ── MODALS ── */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-gray-900/40 backdrop-blur-sm print:hidden">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-xl w-full sm:max-w-md max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200">
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
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-gray-900/40 backdrop-blur-sm print:hidden">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-xl w-full sm:max-w-lg max-h-[90vh] overflow-y-auto animate-in fade-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200">
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
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-gray-900/40 backdrop-blur-sm print:hidden">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-xl w-full sm:max-w-md max-h-[90vh] overflow-y-auto animate-in fade-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200">
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
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-gray-900/40 backdrop-blur-sm print:hidden">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-xl w-full sm:max-w-lg max-h-[85vh] overflow-y-auto animate-in fade-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200">
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
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-gray-900/40 backdrop-blur-sm print:hidden">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-xl w-full sm:max-w-lg max-h-[85vh] overflow-y-auto animate-in fade-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200">
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
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-gray-900/40 backdrop-blur-sm print:hidden">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-xl w-full sm:max-w-lg overflow-hidden animate-in fade-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
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
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 print:hidden">
        <div className="bg-white/95 backdrop-blur-xl border-t border-gray-200 px-3 pt-2.5 flex gap-2 shadow-[0_-8px_30px_rgba(0,0,0,0.1)]"
          style={{ paddingBottom: 'calc(0.625rem + env(safe-area-inset-bottom, 0px))' }}
        >
          {/* Preview toggle */}
          <button
            onClick={() => setShowMobilePreview(p => !p)}
            className="flex flex-col items-center justify-center gap-0.5 px-3 py-2 text-xs font-semibold rounded-2xl transition shrink-0 min-w-[60px] min-h-[54px]"
            style={showMobilePreview
              ? { background: '#eef2ff', color: '#6366f1' }
              : { background: '#f3f4f6', color: '#4b5563' }}
          >
            {showMobilePreview ? <EyeOff className="w-4.5 h-4.5" style={{width:18,height:18}} /> : <Eye className="w-4.5 h-4.5" style={{width:18,height:18}} />}
            <span>{showMobilePreview ? 'Form' : 'Preview'}</span>
          </button>
          {/* Print */}
          <button
            onClick={handlePrint}
            className="flex flex-col items-center justify-center gap-0.5 px-3 py-2 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 active:scale-95 rounded-2xl transition shrink-0 min-w-[54px] min-h-[54px]"
          >
            <Printer className="w-4.5 h-4.5" style={{width:18,height:18}} />
            <span>Print</span>
          </button>
          {/* Download — full width */}
          <button
            onClick={downloadPDF}
            disabled={isGenerating}
            className="flex-1 flex items-center justify-center gap-2 text-sm font-bold text-white rounded-2xl active:scale-[0.97] transition-all disabled:opacity-60 min-h-[54px]"
            style={{ background: `linear-gradient(135deg, ${data.brandColor}, ${data.brandColor}cc)`, boxShadow: `0 4px 20px ${data.brandColor}44` }}
          >
            {isGenerating
              ? <><Loader2 className="w-5 h-5 animate-spin" /> Generating…</>
              : <><Download className="w-5 h-5" /> Download PDF</>}
          </button>
        </div>
      </div>

      {/* ── PRINTABLE INVOICE (always rendered off-screen for PDF capture) ── */}
      {/* IMPORTANT: use position:fixed off-screen, NOT display:none.
          html2canvas requires elements to be laid out in the DOM.
          display:none removes them from layout, causing silent hangs. */}
      <div
        ref={printContainerRef}
        aria-hidden
        style={{
          position: 'fixed',
          top: '-9999px',
          left: '-9999px',
          width: '794px',
          zIndex: -1,
          pointerEvents: 'none',
          overflow: 'visible',
          // position is temporarily swapped to 'absolute' during PDF capture
          // to fix html2canvas off-screen bounding-rect issue
        }}
      >
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
  if (!d) return ''
  try {
    const date = new Date(d + 'T12:00:00')
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  } catch { return d }
}

function PrintableInvoice({ data }: { data: InvoiceData }) {
    const sym = getCurrencySymbol(data.currency)
    const brand = data.brandColor || '#1e3a8a'
    const brandLight = brand + '18'
    const initials = (data.senderName || 'A').charAt(0).toUpperCase()
    // Only render items that actually have a name — avoids blank rows from defaultItem
    const validItems = data.items.filter(i => i.name && i.name.trim().length > 0)

    const ml = (text: string | undefined) => text ? text.split('\n').map((l, i) => <div key={i}>{l}</div>) : null
    const fmt = (n: number) => n.toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

    // Use Inter (guaranteed to be loaded by Next.js layout) rather than Plus Jakarta Sans
    const fontFamily = "'Inter', 'Segoe UI', system-ui, sans-serif"

    return (
      <div style={{ fontFamily, background: '#fff', color: '#1a1a3e', width: '794px', minHeight: '1122px', padding: '48px 50px', boxSizing: 'border-box', fontSize: 13, display: 'flex', flexDirection: 'column' }}>

        {/* ── HEADER ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 22 }}>

          {/* LEFT: Logo + company + contact */}
          <div style={{ flex: '0 0 52%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
              {data.senderLogo
                ? <img src={data.senderLogo} alt="logo" style={{ width: 54, height: 54, objectFit: 'contain' }} />
                : <svg width="54" height="54" viewBox="0 0 100 100">
                    <polygon points="50,4 93,27 93,73 50,96 7,73 7,27" fill="none" stroke={brand} strokeWidth="5.5" />
                    <text x="50" y="66" textAnchor="middle" fill={brand} fontSize="40" fontWeight="800" fontFamily="Plus Jakarta Sans,Inter,sans-serif">{initials}</text>
                  </svg>
              }
              <div>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#0d1b4b', lineHeight: 1.15 }}>{data.senderName || 'YOUR COMPANY NAME'}</div>
                {data.senderInfo && !data.senderAddress && !data.senderPhone && !data.senderEmail && <div style={{ fontSize: 10, color: '#888', marginTop: 3, letterSpacing: '0.04em' }}>{data.senderInfo.split('\n')[0]}</div>}
              </div>
            </div>
            {data.senderAddress && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 7, fontSize: 12, color: '#444' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill={brand} style={{ flexShrink: 0, marginTop: 1 }}><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                <div>{ml(data.senderAddress)}</div>
              </div>
            )}
            {data.senderPhone && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7, fontSize: 12, color: '#444' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill={brand} style={{ flexShrink: 0 }}><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>
                {data.senderPhone}
              </div>
            )}
            {data.senderEmail && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#444' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill={brand} style={{ flexShrink: 0 }}><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
                {data.senderEmail}
              </div>
            )}
          </div>

          {/* RIGHT: INVOICE title + meta */}
          <div style={{ flex: '0 0 44%', textAlign: 'right' }}>
            <div style={{ fontSize: 52, fontWeight: 900, color: '#0d1b4b', letterSpacing: '-0.02em', lineHeight: 1, marginBottom: 22 }}>INVOICE</div>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <tbody>
                <tr>
                  <td style={{ fontSize: 10, fontWeight: 700, color: '#555', letterSpacing: '0.1em', textTransform: 'uppercase', paddingBottom: 8, paddingRight: 8, whiteSpace: 'nowrap' }}>Invoice No.</td>
                  <td style={{ fontSize: 10, fontWeight: 700, color: '#555', paddingBottom: 8, paddingRight: 8 }}>:</td>
                  <td style={{ fontSize: 13, fontWeight: 700, color: brand, paddingBottom: 8, textAlign: 'right' }}>{data.invoiceNumber ? `#${data.invoiceNumber}` : ''}</td>
                </tr>
                <tr><td colSpan={3} style={{ borderTop: '1px solid #eee', paddingBottom: 8 }} /></tr>
                <tr>
                  <td style={{ fontSize: 10, fontWeight: 700, color: '#555', letterSpacing: '0.1em', textTransform: 'uppercase', paddingBottom: 8, paddingRight: 8 }}>Invoice Date</td>
                  <td style={{ fontSize: 10, fontWeight: 700, color: '#555', paddingBottom: 8, paddingRight: 8 }}>:</td>
                  <td style={{ fontSize: 12, color: '#333', paddingBottom: 8, textAlign: 'right' }}>{fmtDate(data.invoiceDate)}</td>
                </tr>
                <tr><td colSpan={3} style={{ borderTop: '1px solid #eee', paddingBottom: 8 }} /></tr>
                <tr>
                  <td style={{ fontSize: 10, fontWeight: 700, color: '#555', letterSpacing: '0.1em', textTransform: 'uppercase', paddingRight: 8 }}>Due Date</td>
                  <td style={{ fontSize: 10, fontWeight: 700, color: '#555', paddingRight: 8 }}>:</td>
                  <td style={{ fontSize: 12, color: '#333', textAlign: 'right' }}>{fmtDate(data.dueDate)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Blue divider */}
        <div style={{ height: 2, background: brand, marginBottom: 22 }} />

        {/* ── BILLED TO / PAY TO ── */}
        <div style={{ display: 'flex', marginBottom: 22, minHeight: 100 }}>
          <div style={{ flex: 1, paddingRight: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 10 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: brand, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
              </div>
              <span style={{ fontSize: 11, fontWeight: 800, color: brand, letterSpacing: '0.1em', textTransform: 'uppercase', lineHeight: '28px' }}>Billed To</span>
            </div>
            <div style={{ fontSize: 13, color: '#333', lineHeight: 1.75 }}>
              {data.clientName && <div style={{ fontWeight: 700, color: '#111' }}>{data.clientName}</div>}
              {data.clientCompany && <div>{data.clientCompany}</div>}
              {data.clientAddress && <div style={{ color: '#555' }}>{ml(data.clientAddress)}</div>}
              {data.clientPhone && <div style={{ color: '#555' }}>{data.clientPhone}</div>}
              {data.clientEmail && <div style={{ color: '#555' }}>{data.clientEmail}</div>}
            </div>
          </div>
          <div style={{ width: 1, background: '#ddd' }} />
          <div style={{ flex: 1, paddingLeft: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 10 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: brand, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
              </div>
              <span style={{ fontSize: 11, fontWeight: 800, color: brand, letterSpacing: '0.1em', textTransform: 'uppercase', lineHeight: '28px' }}>Pay To</span>
            </div>
            <div style={{ fontSize: 13, color: '#333', lineHeight: 1.75 }}>
              {data.senderInfo ? ml(data.senderInfo) : (
                <>
                  {data.senderName && <div style={{ fontWeight: 700, color: '#111' }}>{data.senderName}</div>}
                  {data.senderAddress && <div style={{ color: '#555' }}>{ml(data.senderAddress)}</div>}
                  {data.senderPhone && <div style={{ color: '#555' }}>{data.senderPhone}</div>}
                  {data.senderEmail && <div style={{ color: '#555' }}>{data.senderEmail}</div>}
                </>
              )}
            </div>
          </div>
        </div>

        {/* ── ITEMS TABLE ── */}
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, marginBottom: 0 }}>
          <thead>
            <tr style={{ background: brand }}>
              <th style={{ padding: '12px 14px', textAlign: 'left', color: '#fff', fontWeight: 700, fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', width: '45%' }}>Description</th>
              <th style={{ padding: '12px 14px', textAlign: 'center', color: '#fff', fontWeight: 700, fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Rate</th>
              <th style={{ padding: '12px 14px', textAlign: 'center', color: '#fff', fontWeight: 700, fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Hours / Qty</th>
              <th style={{ padding: '12px 14px', textAlign: 'right', color: '#fff', fontWeight: 700, fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {validItems.map((item) => (
              <tr key={item.id} style={{ borderBottom: '1px dashed #ccc' }}>
                <td style={{ padding: '13px 14px', color: '#222', fontWeight: 500 }}>
                  {item.name}
                  {item.description && <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>{item.description}</div>}
                </td>
                <td style={{ padding: '13px 14px', textAlign: 'center', color: '#444' }}>{item.unitPrice ? `${sym} ${fmt(item.unitPrice)}` : ''}</td>
                <td style={{ padding: '13px 14px', textAlign: 'center', color: '#444' }}>{item.quantity || ''}</td>
                <td style={{ padding: '13px 14px', textAlign: 'right', color: '#222', fontWeight: 500 }}>{item.total ? `${sym} ${fmt(item.total)}` : ''}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* ── TOTALS ── */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', marginBottom: 24 }}>
          <div style={{ width: '55%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', borderBottom: '1px solid #eee' }}>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#555' }}>Subtotal</span>
              <span style={{ fontSize: 13, color: '#333' }}>{sym} {fmt(data.subtotal)}</span>
            </div>
            {data.taxRate > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderBottom: '1px solid #eee' }}>
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#555' }}>Tax ({data.taxRate}%)</span>
                <span style={{ fontSize: 13, color: '#333' }}>{sym} {fmt(data.taxAmount)}</span>
              </div>
            )}
            {data.shipping > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderBottom: '1px solid #eee' }}>
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#555' }}>Shipping</span>
                <span style={{ fontSize: 13, color: '#333' }}>{sym} {fmt(data.shipping)}</span>
              </div>
            )}
            {data.discount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderBottom: '1px solid #eee' }}>
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#555' }}>Discount</span>
                <span style={{ fontSize: 13, color: '#333' }}>-{sym} {fmt(data.discount)}</span>
              </div>
            )}
            {/* TOTAL */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 14px', background: brandLight, borderTop: `2px solid ${brand}`, borderBottom: `2px solid ${brand}` }}>
              <span style={{ fontSize: 16, fontWeight: 900, color: brand, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Total</span>
              <span style={{ fontSize: 16, fontWeight: 900, color: brand }}>{sym} {fmt(data.total)}</span>
            </div>
            {data.amountPaid > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px' }}>
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#555' }}>Balance Due</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#111' }}>{sym} {fmt(Math.max(0, data.total - data.amountPaid))}</span>
              </div>
            )}
          </div>
        </div>

        {/* Flex spacer */}
        <div style={{ flex: 1 }} />

        {/* Blue divider */}
        <div style={{ height: 2, background: brand, marginBottom: 20 }} />

        {/* ── FOOTER: NOTES + PAYMENT INFO ── */}
        <div style={{ display: 'flex', gap: 24, marginBottom: 20 }}>
          {/* NOTES */}
          <div style={{ flex: 1 }}>
            {(data.notes || data.terms) && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 10 }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: brand, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 800, color: brand, letterSpacing: '0.1em', textTransform: 'uppercase', lineHeight: '28px' }}>Notes</span>
                </div>
                {data.notes && <div style={{ fontSize: 11, color: '#555', lineHeight: 1.7 }}>{ml(data.notes)}</div>}
                {data.terms && <div style={{ fontSize: 11, color: '#555', lineHeight: 1.7, marginTop: 6 }}>{ml(data.terms)}</div>}
              </>
            )}
          </div>

          {/* PAYMENT INFORMATION */}
          <div style={{ flex: 1 }}>
            {(data.paymentTerms || data.footerNote) && (
              <div style={{ background: brandLight, borderRadius: 8, padding: '14px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 10 }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: brand, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M20 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/></svg>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 800, color: brand, letterSpacing: '0.1em', textTransform: 'uppercase', lineHeight: '28px' }}>Payment Information</span>
                </div>
                {data.paymentTerms && <div style={{ fontSize: 11, color: '#444', lineHeight: 1.75 }}>{ml(data.paymentTerms)}</div>}
                {data.footerNote && <div style={{ fontSize: 11, color: '#444', lineHeight: 1.75, marginTop: 6 }}>{ml(data.footerNote)}</div>}
              </div>
            )}
          </div>
        </div>

        {/* Thank you - always show */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, paddingTop: 16, borderTop: `1px solid ${brand}` }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill={brand} style={{ display: 'block' }}><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
          <span style={{ fontSize: 11, fontWeight: 700, color: brand, letterSpacing: '0.12em', textTransform: 'uppercase', lineHeight: '14px' }}>Thank you for your business!</span>
        </div>

      </div>
    )
  }

