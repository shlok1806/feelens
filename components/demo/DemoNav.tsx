'use client'

import { ThemeToggle } from '@/components/ThemeToggle'

export function DemoNav() {
  return (
    <header className="sticky top-0 z-10 fl-glass" style={{ borderBottom: '1px solid var(--fl-border)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <span className="text-lg font-bold tracking-tight flex-shrink-0" style={{ color: 'var(--fl-text-primary)' }}>FeeLens</span>
          <span className="w-px h-4 hidden sm:block" style={{ background: 'var(--fl-border)' }} />
          <span className="text-sm hidden sm:block truncate" style={{ color: 'var(--fl-text-tertiary)' }}>Acme Payments</span>
          <span className="text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0" style={{ background: 'var(--fl-amber-light)', color: 'var(--fl-amber)', border: '1px solid rgba(245,158,11,0.2)' }}>Demo</span>
        </div>
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="items-center gap-3 text-xs hidden sm:flex" style={{ color: 'var(--fl-text-tertiary)' }}>
            <span>March 2026</span>
            <span style={{ color: 'var(--fl-border)' }}>·</span>
            <span>Stripe Test Account</span>
          </div>
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
