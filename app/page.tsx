'use client'
import Link from 'next/link'
import { FileText, Download, Zap, Shield, Globe, Smartphone, ArrowRight, Check, Star, ChevronRight, Sparkles } from 'lucide-react'

const features = [
  { icon: Zap, title: 'Instant PDF Download', desc: 'Generate pixel-perfect A4 invoices in one click. No waiting, no servers — pure browser speed.', color: '#f59e0b' },
  { icon: Shield, title: 'No Account Required', desc: 'Your data never leaves your browser. 100% private, 100% free, forever. No email, no password.', color: '#10b981' },
  { icon: Globe, title: 'Multi-Currency & Languages', desc: 'Support for 50+ currencies with automatic symbol formatting. Perfect for global freelancers.', color: '#6366f1' },
  { icon: Smartphone, title: 'Mobile Optimized', desc: 'Create invoices on the go from any device. iOS-native feel with full touch support.', color: '#ec4899' },
  { icon: FileText, title: 'Professional Templates', desc: 'Clean, print-ready layouts trusted by 50,000+ freelancers, agencies and small businesses.', color: '#06b6d4' },
  { icon: Download, title: 'Print & Email Ready', desc: 'Download as PDF or print directly from your browser. Share with clients instantly.', color: '#8b5cf6' },
]

const stats = [
  { value: '50K+', label: 'Invoices Created' },
  { value: '100%', label: 'Free Forever' },
  { value: '0', label: 'Sign-ups Needed' },
  { value: '30s', label: 'Avg. Creation Time' },
]

const steps = [
  { n: '01', title: 'Add Your Details', desc: 'Enter your business info and logo once. We save it in your browser automatically.' },
  { n: '02', title: 'Fill Client & Items', desc: 'Add client details, line items with quantities and rates. Tax and totals calculate live.' },
  { n: '03', title: 'Download & Send', desc: 'Hit Download PDF and get a professional invoice ready to send in seconds.' },
]

