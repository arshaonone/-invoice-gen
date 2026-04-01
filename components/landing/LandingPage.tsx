'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useState } from 'react'
import {
  FileText, Zap, Download, Shield, Globe, Palette,
  CheckCircle, ArrowRight, Star, ChevronRight, Menu, X,
  BarChart3, Clock, Send, Sparkles
} from 'lucide-react'
import ThemeToggle from '@/components/ui/ThemeToggle'

const fadeUp = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } } }
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } } }

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-white dark:bg-surface-950 overflow-x-hidden">
      {/* ─── Navbar ─── */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-light dark:glass border-b border-gray-100 dark:border-surface-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 to-violet-500 flex items-center justify-center shadow-glow">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-700 text-gray-900 dark:text-white text-lg">invoice-gen<span className="text-brand-500">.net</span></span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            {['Features', 'Templates', 'Pricing'].map(item => (
              <a key={item} href={`#${item.toLowerCase()}`} className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">{item}</a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />
            <Link href="/login" className="btn-ghost text-sm">Log in</Link>
            <Link href="/register" className="btn-primary text-sm">Get started free</Link>
          </div>

          <button className="md:hidden p-2 rounded-lg text-gray-600 dark:text-gray-400" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="md:hidden border-t border-gray-100 dark:border-surface-700 px-4 py-4 space-y-2">
            {['Features', 'Templates', 'Pricing'].map(item => (
              <a key={item} href={`#${item.toLowerCase()}`} className="block py-2 text-sm text-gray-700 dark:text-gray-300">{item}</a>
            ))}
            <div className="pt-2 flex flex-col gap-2">
              <Link href="/login" className="btn-secondary w-full justify-center">Log in</Link>
              <Link href="/register" className="btn-primary w-full justify-center">Get started free</Link>
            </div>
          </motion.div>
        )}
      </nav>

      {/* ─── Hero ─── */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        {/* Mesh background */}
        <div className="absolute inset-0 mesh-bg-light dark:mesh-bg" />

        {/* Floating blobs */}
        <div className="absolute top-24 left-1/4 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-40 right-1/4 w-72 h-72 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-5xl mx-auto text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={stagger}>
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-800 text-brand-600 dark:text-brand-400 text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              <span>New: Multi-template support + Bangla language</span>
              <ChevronRight className="w-4 h-4" />
            </motion.div>

            <motion.h1 variants={fadeUp} className="text-5xl sm:text-6xl md:text-7xl font-display font-800 leading-[1.1] text-gray-900 dark:text-white mb-6">
              Create{' '}
              <span className="gradient-text">professional</span>
              <br />
              invoices in seconds
            </motion.h1>

            <motion.p variants={fadeUp} className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              The most beautiful invoice generator on the web. No design skills needed.
              Send, download, and track invoices like a Fortune 500 company.
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Link href="/register" className="btn-primary px-8 py-3.5 text-base gap-3 shadow-glow">
                Start for free
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/invoices/create" className="btn-secondary px-8 py-3.5 text-base">
                Try without account
              </Link>
            </motion.div>

            {/* Social proof */}
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-gray-500 dark:text-gray-500">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {['bg-brand-400', 'bg-violet-400', 'bg-emerald-400', 'bg-amber-400'].map((c, i) => (
                    <div key={i} className={`w-7 h-7 rounded-full ${c} border-2 border-white dark:border-surface-950`} />
                  ))}
                </div>
                <span>10,000+ businesses</span>
              </div>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
                <span className="ml-1">4.9/5</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span>No credit card required</span>
              </div>
            </motion.div>
          </motion.div>

          {/* ── Hero Invoice Preview Card ─── */}
          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.8, ease: 'easeOut' }}
            className="mt-20 relative mx-auto max-w-4xl"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white dark:to-surface-950 z-10 bottom-0 top-auto h-20 pointer-events-none" />
            <div className="card shadow-2xl dark:shadow-black/50 overflow-hidden border border-gray-100 dark:border-surface-600 rounded-3xl">
              {/* Window chrome */}
              <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 dark:bg-surface-900 border-b border-gray-100 dark:border-surface-700">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-emerald-400" />
                <div className="flex-1 mx-4 bg-white dark:bg-surface-800 rounded-lg px-3 py-1 text-xs text-gray-400 dark:text-gray-500">
                  invoice-gen.net/create
                </div>
              </div>
              {/* Split preview */}
              <div className="grid grid-cols-2 min-h-[400px]">
                {/* Left: form side */}
                <div className="p-6 space-y-4 bg-gray-50 dark:bg-surface-900 border-r border-gray-100 dark:border-surface-700">
                  <div className="space-y-1">
                    <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">From</div>
                    <div className="bg-white dark:bg-surface-800 rounded-xl p-3 border border-gray-200 dark:border-surface-600 text-sm text-gray-700 dark:text-gray-300">Acme Corp</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Bill To</div>
                    <div className="bg-white dark:bg-surface-800 rounded-xl p-3 border border-gray-200 dark:border-surface-600 text-sm text-gray-700 dark:text-gray-300">John Client</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Items</div>
                    {[['Website Design', '$2,500'], ['SEO Package', '$800']].map(([name, price]) => (
                      <div key={name} className="flex justify-between bg-white dark:bg-surface-800 rounded-xl p-3 border border-gray-200 dark:border-surface-600 text-sm">
                        <span className="text-gray-700 dark:text-gray-300">{name}</span>
                        <span className="font-semibold text-brand-500">{price}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between items-center bg-brand-500 rounded-xl p-3 text-white">
                    <span className="text-sm font-semibold">Total</span>
                    <span className="font-bold">$3,300.00</span>
                  </div>
                </div>
                {/* Right: live preview side */}
                <div className="p-6 bg-white dark:bg-surface-800">
                  <div className="h-full space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-display font-700 text-gray-900 dark:text-white text-lg">INVOICE</div>
                        <div className="text-sm text-gray-400">#INV-2025-0042</div>
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-violet-500" />
                    </div>
                    <div className="h-px bg-gray-100 dark:bg-surface-600" />
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div><div className="text-gray-400 text-xs mb-1">FROM</div><div className="font-medium dark:text-white">Acme Corp</div></div>
                      <div><div className="text-gray-400 text-xs mb-1">BILL TO</div><div className="font-medium dark:text-white">John Client</div></div>
                    </div>
                    <div className="space-y-2 mt-4">
                      {[['Website Design', 1, '$2,500.00'], ['SEO Package', 1, '$800.00']].map(([n, q, p]) => (
                        <div key={n} className="flex justify-between items-center text-sm py-2 border-b border-gray-50 dark:border-surface-700">
                          <span className="text-gray-700 dark:text-gray-300">{n}</span>
                          <span className="text-gray-400 mx-2">x{q}</span>
                          <span className="font-semibold dark:text-white">{p}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-auto pt-4">
                      <div className="flex justify-between font-bold text-lg text-gray-900 dark:text-white">
                        <span>Total</span>
                        <span className="text-brand-500">$3,300.00</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── Features ─── */}
      <section id="features" className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center mb-16">
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-800 text-brand-600 dark:text-brand-400 text-xs font-semibold uppercase tracking-wider mb-4">
              Everything you need
            </motion.div>
            <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-display font-800 text-gray-900 dark:text-white mb-4">
              Built for modern <span className="gradient-text">businesses</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Everything you need to create, send, and track invoices — beautifully.
            </motion.p>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Zap, title: 'Lightning Fast', desc: 'Create a professional invoice in under 60 seconds with smart auto-fill.', color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/10' },
              { icon: Palette, title: 'Fully Customizable', desc: 'Your brand colors, logo, and custom templates. Invoices that feel like you.', color: 'text-brand-500', bg: 'bg-brand-50 dark:bg-brand-900/10' },
              { icon: Download, title: 'PDF Export & Print', desc: 'Download pixel-perfect PDFs or print directly from your browser.', color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/10' },
              { icon: BarChart3, title: 'Revenue Analytics', desc: 'Track your earnings with beautiful charts and at-a-glance stats.', color: 'text-violet-500', bg: 'bg-violet-50 dark:bg-violet-900/10' },
              { icon: Send, title: 'Email Invoices', desc: 'Send invoices directly from the platform. Track opens and payments.', color: 'text-sky-500', bg: 'bg-sky-50 dark:bg-sky-900/10' },
              { icon: Globe, title: 'Multi-currency & i18n', desc: '14+ currencies. Full English and Bangla language support.', color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-900/10' },
              { icon: Clock, title: 'Invoice History', desc: 'All your invoices saved forever. Edit, delete, or duplicate with one click.', color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/10' },
              { icon: Shield, title: 'Secure & Private', desc: 'Your data is encrypted and never shared. Built with enterprise security.', color: 'text-teal-500', bg: 'bg-teal-50 dark:bg-teal-900/10' },
              { icon: FileText, title: '3 Pro Templates', desc: 'Minimal, Modern, and Bold. Switch templates with one click.', color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-900/10' },
            ].map(({ icon: Icon, title, desc, color, bg }) => (
              <motion.div key={title} variants={fadeUp} className="card card-hover p-6 group cursor-default">
                <div className={`w-12 h-12 rounded-2xl ${bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200`}>
                  <Icon className={`w-6 h-6 ${color}`} />
                </div>
                <h3 className="font-display font-600 text-gray-900 dark:text-white mb-2">{title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── Templates ─── */}
      <section id="templates" className="py-24 px-4 bg-gray-50 dark:bg-surface-900">
        <div className="max-w-7xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center mb-16">
            <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-display font-800 text-gray-900 dark:text-white mb-4">
              Choose your <span className="gradient-text">style</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-lg text-gray-600 dark:text-gray-400">Three hand-crafted templates to match your brand</motion.p>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="grid md:grid-cols-3 gap-8">
            {[
              { name: 'Minimal', desc: 'Clean, elegant, timeless', badge: 'Free', color: '#6366f1' },
              { name: 'Modern', desc: 'Bold gradients, card-style', badge: 'Pro', color: '#8b5cf6' },
              { name: 'Bold', desc: 'Dark, powerful, striking', badge: 'Pro', color: '#ec4899' },
            ].map(({ name, desc, badge, color }, i) => (
              <motion.div key={name} variants={fadeUp} className="card card-hover overflow-hidden group">
                {/* Template preview */}
                <div className="h-56 relative" style={{ background: i === 2 ? '#0f0f1a' : '#f8fafc' }}>
                  <div className="absolute inset-4 rounded-xl bg-white/80 dark:bg-surface-800/80 p-4 shadow-md">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="font-bold text-gray-900 text-sm">INVOICE</div>
                        <div className="text-xs text-gray-400">#INV-001</div>
                      </div>
                      <div className="w-8 h-8 rounded-lg" style={{ background: color }} />
                    </div>
                    <div className="space-y-1.5">
                      {['Design Service', 'Development', 'Consulting'].map((item, j) => (
                        <div key={item} className="flex justify-between text-xs">
                          <span className="text-gray-500">{item}</span>
                          <span className="font-medium" style={{ color }}>${(j + 1) * 500}.00</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 pt-2 border-t border-gray-100 flex justify-between text-sm font-bold">
                      <span className="text-gray-700">Total</span>
                      <span style={{ color }}>$3,000.00</span>
                    </div>
                  </div>
                </div>
                <div className="p-5 flex items-center justify-between">
                  <div>
                    <div className="font-display font-700 text-gray-900 dark:text-white">{name}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{desc}</div>
                  </div>
                  <span className={`badge ${badge === 'Free' ? 'badge-success' : 'badge-info'}`}>{badge}</span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── Pricing ─── */}
      <section id="pricing" className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center mb-16">
            <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-display font-800 text-gray-900 dark:text-white mb-4">
              Simple, <span className="gradient-text">honest pricing</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-lg text-gray-600 dark:text-gray-400">No hidden fees. Cancel anytime.</motion.p>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {/* Free plan */}
            <motion.div variants={fadeUp} className="card p-8">
              <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">FREE</div>
              <div className="text-4xl font-display font-800 text-gray-900 dark:text-white mb-1">$0</div>
              <div className="text-sm text-gray-400 mb-6">Forever free</div>
              <ul className="space-y-3 mb-8">
                {['5 invoices per month', '1 template (Minimal)', 'PDF export & print', 'Multi-currency support', 'Email support'].map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <Link href="/register" className="btn-secondary w-full justify-center">Get started free</Link>
            </motion.div>

            {/* Pro plan */}
            <motion.div variants={fadeUp} className="gradient-border rounded-2xl p-8 relative overflow-hidden bg-white dark:bg-surface-800 shadow-glow-lg">
              <div className="absolute top-4 right-4 badge badge-info">Most popular</div>
              <div className="text-sm font-semibold text-brand-500 mb-2">PRO</div>
              <div className="text-4xl font-display font-800 text-gray-900 dark:text-white mb-1">$12</div>
              <div className="text-sm text-gray-400 mb-6">per month, billed monthly</div>
              <ul className="space-y-3 mb-8">
                {[
                  'Unlimited invoices',
                  'All 3 templates (Minimal, Modern, Bold)',
                  'PDF + email sending',
                  'Revenue analytics dashboard',
                  'Custom branding & logo',
                  'Client management',
                  'Multi-business support',
                  'Priority support',
                ].map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <CheckCircle className="w-4 h-4 text-brand-500 flex-shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <Link href="/register" className="btn-primary w-full justify-center">Start Pro free trial</Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-24 px-4">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
          <motion.div variants={fadeUp} className="max-w-4xl mx-auto text-center bg-gradient-to-br from-brand-600 to-violet-600 rounded-3xl p-16 relative overflow-hidden shadow-glow-lg">
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 80%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
            <h2 className="text-4xl md:text-5xl font-display font-800 text-white mb-4 relative">Ready to get paid faster?</h2>
            <p className="text-xl text-white/80 mb-8 relative">Join 10,000+ businesses already using invoice-gen.net</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative">
              <Link href="/register" className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-brand-600 font-semibold rounded-xl hover:bg-gray-50 transition-all shadow-lg hover:shadow-xl active:scale-95">
                Start for free <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/invoices/create" className="inline-flex items-center gap-2 px-8 py-3.5 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-all border border-white/20">
                Try it now
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-gray-100 dark:border-surface-800 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-500 to-violet-500 flex items-center justify-center">
                <FileText className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-display font-700 text-gray-900 dark:text-white">invoice-gen<span className="text-brand-500">.net</span></span>
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
              {['Privacy Policy', 'Terms of Service', 'Help Center'].map(l => (
                <a key={l} href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">{l}</a>
              ))}
            </div>
            <div className="text-sm text-gray-400">© {new Date().getFullYear()} invoice-gen.net. All rights reserved.</div>
          </div>
        </div>
      </footer>
    </div>
  )
}
