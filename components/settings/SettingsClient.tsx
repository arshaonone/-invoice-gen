'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useSession } from 'next-auth/react'
import toast from 'react-hot-toast'
import { Save, Upload, Palette, Globe, Building, User, CreditCard } from 'lucide-react'
import { CURRENCIES } from '@/lib/utils'

interface Profile {
  name: string; email: string; businessName: string; businessAddress: string
  businessPhone: string; businessEmail: string; logo: string; brandColor: string
  currency: string; language: string; taxRate: number; footerNote: string
}

const fadeUp = { hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0 } }

export default function SettingsClient() {
  const { data: session } = useSession()
  const [profile, setProfile] = useState<Profile>({
    name: '', email: '', businessName: '', businessAddress: '', businessPhone: '',
    businessEmail: '', logo: '', brandColor: '#6366f1', currency: 'USD', language: 'en', taxRate: 0, footerNote: 'Thank you for your business!',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)

  useEffect(() => {
    fetch('/api/user/profile')
      .then(r => r.json())
      .then(data => { setProfile(p => ({ ...p, ...data })); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const set = <K extends keyof Profile>(key: K, val: Profile[K]) => setProfile(p => ({ ...p, [key]: val }))

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => set('logo', reader.result as string)
    reader.readAsDataURL(file)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res  = await fetch('/api/user/profile', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(profile) })
      if (res.ok) toast.success('Settings saved!')
      else toast.error('Save failed')
    } catch { toast.error('Something went wrong') }
    setSaving(false)
  }

  const Section = ({ title, icon: Icon, children }: { title: string; icon: typeof User; children: React.ReactNode }) => (
    <motion.div variants={fadeUp} className="card p-6">
      <div className="flex items-center gap-2 mb-5 pb-4 border-b border-gray-100 dark:border-surface-700">
        <div className="w-8 h-8 rounded-xl bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center">
          <Icon className="w-4 h-4 text-brand-500" />
        </div>
        <h2 className="font-display font-600 text-gray-900 dark:text-white">{title}</h2>
      </div>
      {children}
    </motion.div>
  )

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-3 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" /></div>

  return (
    <motion.div initial="hidden" animate="visible" className="space-y-6 max-w-3xl">
      <motion.div variants={fadeUp} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-700 text-gray-900 dark:text-white">Settings</h1>
          <p className="text-sm text-gray-400 mt-0.5">Manage your account and business profile</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="btn-primary gap-2">
          {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
          Save changes
        </button>
      </motion.div>

      {/* Account */}
      <Section title="Account" icon={User}>
        <div className="grid sm:grid-cols-2 gap-4">
          <div><label className="label">Full Name</label><input value={profile.name} onChange={e => set('name', e.target.value)} className="input" /></div>
          <div><label className="label">Email</label><input value={profile.email} disabled className="input opacity-60 cursor-not-allowed" /></div>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <span className="badge badge-muted">Free plan</span>
          <a href="/pricing" className="text-xs text-brand-500 hover:underline">Upgrade to Pro →</a>
        </div>
      </Section>

      {/* Business */}
      <Section title="Business Profile" icon={Building}>
        <div className="grid sm:grid-cols-2 gap-4">
          <div><label className="label">Business Name</label><input value={profile.businessName} onChange={e => set('businessName', e.target.value)} placeholder="Acme Corp" className="input" /></div>
          <div><label className="label">Business Email</label><input type="email" value={profile.businessEmail} onChange={e => set('businessEmail', e.target.value)} placeholder="billing@acme.com" className="input" /></div>
          <div><label className="label">Phone</label><input value={profile.businessPhone} onChange={e => set('businessPhone', e.target.value)} placeholder="+1 555 000 0000" className="input" /></div>
          <div><label className="label">Default Tax Rate (%)</label><input type="number" min="0" max="100" value={profile.taxRate} onChange={e => set('taxRate', parseFloat(e.target.value) || 0)} className="input" /></div>
          <div className="sm:col-span-2"><label className="label">Address</label><textarea value={profile.businessAddress} onChange={e => set('businessAddress', e.target.value)} rows={2} placeholder="123 Main St, City, Country" className="input resize-none" /></div>
        </div>

        {/* Logo upload */}
        <div className="mt-4">
          <label className="label">Business Logo</label>
          <div className="flex items-center gap-4">
            {profile.logo ? (
              <div className="flex items-center gap-3">
                <img src={profile.logo} alt="Logo" className="h-14 object-contain rounded-xl border border-gray-200 dark:border-surface-600 p-2 bg-white" />
                <button onClick={() => set('logo', '')} className="text-xs text-red-500 hover:text-red-600">Remove</button>
              </div>
            ) : (
              <div className="w-14 h-14 rounded-xl border-2 border-dashed border-gray-200 dark:border-surface-600 flex items-center justify-center text-gray-300 dark:text-gray-600">
                <Upload className="w-5 h-5" />
              </div>
            )}
            <label className="btn-secondary text-sm cursor-pointer">
              <Upload className="w-4 h-4" /> Upload logo
              <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
            </label>
          </div>
        </div>
      </Section>

      {/* Branding */}
      <Section title="Branding & Preferences" icon={Palette}>
        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className="label">Brand Color</label>
            <div className="flex items-center gap-3">
              <input type="color" value={profile.brandColor} onChange={e => set('brandColor', e.target.value)} className="w-12 h-10 rounded-xl border border-gray-200 dark:border-surface-600 cursor-pointer bg-transparent" />
              <input value={profile.brandColor} onChange={e => set('brandColor', e.target.value)} placeholder="#6366f1" className="input flex-1" />
            </div>
          </div>
          <div>
            <label className="label">Default Currency</label>
            <select value={profile.currency} onChange={e => set('currency', e.target.value)} className="input">
              {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.code} — {c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Language</label>
            <select value={profile.language} onChange={e => set('language', e.target.value)} className="input">
              <option value="en">English</option>
              <option value="bn">বাংলা (Bangla)</option>
            </select>
          </div>
        </div>
        <div className="mt-4">
          <label className="label">Default Footer Note</label>
          <textarea value={profile.footerNote} onChange={e => set('footerNote', e.target.value)} rows={2} placeholder="Thank you for your business!" className="input resize-none" />
        </div>
      </Section>

      {/* Plan */}
      <Section title="Subscription" icon={CreditCard}>
        <div className="flex items-center justify-between p-4 rounded-xl bg-brand-50 dark:bg-brand-900/10 border border-brand-200 dark:border-brand-800">
          <div>
            <div className="font-semibold text-gray-900 dark:text-white">Free Plan</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">5 invoices per month · 1 template</div>
          </div>
          <a href="/pricing" className="btn-primary text-sm">Upgrade to Pro</a>
        </div>
      </Section>
    </motion.div>
  )
}
