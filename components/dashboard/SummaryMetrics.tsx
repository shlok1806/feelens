'use client'

import { TrendingUp, TrendingDown, DollarSign, Activity, AlertCircle } from 'lucide-react'
import { formatCurrency, formatRate, formatNumber } from '@/lib/utils'
import type { SummaryData } from '@/types'

interface Props {
  data: SummaryData
}

function MetricCard({
  label,
  value,
  sub,
  icon,
  variant = 'default',
}: {
  label: string
  value: React.ReactNode
  sub?: React.ReactNode
  icon?: React.ReactNode
  variant?: 'default' | 'danger'
}) {
  const bg = variant === 'danger' ? 'var(--fl-red-light)' : 'var(--fl-surface)'
  const borderColor = variant === 'danger' ? 'rgba(239,68,68,0.15)' : 'var(--fl-border)'
  const labelColor = variant === 'danger' ? 'var(--fl-red)' : 'var(--fl-text-tertiary)'

  return (
    <div className="rounded-2xl p-5 transition-all duration-200 hover:shadow-md" style={{ background: bg, border: `1px solid ${borderColor}`, boxShadow: 'var(--fl-shadow-sm)' }}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: labelColor }}>{label}</span>
        {icon && <span style={{ color: 'var(--fl-text-tertiary)', opacity: 0.5 }}>{icon}</span>}
      </div>
      <div className="fl-metric">{value}</div>
      {sub && <div className="mt-2 text-xs" style={{ color: 'var(--fl-text-tertiary)' }}>{sub}</div>}
    </div>
  )
}

export function SummaryMetrics({ data }: Props) {
  const { effectiveRate, totalFees, totalVolume, transactionCount, industryBenchmark, trendVsPriorMonth } = data
  const delta = effectiveRate - industryBenchmark
  const excessFeesPerMonth = Math.round((delta / 100) * totalVolume)
  const isTrendingWorse = trendVsPriorMonth > 0

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

      {/* Hero: Effective Rate */}
      <div className="col-span-2 lg:col-span-1 rounded-2xl p-5 transition-all duration-200" style={{ background: 'var(--fl-surface)', border: '1px solid var(--fl-border)', boxShadow: 'var(--fl-shadow-sm)' }}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: 'var(--fl-text-tertiary)' }}>Effective Rate</span>
          <Activity className="w-3.5 h-3.5" style={{ color: 'var(--fl-text-tertiary)', opacity: 0.5 }} />
        </div>
        <div className="fl-metric text-4xl font-bold leading-none" style={{ color: 'var(--fl-red)' }}>{formatRate(effectiveRate)}</div>
        <div className="mt-2 flex items-center gap-2 text-xs flex-wrap">
          <span style={{ color: 'var(--fl-text-tertiary)' }}>Industry avg <span className="font-semibold" style={{ color: 'var(--fl-text-secondary)' }}>{formatRate(industryBenchmark)}</span></span>
          <span className="flex items-center gap-0.5 font-semibold" style={{ color: isTrendingWorse ? 'var(--fl-red)' : 'var(--fl-green)' }}>
            {isTrendingWorse ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {isTrendingWorse ? '+' : ''}{formatRate(Math.abs(trendVsPriorMonth))}
          </span>
        </div>
      </div>

      {/* Fees Paid */}
      <MetricCard
        label="Fees Paid"
        icon={<DollarSign className="w-3.5 h-3.5" />}
        value={<span className="text-3xl font-bold" style={{ color: 'var(--fl-text-primary)' }}>{formatCurrency(totalFees)}</span>}
        sub="this month"
      />

      {/* Volume */}
      <MetricCard
        label="Volume"
        icon={<TrendingUp className="w-3.5 h-3.5" />}
        value={<span className="text-3xl font-bold" style={{ color: 'var(--fl-text-primary)' }}>{formatCurrency(totalVolume)}</span>}
        sub={<>{formatNumber(transactionCount)} transactions</>}
      />

      {/* Overpaying */}
      <MetricCard
        label="Overpaying by"
        variant="danger"
        icon={<AlertCircle className="w-3.5 h-3.5" />}
        value={<span className="text-3xl font-bold" style={{ color: 'var(--fl-red)' }}>+{formatRate(delta)}</span>}
        sub={<span style={{ color: 'var(--fl-red)', opacity: 0.7 }}>{formatCurrency(excessFeesPerMonth)} excess fees/mo</span>}
      />
    </div>
  )
}
