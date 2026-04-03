'use client'

import Link from 'next/link'

export function DemoBanner() {
  return (
    <div className="text-sm px-4 py-2 flex items-center justify-between flex-wrap gap-2" style={{
      background: 'var(--fl-indigo)',
      color: 'rgba(255, 255, 255, 0.85)',
    }}>
      <span>
        <strong className="text-white">Demo mode</strong> — you&apos;re viewing sample data for a fictional company doing $120k/month on Stripe.
      </span>
      <Link
        href="/login"
        className="bg-white/15 hover:bg-white/25 text-white font-semibold text-xs px-3 py-1 rounded-full border border-white/20 transition-colors"
      >
        Connect your Stripe
      </Link>
    </div>
  )
}
