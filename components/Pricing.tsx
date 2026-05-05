'use client'

import { useState } from 'react'
import { Check, Zap, Shield, Crown, X, ArrowRight, Sparkles } from 'lucide-react'

interface PricingTier {
  id: string
  name: string
  price: { monthly: number; yearly: number }
  badge?: string
  description: string
  icon: React.ReactNode
  color: string
  bgGradient: string
  borderColor: string
  popular?: boolean
  features: string[]
  notIncluded?: string[]
  cta: string
}

const tiers: PricingTier[] = [
  {
    id: 'free',
    name: 'Free',
    price: { monthly: 0, yearly: 0 },
    description: 'Perfect for freelancers just getting started.',
    icon: <Zap className="w-5 h-5" />,
    color: 'text-slate-600',
    bgGradient: 'from-slate-50 to-white',
    borderColor: 'border-slate-200',
    features: [
      'Unlimited invoice generation',
      'PDF download',
      'Basic invoice templates',
      'Logo upload',
      'Multi-currency support',
      'Browser local storage',
    ],
    notIncluded: [
      'Cloud save & sync',
      'Client portal',
      'Stripe payment links',
      'Analytics dashboard',
      'Priority support',
    ],
    cta: 'Get Started Free',
  },
  {
    id: 'pro',
    name: 'Pro',
    price: { monthly: 9, yearly: 7 },
    badge: 'Most Popular',
    description: 'For growing freelancers and small teams.',
    icon: <Shield className="w-5 h-5" />,
    color: 'text-indigo-600',
    bgGradient: 'from-indigo-50 to-white',
    borderColor: 'border-indigo-400',
    popular: true,
    features: [
      'Everything in Free',
      'Cloud save & sync',
      'Up to 50 invoices/month',
      'Stripe payment links',
      '3 premium invoice templates',
      'Client management',
      'Invoice history dashboard',
      'Email invoice delivery',
      'Priority email support',
    ],
    cta: 'Start Pro Trial',
  },
  {
    id: 'business',
    name: 'Business',
    price: { monthly: 29, yearly: 22 },
    badge: 'Best Value',
    description: 'For agencies and established businesses.',
    icon: <Crown className="w-5 h-5" />,
    color: 'text-amber-600',
    bgGradient: 'from-amber-50 to-white',
    borderColor: 'border-amber-400',
    features: [
      'Everything in Pro',
      'Unlimited invoices',
      'Multiple team members',
      'Custom branding & domain',
      'All premium templates',
      'Advanced analytics',
      'Recurring invoices',
      'API access',
      'Dedicated account manager',
      'Phone & chat support',
    ],
    cta: 'Start Business Trial',
  },
]

const faqs = [
  {
    q: 'Can I cancel anytime?',
    a: 'Yes, you can cancel your subscription at any time. Your plan remains active until the end of your billing period.'
  },
  {
    q: 'Is there a free trial?',
    a: 'Yes! Pro and Business plans come with a 14-day free trial. No credit card required to start.'
  },
  {
    q: 'Do you store my invoice data?',
    a: 'Free plan stores data only in your local browser. Pro and Business plans securely save everything to our cloud database.'
  },
  {
    q: 'How does Stripe payment work?',
    a: 'Pro/Business users can add a "Pay Now" button to invoices. Your clients click it and pay securely via Stripe. Funds go directly to your connected Stripe account.'
  },
]

interface PricingProps {
  onClose?: () => void
  compact?: boolean
}

