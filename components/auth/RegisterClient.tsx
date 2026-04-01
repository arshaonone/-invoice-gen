'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { FileCheck, User, Mail, Lock, Building, ArrowRight, Eye, EyeOff } from 'lucide-react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import ThemeToggle from '@/components/ui/ThemeToggle'

interface FormData { name: string; email: string; password: string; businessName?: string }

export default function RegisterClient() {
  const router = useRouter()
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>()

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (!res.ok) { toast.error(json.error); setLoading(false); return }

      const result = await signIn('credentials', { redirect: false, email: data.email, password: data.password })
      if (result?.error) { toast.error('Sign in failed after registration'); setLoading(false); return }

      toast.success('Account created! Welcome 🎉')
      router.push('/dashboard')
    } catch {
      toast.error('Something went wrong')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 mesh-bg-light dark:mesh-bg">
      <div className="absolute top-4 right-4"><ThemeToggle /></div>

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-brand-500 to-violet-500 flex items-center justify-center shadow-glow">
              <FileCheck className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-700 text-gray-900 dark:text-white text-xl">invoice-gen<span className="text-brand-500">.net</span></span>
          </Link>
          <h1 className="text-2xl font-display font-700 text-gray-900 dark:text-white">Create your account</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">Free forever. No credit card needed.</p>
        </div>

        <div className="card p-8 shadow-xl dark:shadow-black/30">
          <button
            onClick={() => { setGoogleLoading(true); signIn('google', { callbackUrl: '/dashboard' }) }}
            disabled={googleLoading}
            id="google-register-btn"
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-200 dark:border-surface-600 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-surface-700 transition-all mb-6 disabled:opacity-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            {googleLoading ? 'Redirecting...' : 'Continue with Google'}
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-gray-100 dark:bg-surface-600" />
            <span className="text-xs text-gray-400">or register with email</span>
            <div className="flex-1 h-px bg-gray-100 dark:bg-surface-600" />
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="label" htmlFor="name">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input {...register('name', { required: 'Name is required' })} id="name" placeholder="Jane Smith" className="input pl-10" />
              </div>
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label className="label" htmlFor="reg-email">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input {...register('email', { required: 'Email is required', pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email' } })} type="email" id="reg-email" placeholder="you@company.com" className="input pl-10" />
              </div>
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="label" htmlFor="business">Business Name <span className="text-gray-400 normal-case">(optional)</span></label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input {...register('businessName')} id="business" placeholder="Acme Inc." className="input pl-10" />
              </div>
            </div>

            <div>
              <label className="label" htmlFor="reg-password">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Min 6 characters' } })} type={showPwd ? 'text' : 'password'} id="reg-password" placeholder="••••••••" className="input pl-10 pr-10" />
                <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
            </div>

            <button type="submit" id="register-submit" disabled={loading} className="btn-primary w-full justify-center mt-2">
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <><span>Create account</span><ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-brand-500 hover:text-brand-600 font-semibold">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
