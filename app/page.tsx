'use client'

import Link from 'next/link'
import { ArrowRight, TrendingDown, Zap, Shield, BarChart2 } from 'lucide-react'
import { ThemeToggle } from '@/components/ThemeToggle'

const stats = [
  { value: '0.34%', label: 'avg excess rate paid' },
  { value: '$1,800', label: 'avg monthly savings found' },
  { value: '2 min', label: 'to connect & analyze' },
]

const features = [
  {
    icon: BarChart2,
    title: 'True effective rate',
    desc: 'See your real blended rate broken down by card brand, payment method, and geography — not Stripe\'s nominal 2.9%.',
  },
  {
    icon: TrendingDown,
    title: 'Fee leakage detector',
    desc: 'Surface hidden costs: refund fee retention, international surcharges, won-dispute fees ($15 each), and Amex premiums.',
  },
  {
    icon: Zap,
    title: 'AI-powered optimizer',
    desc: 'Our AI analyzes your actual fee breakdown and gives specific recommendations with estimated monthly savings.',
  },
  {
    icon: Shield,
    title: 'Read-only, secure',
    desc: 'Restricted Stripe key, AES-256 encrypted at rest. We never access your payouts or customer data.',
  },
]

export default function HomePage() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--fl-bg)' }}>
      {/* Nav */}
      <nav className="fl-glass sticky top-0 z-10 px-6 h-14 flex items-center justify-between max-w-7xl mx-auto" style={{ borderBottom: '1px solid var(--fl-border)' }}>
        <span className="text-lg font-bold tracking-tight" style={{ color: 'var(--fl-text-primary)' }}>FeeLens</span>
        <div className="flex items-center gap-3">
          <Link href="/demo" className="text-sm font-medium transition-colors" style={{ color: 'var(--fl-text-tertiary)' }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--fl-text-primary)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--fl-text-tertiary)'}
          >
            View demo
          </Link>
          <ThemeToggle />
          <Link
            href="/login"
            className="text-sm px-4 py-2 rounded-lg font-medium transition-colors"
            style={{ background: 'var(--fl-indigo)', color: '#FFFFFF' }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--fl-indigo-hover)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'var(--fl-indigo)'}
          >
            Connect Stripe
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <div className="max-w-3xl mx-auto px-6 pt-20 pb-14 text-center">
        <div className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full mb-8" style={{
          background: 'var(--fl-red-light)',
          color: 'var(--fl-red)',
          border: '1px solid var(--fl-red)',
          borderColor: 'rgba(239, 68, 68, 0.15)',
        }}>
          <TrendingDown className="w-3 h-3" />
          Most Stripe startups overpay by 0.3-0.5% without knowing it
        </div>

        <h1 className="text-4xl sm:text-[52px] font-bold leading-[1.1] tracking-tight mb-5" style={{ color: 'var(--fl-text-primary)' }}>
          Know exactly what<br />
          <span style={{ color: 'var(--fl-indigo)' }}>Stripe is charging you</span>
        </h1>

        <p className="text-lg max-w-xl mx-auto mb-8 leading-relaxed" style={{ color: 'var(--fl-text-secondary)' }}>
          FeeLens breaks down your true Stripe fees by card brand, geography, and payment method.
          Then tells you exactly how to reduce them.
        </p>

        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Link
            href="/demo"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors shadow-sm"
            style={{ background: 'var(--fl-indigo)', color: '#FFFFFF' }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--fl-indigo-hover)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'var(--fl-indigo)'}
          >
            See live demo
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/login"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors"
            style={{ border: '1px solid var(--fl-border)', color: 'var(--fl-text-secondary)' }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--fl-surface-hover)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            Connect your Stripe
          </Link>
        </div>

        <p className="mt-3 text-xs" style={{ color: 'var(--fl-text-tertiary)' }}>
          Read-only · No payout access · Free
        </p>
      </div>

      {/* Stats bar */}
      <div style={{ borderTop: '1px solid var(--fl-border)', borderBottom: '1px solid var(--fl-border)', background: 'var(--fl-surface)' }}>
        <div className="max-w-3xl mx-auto px-6 py-5 flex justify-center gap-8 sm:gap-12 flex-wrap">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-2xl font-bold tracking-tight fl-metric" style={{ color: 'var(--fl-text-primary)' }}>{s.value}</div>
              <div className="text-xs mt-0.5" style={{ color: 'var(--fl-text-tertiary)' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {features.map((f) => (
            <div key={f.title} className="fl-card rounded-2xl p-6 transition-all hover:shadow-md">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-4" style={{ background: 'var(--fl-indigo-light)' }}>
                <f.icon className="w-4.5 h-4.5" style={{ color: 'var(--fl-indigo)' }} />
              </div>
              <h3 className="font-semibold mb-1.5 text-sm" style={{ color: 'var(--fl-text-primary)' }}>{f.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--fl-text-secondary)' }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="max-w-4xl mx-auto px-6 pb-20">
        <div className="rounded-2xl p-8 text-center" style={{ background: 'var(--fl-indigo)' }}>
          <h2 className="text-xl font-bold text-white mb-2">Ready to see what Stripe is really charging you?</h2>
          <p className="text-sm mb-5" style={{ color: 'rgba(255,255,255,0.7)' }}>Connect your Stripe account in 2 minutes. Read-only access, no credit card required.</p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link href="/demo" className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors">
              View demo first
            </Link>
            <Link href="/login" className="bg-white hover:bg-white/90 px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors" style={{ color: 'var(--fl-indigo)' }}>
              Connect Stripe
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 text-center text-xs" style={{ color: 'var(--fl-text-tertiary)', borderTop: '1px solid var(--fl-border)' }}>
        Built for YC startups who want to stop overpaying Stripe.
      </footer>
    </div>
  )
}
