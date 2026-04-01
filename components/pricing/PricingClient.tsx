'use client'

import { motion } from 'framer-motion'
import { CheckCircle, Zap, Sparkles } from 'lucide-react'

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }
const stagger = { visible: { transition: { staggerChildren: 0.1 } } }

const FREE_FEATURES = [
  '5 invoices per month',
  '1 template (Minimal)',
  'PDF export & print',
  'Multi-currency (14+ currencies)',
  'English & Bangla support',
  'Invoice history',
]

const PRO_FEATURES = [
  'Unlimited invoices',
  'All 3 templates (Minimal, Modern, Bold)',
  'PDF export & email sending',
  'Revenue analytics dashboard',
  'Custom brand color & logo',
  'Client portal (coming soon)',
  'Multi-business support',
  'Priority support',
  'Everything in Free',
]

export default function PricingClient() {
  return (
    <motion.div initial="hidden" animate="visible" variants={stagger} className="max-w-4xl mx-auto py-8">
      <motion.div variants={fadeUp} className="text-center mb-12">
        <h1 className="text-3xl font-display font-800 text-gray-900 dark:text-white mb-3">Simple, honest pricing</h1>
        <p className="text-gray-500 dark:text-gray-400">No hidden fees. Cancel anytime.</p>
      </motion.div>

      <motion.div variants={stagger} className="grid md:grid-cols-2 gap-6">
        {/* Free */}
        <motion.div variants={fadeUp} className="card p-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-xl bg-gray-50 dark:bg-surface-700 flex items-center justify-center">
              <Zap className="w-4 h-4 text-gray-500" />
            </div>
            <span className="font-display font-600 text-gray-900 dark:text-white">Free</span>
          </div>
          <div className="text-4xl font-display font-800 text-gray-900 dark:text-white mb-1">$0</div>
          <div className="text-sm text-gray-400 mb-8">Forever free · No card needed</div>
          <ul className="space-y-3 mb-8">
            {FREE_FEATURES.map(f => (
              <li key={f} className="flex items-start gap-2.5 text-sm text-gray-600 dark:text-gray-400">
                <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" /> {f}
              </li>
            ))}
          </ul>
          <div className="btn-secondary w-full justify-center cursor-default text-gray-400">Current plan</div>
        </motion.div>

        {/* Pro */}
        <motion.div variants={fadeUp} className="gradient-border rounded-2xl p-8 bg-white dark:bg-surface-800 relative overflow-hidden shadow-glow">
          <div className="absolute -top-1 -right-1">
            <div className="bg-gradient-to-r from-brand-500 to-violet-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl">Most Popular</div>
          </div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-xl bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-brand-500" />
            </div>
            <span className="font-display font-600 text-gray-900 dark:text-white">Pro</span>
          </div>
          <div className="text-4xl font-display font-800 text-gray-900 dark:text-white mb-1">$12<span className="text-xl font-normal text-gray-400">/mo</span></div>
          <div className="text-sm text-gray-400 mb-8">Billed monthly · Cancel anytime</div>
          <ul className="space-y-3 mb-8">
            {PRO_FEATURES.map(f => (
              <li key={f} className="flex items-start gap-2.5 text-sm text-gray-600 dark:text-gray-400">
                <CheckCircle className="w-4 h-4 text-brand-500 flex-shrink-0 mt-0.5" /> {f}
              </li>
            ))}
          </ul>
          <button className="btn-primary w-full justify-center">
            Upgrade to Pro — $12/mo
          </button>
          <p className="text-center text-xs text-gray-400 mt-3">7-day free trial · No credit card required</p>
        </motion.div>
      </motion.div>

      {/* FAQ */}
      <motion.div variants={fadeUp} className="mt-16">
        <h2 className="text-xl font-display font-700 text-gray-900 dark:text-white mb-6 text-center">Frequently asked questions</h2>
        <div className="space-y-4">
          {[
            { q: 'Can I use the free plan forever?', a: 'Yes! The free plan never expires. You can create up to 5 invoices per month forever.' },
            { q: 'Do I need a credit card to start?', a: 'No. The free plan requires no payment info at all.' },
            { q: 'What happens when I hit the free limit?', a: 'You\'ll receive a notification and can either wait for the next month or upgrade to Pro for unlimited invoices.' },
            { q: 'Can I cancel my Pro subscription?', a: 'Absolutely. Cancel anytime from your settings. You\'ll keep Pro access until your billing period ends.' },
          ].map(({ q, a }) => (
            <div key={q} className="card p-5">
              <div className="font-semibold text-gray-900 dark:text-white mb-1 text-sm">{q}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">{a}</div>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}