const testimonials = [
  { name: 'Sarah K.', role: 'Freelance Designer', stars: 5, text: 'I use this every month for all my clients. No login, no fuss — just perfect invoices.' },
  { name: 'Marcus T.', role: 'Web Developer', stars: 5, text: 'Tried 6 invoice tools. This one is the fastest and cleanest. The live preview is 🔥' },
  { name: 'Priya M.', role: 'Marketing Consultant', stars: 5, text: 'The glassmorphism UI is gorgeous and it works flawlessly on my iPhone.' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen font-sans overflow-x-hidden" style={{ background: 'linear-gradient(135deg,#0f0c29 0%,#1a1040 40%,#0d1b4b 100%)' }}>

      {/* ── NAV ── */}
      <nav className="sticky top-0 z-50" style={{ background: 'rgba(15,12,41,0.8)', backdropFilter: 'blur(24px)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#818cf8,#6366f1)', boxShadow: '0 0 20px rgba(99,102,241,0.5)' }}>
              <FileText className="w-4 h-4 text-white" />
            </div>
            <span className="font-black text-white text-[15px]">invoice-<span style={{ color: '#a5b4fc' }}>gen</span><span className="text-white/30 font-normal text-sm">.net</span></span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-white/60">
            <a href="#features" className="hover:text-white transition">Features</a>
            <a href="#how-it-works" className="hover:text-white transition">How it works</a>
            <a href="#testimonials" className="hover:text-white transition">Reviews</a>
          </div>
          <Link href="/editor"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all"
            style={{ background: 'linear-gradient(135deg,#818cf8,#6366f1)', boxShadow: '0 4px 20px rgba(99,102,241,0.4)' }}>
            Create Invoice <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative pt-20 pb-28 px-4 sm:px-6 overflow-hidden">
        {/* Background orbs */}
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle,rgba(99,102,241,0.15) 0%,transparent 70%)', filter: 'blur(40px)' }} />
        <div className="absolute top-20 right-1/4 w-[400px] h-[400px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle,rgba(16,185,129,0.12) 0%,transparent 70%)', filter: 'blur(40px)' }} />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 text-xs font-bold tracking-widest uppercase"
            style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(165,180,252,0.25)', color: '#a5b4fc' }}>
            <Sparkles className="w-3.5 h-3.5" /> Free Forever · No Sign-up Required
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-[1.05] tracking-tight mb-6">
            Create Professional<br />
            <span style={{ background: 'linear-gradient(90deg,#818cf8,#a78bfa,#10b981)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Invoices in 30 Seconds
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed">
            The fastest free invoice generator on the web. Live preview, PDF download, no login required.
            Trusted by 50,000+ freelancers and small businesses.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link href="/editor"
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl text-base font-bold text-white transition-all active:scale-95"
              style={{ background: 'linear-gradient(135deg,#818cf8,#6366f1)', boxShadow: '0 8px 32px rgba(99,102,241,0.5)' }}>
              <Zap className="w-5 h-5" /> Create Free Invoice
            </Link>
            <a href="#how-it-works"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-base font-semibold transition-all"
              style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.8)', border: '1px solid rgba(255,255,255,0.12)' }}>
              See How It Works <ChevronRight className="w-4 h-4" />
            </a>
          </div>

          {/* Hero card mockup */}
          <div className="relative max-w-4xl mx-auto">
            <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 40px 100px rgba(0,0,0,0.6)', backdropFilter: 'blur(20px)' }}>
              {/* Fake toolbar */}
              <div className="flex items-center gap-2 px-5 py-3.5" style={{ background: 'rgba(15,12,41,0.8)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                <div className="w-3 h-3 rounded-full bg-red-400/70" />
                <div className="w-3 h-3 rounded-full bg-yellow-400/70" />
                <div className="w-3 h-3 rounded-full bg-green-400/70" />
                <div className="mx-auto text-xs text-white/30 font-mono">invoice-gen.net/editor</div>
              </div>
              {/* Two-panel mockup */}
              <div className="flex min-h-[320px]">
                {/* Left form panel */}
                <div className="flex-1 p-6 space-y-4" style={{ borderRight: '1px solid rgba(255,255,255,0.07)' }}>
                  <div className="h-3 w-28 rounded-full" style={{ background: 'rgba(165,180,252,0.3)' }} />
                  {[80, 60, 90, 70].map((w, i) => (
                    <div key={i} className="space-y-1.5">
                      <div className="h-2 rounded-full" style={{ width: `${w * 0.4}%`, background: 'rgba(255,255,255,0.15)' }} />
                      <div className="h-9 rounded-xl" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }} />
                    </div>
                  ))}
                  <div className="h-10 rounded-xl flex items-center justify-center text-xs font-bold"
                    style={{ background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(165,180,252,0.2)', color: '#a5b4fc' }}>
                    + Add Line Item
                  </div>
                </div>
                {/* Right preview panel */}
                <div className="w-[45%] p-6 flex flex-col gap-3">
                  <div className="flex justify-between items-start mb-2">
                    <div className="space-y-1.5">
                      <div className="h-2.5 w-16 rounded-full" style={{ background: 'rgba(255,255,255,0.3)' }} />
                      <div className="h-2 w-24 rounded-full" style={{ background: 'rgba(255,255,255,0.1)' }} />
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-black" style={{ color: '#a5b4fc' }}>INVOICE</div>
                      <div className="text-xs text-white/30">#INV-0042</div>
                    </div>
                  </div>
                  <div className="flex-1 rounded-xl p-3 space-y-2" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                    {[['Web Design', '$2,400'], ['Development', '$3,600'], ['SEO Audit', '$800']].map(([item, amt]) => (
                      <div key={item} className="flex justify-between text-xs">
                        <span className="text-white/40">{item}</span>
                        <span className="text-white/70 font-semibold">{amt}</span>
                      </div>
                    ))}
                    <div className="border-t pt-2 mt-2 flex justify-between" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                      <span className="text-xs text-white/40">Total</span>
                      <span className="text-sm font-black text-emerald-400">$6,800.00</span>
                    </div>
                  </div>
                  <div className="h-9 rounded-xl flex items-center justify-center gap-2 text-xs font-bold text-white"
                    style={{ background: 'linear-gradient(135deg,#818cf8,#6366f1)', boxShadow: '0 4px 16px rgba(99,102,241,0.4)' }}>
                    <Download className="w-3.5 h-3.5" /> Download PDF
                  </div>
                </div>
              </div>
            </div>
            {/* Floating badge */}
            <div className="absolute -bottom-4 left-8 px-4 py-2 rounded-xl text-xs font-bold text-white flex items-center gap-2"
              style={{ background: 'linear-gradient(135deg,#10b981,#059669)', boxShadow: '0 8px 24px rgba(16,185,129,0.4)' }}>
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" /> Live Preview · Updates as you type
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="py-16 px-4 sm:px-6" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map(({ value, label }) => (
            <div key={label} className="text-center">
              <div className="text-4xl font-black text-white mb-1" style={{ background: 'linear-gradient(90deg,#a5b4fc,#818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{value}</div>
              <div className="text-sm text-white/40 font-medium">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="py-24 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#a5b4fc' }}>Why invoice-gen.net</p>
            <h2 className="text-4xl sm:text-5xl font-black text-white mb-4">Everything you need,<br /><span style={{ color: 'rgba(255,255,255,0.4)' }}>nothing you don&apos;t.</span></h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="rounded-2xl p-6 transition-all hover:scale-[1.02]"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', backdropFilter: 'blur(20px)' }}>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4" style={{ background: `${color}20`, border: `1px solid ${color}30` }}>
                  <Icon className="w-5 h-5" style={{ color }} />
                </div>
                <h3 className="text-base font-bold text-white mb-2">{title}</h3>
                <p className="text-sm text-white/45 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="py-24 px-4 sm:px-6" style={{ background: 'rgba(0,0,0,0.2)' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#10b981' }}>Simple Process</p>
            <h2 className="text-4xl sm:text-5xl font-black text-white">Ready in 3 steps</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-px" style={{ background: 'linear-gradient(90deg,transparent,rgba(99,102,241,0.4),transparent)' }} />
            {steps.map(({ n, title, desc }) => (
              <div key={n} className="text-center relative">
                <div className="w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-6" style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(165,180,252,0.2)' }}>
                  <span className="text-3xl font-black" style={{ color: '#6366f1' }}>{n}</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
                <p className="text-sm text-white/45 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link href="/editor"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-white transition-all active:scale-95"
              style={{ background: 'linear-gradient(135deg,#818cf8,#6366f1)', boxShadow: '0 8px 32px rgba(99,102,241,0.4)' }}>
              Start Creating Now <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section id="testimonials" className="py-24 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#a5b4fc' }}>What users say</p>
            <h2 className="text-4xl font-black text-white">Loved by freelancers</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {testimonials.map(({ name, role, stars, text }) => (
              <div key={name} className="rounded-2xl p-6" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)' }}>
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: stars }).map((_, i) => <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)}
                </div>
                <p className="text-sm text-white/60 leading-relaxed mb-5">&ldquo;{text}&rdquo;</p>
                <div>
                  <div className="text-sm font-bold text-white">{name}</div>
                  <div className="text-xs text-white/35">{role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="py-24 px-4 sm:px-6 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at center,rgba(99,102,241,0.15) 0%,transparent 70%)' }} />
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <div className="rounded-3xl p-12" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)' }}>
            <h2 className="text-4xl sm:text-5xl font-black text-white mb-4">Start invoicing<br /><span style={{ color: '#a5b4fc' }}>for free today</span></h2>
            <p className="text-white/45 mb-8">No account. No credit card. Just great invoices.</p>
            <Link href="/editor"
              className="inline-flex items-center gap-2.5 px-10 py-4 rounded-2xl font-bold text-white text-lg transition-all active:scale-95"
              style={{ background: 'linear-gradient(135deg,#818cf8,#6366f1)', boxShadow: '0 8px 40px rgba(99,102,241,0.5)' }}>
              <Zap className="w-5 h-5" /> Create My First Invoice
            </Link>
            <div className="flex flex-wrap items-center justify-center gap-6 mt-8">
              {['Free forever', 'No login needed', 'PDF in seconds', 'Privacy first'].map(f => (
                <span key={f} className="flex items-center gap-1.5 text-sm text-white/40">
                  <Check className="w-4 h-4 text-emerald-500" /> {f}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(0,0,0,0.3)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#818cf8,#6366f1)' }}>
              <FileText className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm text-white/50">invoice-<span style={{ color: '#a5b4fc' }}>gen</span>.net</span>
          </div>
          <p className="text-xs text-white/25">&copy; {new Date().getFullYear()} invoice-gen.net. All rights reserved.</p>
          <div className="flex items-center gap-6 text-xs text-white/35">
            <Link href="/editor" className="hover:text-white/70 transition">Editor</Link>
            <a href="mailto:hello@invoice-gen.net" className="hover:text-white/70 transition">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
