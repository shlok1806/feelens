'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ThemeToggle } from '@/components/ThemeToggle'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    const supabase = createClient()

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) setError(error.message)
      else setSuccess('Check your email to confirm your account.')
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message)
      else router.push('/dashboard')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--fl-bg)' }}>
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold" style={{ color: 'var(--fl-text-primary)' }}>FeeLens</Link>
          <p className="text-sm mt-2" style={{ color: 'var(--fl-text-secondary)' }}>
            {isSignUp ? 'Create an account to connect your Stripe' : 'Sign in to your account'}
          </p>
        </div>

        <div className="fl-card rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--fl-text-primary)' }}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2"
                style={{
                  background: 'var(--fl-surface-hover)',
                  border: '1px solid var(--fl-border)',
                  color: 'var(--fl-text-primary)',
                  // @ts-expect-error -- CSS custom property for focus ring
                  '--tw-ring-color': 'var(--fl-indigo)',
                }}
                placeholder="you@startup.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--fl-text-primary)' }}>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2"
                style={{
                  background: 'var(--fl-surface-hover)',
                  border: '1px solid var(--fl-border)',
                  color: 'var(--fl-text-primary)',
                  // @ts-expect-error -- CSS custom property for focus ring
                  '--tw-ring-color': 'var(--fl-indigo)',
                }}
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="text-xs px-3 py-2 rounded-lg" style={{ background: 'var(--fl-red-light)', color: 'var(--fl-red)' }}>
                {error}
              </div>
            )}
            {success && (
              <div className="text-xs px-3 py-2 rounded-lg" style={{ background: 'var(--fl-green-light)', color: 'var(--fl-green)' }}>
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg font-semibold text-sm transition-colors disabled:opacity-50"
              style={{ background: 'var(--fl-indigo)', color: '#FFFFFF' }}
              onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = 'var(--fl-indigo-hover)' }}
              onMouseLeave={(e) => e.currentTarget.style.background = 'var(--fl-indigo)'}
            >
              {loading ? 'Loading...' : isSignUp ? 'Create account' : 'Sign in'}
            </button>
          </form>

          <div className="mt-4 text-center">
            <button
              onClick={() => { setIsSignUp((s) => !s); setError(null); setSuccess(null) }}
              className="text-sm transition-colors"
              style={{ color: 'var(--fl-text-tertiary)' }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--fl-indigo)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--fl-text-tertiary)'}
            >
              {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link href="/demo" className="text-xs transition-colors" style={{ color: 'var(--fl-text-tertiary)' }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--fl-text-secondary)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--fl-text-tertiary)'}
          >
            Try the demo first
          </Link>
        </div>
      </div>
    </div>
  )
}
