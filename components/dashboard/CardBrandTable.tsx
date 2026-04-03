'use client'

import { brandColor, brandLabel, formatCurrency, formatRate, formatNumber } from '@/lib/utils'
import type { BreakdownData } from '@/types'

interface Props {
  data: BreakdownData
}

function RatePill({ rate }: { rate: number }) {
  const benchmark = 2.9
  if (rate > benchmark + 0.3) return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold fl-metric" style={{ background: 'var(--fl-red-light)', color: 'var(--fl-red)' }}>{formatRate(rate)}</span>
  )
  if (rate > benchmark + 0.1) return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold fl-metric" style={{ background: 'var(--fl-amber-light)', color: 'var(--fl-amber)' }}>{formatRate(rate)}</span>
  )
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold fl-metric" style={{ background: 'var(--fl-green-light)', color: 'var(--fl-green)' }}>{formatRate(rate)}</span>
  )
}

export function CardBrandTable({ data }: Props) {
  const sorted = [...data.byCardBrand].sort((a, b) => b.fees - a.fees)
  const totalFees = sorted.reduce((s, r) => s + r.fees, 0)

  return (
    <div className="fl-card h-full">
      <div className="px-5 pt-5 pb-3">
        <h3 className="text-sm font-semibold" style={{ color: 'var(--fl-text-primary)' }}>By Card Brand</h3>
        <p className="text-xs mt-0.5" style={{ color: 'var(--fl-text-tertiary)' }}>Ranked by fee impact</p>
      </div>

      <div>
        {sorted.map((row) => {
          const pct = totalFees > 0 ? (row.fees / totalFees) * 100 : 0
          return (
            <div key={row.brand} className="px-5 py-3 transition-colors" style={{ borderTop: '1px solid var(--fl-border-subtle)' }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--fl-surface-hover)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: brandColor(row.brand) }} />
                  <span className="text-sm font-medium" style={{ color: 'var(--fl-text-primary)' }}>{brandLabel(row.brand)}</span>
                </div>
                <RatePill rate={row.effectiveRate} />
              </div>

              <div className="h-1 rounded-full overflow-hidden mb-1.5" style={{ background: 'var(--fl-border-subtle)' }}>
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${pct}%`, backgroundColor: brandColor(row.brand), opacity: 0.6 }}
                />
              </div>

              <div className="flex justify-between text-xs fl-metric" style={{ color: 'var(--fl-text-tertiary)' }}>
                <span>{formatCurrency(row.fees)} fees</span>
                <span>{formatNumber(row.transactionCount)} txns</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
