'use client'

import { Globe, CreditCard, RotateCcw, AlertTriangle, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { formatCurrency, formatRate } from '@/lib/utils'
import type { LeakageData } from '@/types'

interface LeakageItem {
  icon: React.ReactNode
  title: string
  amount: number
  tagline: string
  detail: string
  iconBg: string
}

function LeakageRow({ item }: { item: LeakageItem }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="group">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-4 py-3 text-left rounded-xl px-3 -mx-3 transition-all duration-150"
        style={{ background: open ? 'var(--fl-surface-hover)' : 'transparent' }}
        onMouseEnter={(e) => { if (!open) e.currentTarget.style.background = 'var(--fl-surface-hover)' }}
        onMouseLeave={(e) => { if (!open) e.currentTarget.style.background = 'transparent' }}
      >
        <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: item.iconBg }}>
          {item.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium" style={{ color: 'var(--fl-text-primary)' }}>{item.title}</div>
          <div className="text-xs mt-0.5" style={{ color: 'var(--fl-text-tertiary)' }}>{item.tagline}</div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-base font-bold fl-metric" style={{ color: 'var(--fl-red)' }}>{formatCurrency(item.amount)}<span className="text-xs font-normal" style={{ color: 'var(--fl-red)', opacity: 0.5 }}>/mo</span></span>
          <ChevronRight className={`w-4 h-4 transition-transform duration-200 ${open ? 'rotate-90' : ''}`} style={{ color: 'var(--fl-text-tertiary)' }} />
        </div>
      </button>

      <div className={`overflow-hidden transition-all duration-200 ${open ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="mx-3 mb-2 text-xs leading-relaxed p-3 rounded-xl" style={{ background: 'var(--fl-surface-hover)', color: 'var(--fl-text-secondary)', border: '1px solid var(--fl-border-subtle)' }}>
          {item.detail}
        </div>
      </div>
    </div>
  )
}

interface Props {
  data: LeakageData
}

export function LeakageList({ data }: Props) {
  const totalLeakage =
    data.refundLeakage.total +
    data.disputeLeakage.total +
    data.internationalSurcharge.total +
    data.amexPremium.total

  const items: LeakageItem[] = [
    {
      icon: <Globe className="w-4 h-4" style={{ color: 'var(--fl-amber)' }} />,
      title: 'International surcharge',
      amount: data.internationalSurcharge.total,
      tagline: `Stripe adds 1.5% for non-US cards · ${formatRate(data.internationalSurcharge.asPercentOfInternational)} of volume`,
      detail: `International volume x 1.5% surcharge = ${formatCurrency(data.internationalSurcharge.total)}/month in fees above your base rate.`,
      iconBg: 'var(--fl-amber-light)',
    },
    {
      icon: <CreditCard className="w-4 h-4" style={{ color: '#8B5CF6' }} />,
      title: 'Amex premium',
      amount: data.amexPremium.total,
      tagline: `Amex charges ~3.5% vs Visa 2.9% · 60bps hidden premium`,
      detail: `Amex volume x (3.5% - 2.9%) = ${formatCurrency(data.amexPremium.total)}/month in excess fees vs if the same spend were on Visa.`,
      iconBg: 'var(--fl-purple-light)',
    },
    {
      icon: <RotateCcw className="w-4 h-4" style={{ color: '#3B82F6' }} />,
      title: 'Refund fee retention',
      amount: data.refundLeakage.total,
      tagline: `${data.refundLeakage.count} refunds · Stripe keeps the processing fee`,
      detail: `${data.refundLeakage.count} refunds x avg ${formatCurrency(data.refundLeakage.avgPerRefund)} = ${formatCurrency(data.refundLeakage.total)}/month lost.`,
      iconBg: 'var(--fl-blue-light)',
    },
    {
      icon: <AlertTriangle className="w-4 h-4" style={{ color: 'var(--fl-red)' }} />,
      title: 'Dispute fees (won cases)',
      amount: data.disputeLeakage.total,
      tagline: `${data.disputeLeakage.count} disputes · $15 fee regardless of outcome`,
      detail: `Won disputes: ${formatCurrency(data.disputeLeakage.won)} in avoidable fees. Lost: ${formatCurrency(data.disputeLeakage.lost)}.`,
      iconBg: 'var(--fl-red-light)',
    },
  ].sort((a, b) => b.amount - a.amount)

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold" style={{ color: 'var(--fl-text-primary)' }}>Fee Leakage</h3>
          <p className="text-xs mt-0.5" style={{ color: 'var(--fl-text-tertiary)' }}>Hidden costs beyond Stripe&apos;s nominal rate</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold fl-metric" style={{ color: 'var(--fl-red)' }}>{formatCurrency(totalLeakage)}</div>
          <div className="text-xs mt-0.5" style={{ color: 'var(--fl-red)', opacity: 0.6 }}>total/month</div>
        </div>
      </div>

      <div className="h-1.5 rounded-full overflow-hidden mb-5 flex gap-0.5" style={{ background: 'var(--fl-border-subtle)' }}>
        {items.map((item) => (
          <div key={item.title} className="h-full rounded-full" style={{ width: `${(item.amount / totalLeakage) * 100}%`, backgroundColor: 'var(--fl-red)', opacity: 0.25 + (item.amount / totalLeakage) * 0.75 }} />
        ))}
      </div>

      <div>
        {items.map((item) => (
          <LeakageRow key={item.title} item={item} />
        ))}
      </div>
    </div>
  )
}