export default function Pricing({ onClose, compact = false }: PricingProps) {
  const [isYearly, setIsYearly] = useState(false)
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)

  return (
    <div className={compact ? '' : 'min-h-screen bg-[#F8FAFC]'}>
      {/* Header */}
      <div className={`relative overflow-hidden ${compact ? 'pt-6 pb-8' : 'pt-16 pb-12'} px-4`}>
        {/* Background decoration */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-indigo-100/60 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          {!compact && (
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 border border-indigo-200 rounded-full text-xs font-semibold text-indigo-700 mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              Simple, Transparent Pricing
            </div>
          )}
          <h2 className={`font-black text-gray-900 mb-3 ${compact ? 'text-2xl sm:text-3xl' : 'text-3xl sm:text-4xl lg:text-5xl'}`}>
            Choose the plan that&apos;s{' '}
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              right for you
            </span>
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto mb-8 text-sm sm:text-base">
            Start free. Upgrade when you need more power. All plans include unlimited PDF downloads.
          </p>

          {/* Billing toggle */}
          <div className="inline-flex items-center gap-3 bg-white border border-gray-200 rounded-2xl p-1.5 shadow-sm">
            <button
              onClick={() => setIsYearly(false)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                !isYearly
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsYearly(true)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
                isYearly
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Yearly
              <span className="text-[10px] font-bold bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">
                Save 22%
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-6xl mx-auto px-4 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
          {tiers.map((tier) => (
            <div
              key={tier.id}
              className={`relative bg-white rounded-2xl border-2 ${tier.borderColor} p-6 flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                tier.popular ? 'shadow-2xl shadow-indigo-200 ring-2 ring-indigo-500/30' : 'shadow-sm'
              }`}
            >
              {/* Popular badge */}
              {tier.badge && (
                <div
                  className={`absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold text-white shadow-md ${
                    tier.popular ? 'bg-indigo-600' : 'bg-amber-500'
                  }`}
                >
                  ✦ {tier.badge}
                </div>
              )}

              {/* Icon + Name */}
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    tier.popular
                      ? 'bg-indigo-100 text-indigo-600'
                      : tier.id === 'business'
                      ? 'bg-amber-100 text-amber-600'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {tier.icon}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">{tier.name}</h3>
                  <p className="text-xs text-gray-400">{tier.description}</p>
                </div>
              </div>

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-gray-900">
                    ${isYearly ? tier.price.yearly : tier.price.monthly}
                  </span>
                  {tier.price.monthly > 0 && (
                    <span className="text-gray-400 text-sm font-medium">/month</span>
                  )}
                </div>
                {isYearly && tier.price.monthly > 0 && (
                  <p className="text-xs text-green-600 font-semibold mt-1">
                    Billed ${tier.price.yearly * 12}/year · Save ${(tier.price.monthly - tier.price.yearly) * 12}/year
                  </p>
                )}
                {tier.price.monthly === 0 && (
                  <p className="text-xs text-gray-400 mt-1">Free forever, no card needed</p>
                )}
              </div>

              {/* CTA Button */}
              <button
                className={`w-full py-3 rounded-xl text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2 mb-6 active:scale-95 ${
                  tier.popular
                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 hover:shadow-indigo-300'
                    : tier.id === 'business'
                    ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-100'
                    : 'bg-gray-900 hover:bg-gray-800 text-white'
                }`}
              >
                {tier.cta} <ArrowRight className="w-4 h-4" />
              </button>

              {/* Divider */}
              <div className="border-t border-gray-100 mb-5" />

              {/* Features */}
              <div className="flex-1 space-y-3">
                {tier.features.map((f, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-sm text-gray-700">
                    <div className={`mt-0.5 w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                      tier.popular ? 'bg-indigo-100' : tier.id === 'business' ? 'bg-amber-100' : 'bg-slate-100'
                    }`}>
                      <Check className={`w-2.5 h-2.5 ${tier.popular ? 'text-indigo-600' : tier.id === 'business' ? 'text-amber-600' : 'text-slate-600'}`} />
                    </div>
                    {f}
                  </div>
                ))}

                {/* Not included */}
                {tier.notIncluded?.map((f, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-sm text-gray-300">
                    <div className="mt-0.5 w-4 h-4 rounded-full flex items-center justify-center shrink-0 bg-gray-50">
                      <X className="w-2.5 h-2.5 text-gray-300" />
                    </div>
                    {f}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Trust Row */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm text-gray-400">
          {['No credit card required', '14-day free trial', 'Cancel anytime', 'Secure payments via Stripe'].map((item) => (
            <div key={item} className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" />
              {item}
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        {!compact && (
          <div className="mt-20 max-w-2xl mx-auto">
            <h3 className="text-2xl font-black text-gray-900 text-center mb-8">Frequently Asked Questions</h3>
            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <div
                  key={i}
                  className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm"
                >
                  <button
                    onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                    className="w-full flex items-center justify-between px-6 py-4 text-left"
                  >
                    <span className="font-semibold text-gray-900 text-sm">{faq.q}</span>
                    <span className={`text-gray-400 text-lg transition-transform duration-200 ${expandedFaq === i ? 'rotate-45' : ''}`}>+</span>
                  </button>
                  {expandedFaq === i && (
                    <div className="px-6 pb-5 text-sm text-gray-500 leading-relaxed border-t border-gray-50">
                      <div className="pt-3">{faq.a}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
