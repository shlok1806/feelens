'use client'

import { Sparkles, ChevronDown, ChevronUp, ArrowRight } from 'lucide-react'
import { useState } from 'react'
import { formatCurrency } from '@/lib/utils'
import type { Recommendation } from '@/types'

const categoryLabel: Record<Recommendation['category'], string> = {
  payment_method: 'Payment Method',
  card_routing: 'Card Routing',
  dispute: 'Disputes',
  refund: 'Refunds',
  payout: 'Payout',
}

const categoryTokens: Record<Recommendation['category'], { bg: string; color: string }> = {
  payment_method: { bg: 'var(--fl-indigo-light)', color: 'var(--fl-indigo)' },
  card_routing: { bg: 'var(--fl-purple-light)', color: '#8B5CF6' },
  dispute: { bg: 'var(--fl-red-light)', color: 'var(--fl-red)' },
  refund: { bg: 'var(--fl-amber-light)', color: 'var(--fl-amber)' },
  payout: { bg: 'var(--fl-surface-hover)', color: 'var(--fl-text-secondary)' },
}

function ConfidenceDot({ confidence }: { confidence: Recommendation['confidence'] }) {
  const color = confidence === 'high' ? 'var(--fl-green)' : confidence === 'medium' ? 'var(--fl-amber)' : 'var(--fl-text-tertiary)'
  return (
    <span className="flex items-center gap-1 text-[11px] font-medium" style={{ color }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
      {confidence}
    </span>
  )
}

function RecCard({ rec, rank }: { rec: Recommendation; rank: number }) {
  const [open, setOpen] = useState(false)
  const cat = categoryTokens[rec.category]

  return (
    <div
      className="rounded-xl transition-all duration-200 overflow-hidden"
      style={{
        background: open ? 'var(--fl-surface-hover)' : 'var(--fl-surface)',
        border: `1px solid ${open ? 'var(--fl-indigo)' : 'var(--fl-border)'}`,
        borderColor: open ? 'var(--fl-indigo)' : undefined,
        opacity: open ? 1 : undefined,
      }}
    >
      <button onClick={() => setOpen((o) => !o)} className="w-full text-left p-4">
        <div className="flex items-start gap-3">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: 'var(--fl-surface-hover)' }}>
            <span className="text-xs font-bold" style={{ color: 'var(--fl-text-tertiary)' }}>{rank}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-[11px] font-semibold px-1.5 py-0.5 rounded-md" style={{ background: cat.bg, color: cat.color }}>
                {categoryLabel[rec.category]}
              </span>
              <ConfidenceDot confidence={rec.confidence} />
            </div>
            <p className="text-sm font-medium leading-snug" style={{ color: 'var(--fl-text-primary)' }}>{rec.title}</p>
          </div>
          <div className="flex-shrink-0 text-right ml-2">
            <div className="text-base font-bold fl-metric" style={{ color: 'var(--fl-green)' }}>{formatCurrency(rec.estimatedMonthlySavings)}</div>
            <div className="text-[10px]" style={{ color: 'var(--fl-green)', opacity: 0.6 }}>saved/mo</div>
          </div>
        </div>
      </button>

      <div className={`overflow-hidden transition-all duration-200 ${open ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="px-4 pb-4">
          <p className="text-xs leading-relaxed mb-3" style={{ color: 'var(--fl-text-secondary)' }}>{rec.description}</p>
          <div className="rounded-lg p-3" style={{ background: 'var(--fl-surface)', border: '1px solid var(--fl-border-subtle)' }}>
            <p className="text-[11px] font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--fl-text-tertiary)' }}>Action steps</p>
            <ol className="space-y-1.5">
              {rec.actionSteps.map((step, i) => (
                <li key={i} className="flex items-start gap-2 text-xs" style={{ color: 'var(--fl-text-secondary)' }}>
                  <ArrowRight className="w-3 h-3 flex-shrink-0 mt-0.5" style={{ color: 'var(--fl-indigo)' }} />
                  {step}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}

interface Props {
  recommendations: Recommendation[]
  isLoading?: boolean
}

export function AIRecommendations({ recommendations, isLoading }: Props) {
  const totalSavings = recommendations.reduce((sum, r) => sum + r.estimatedMonthlySavings, 0)
  const [showAll, setShowAll] = useState(false)
  const visible = showAll ? recommendations : recommendations.slice(0, 3)

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-4 h-4 animate-pulse" style={{ color: 'var(--fl-indigo)' }} />
          <span className="text-sm font-semibold" style={{ color: 'var(--fl-text-primary)' }}>Analyzing your fees...</span>
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl p-4 animate-pulse" style={{ background: 'var(--fl-surface-hover)', border: '1px solid var(--fl-border-subtle)' }}>
            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-lg flex-shrink-0" style={{ background: 'var(--fl-border)' }} />
              <div className="flex-1 space-y-2">
                <div className="h-3 rounded w-1/3" style={{ background: 'var(--fl-border)' }} />
                <div className="h-4 rounded w-4/5" style={{ background: 'var(--fl-border)' }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4" style={{ color: 'var(--fl-indigo)' }} />
          <h3 className="text-sm font-semibold" style={{ color: 'var(--fl-text-primary)' }}>AI Fee Optimizer</h3>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold fl-metric" style={{ color: 'var(--fl-green)' }}>{formatCurrency(totalSavings)}</div>
          <div className="text-xs mt-0.5" style={{ color: 'var(--fl-green)', opacity: 0.6 }}>potential/month</div>
        </div>
      </div>

      <p className="text-xs mb-4" style={{ color: 'var(--fl-text-tertiary)' }}>
        AI analyzed your fee breakdown. Click any card for action steps.
      </p>

      <div className="space-y-2.5">
        {visible.map((rec, i) => (
          <RecCard key={rec.id} rec={rec} rank={i + 1} />
        ))}
      </div>

      {recommendations.length > 3 && (
        <button
          onClick={() => setShowAll((s) => !s)}
          className="mt-3 w-full text-xs flex items-center justify-center gap-1 py-2 rounded-lg transition-colors"
          style={{ color: 'var(--fl-text-tertiary)' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--fl-surface-hover)'; e.currentTarget.style.color = 'var(--fl-indigo)' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--fl-text-tertiary)' }}
        >
          {showAll ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          {showAll ? 'Show fewer' : `Show ${recommendations.length - 3} more`}
        </button>
      )}
    </div>
  )
}
