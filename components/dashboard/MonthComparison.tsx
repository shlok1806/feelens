'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { formatCurrency, formatRate } from '@/lib/utils'
import type { MonthComparison as MonthComparisonType } from '@/types'

interface Props {
  data: MonthComparisonType
}

export function MonthComparison({ data }: Props) {
  const { current, previous, delta } = data

  const deltas = [
    {
      label: 'Rate Change',
      value: `${delta.effectiveRate > 0 ? '+' : ''}${formatRate(delta.effectiveRate)}`,
      bad: delta.effectiveRate > 0,
    },
    {
      label: 'Fees Change',
      value: `${delta.fees > 0 ? '+' : ''}${formatCurrency(delta.fees)}`,
      bad: delta.fees > 0,
    },
    {
      label: 'Volume Change',
      value: `+${formatCurrency(delta.volume)}`,
      neutral: true,
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold" style={{ color: 'var(--fl-text-primary)' }}>Month-over-Month</h3>
        <p className="text-xs mt-0.5" style={{ color: 'var(--fl-text-tertiary)' }}>{previous.month} vs {current.month}</p>
      </div>

      {/* Delta pills */}
      <div className="grid grid-cols-3 gap-3">
        {deltas.map((d) => (
          <div key={d.label} className="rounded-xl p-4" style={{
            background: d.neutral ? 'var(--fl-indigo-light)' : d.bad ? 'var(--fl-red-light)' : 'var(--fl-green-light)',
          }}>
            <div className="text-xs mb-1" style={{ color: 'var(--fl-text-tertiary)' }}>{d.label}</div>
            <div className="text-2xl font-bold fl-metric" style={{
              color: d.neutral ? 'var(--fl-indigo)' : d.bad ? 'var(--fl-red)' : 'var(--fl-green)',
            }}>{d.value}</div>
          </div>
        ))}
      </div>

      {/* Rate arrow */}
      <div className="flex items-end gap-6 p-4 rounded-xl" style={{ background: 'var(--fl-surface-hover)' }}>
        <div>
          <div className="text-xs" style={{ color: 'var(--fl-text-tertiary)' }}>{previous.month}</div>
          <div className="text-2xl font-bold fl-metric" style={{ color: 'var(--fl-text-tertiary)' }}>{formatRate(previous.effectiveRate)}</div>
        </div>
        <div className="text-2xl mb-1" style={{ color: 'var(--fl-border)' }}>→</div>
        <div>
          <div className="text-xs" style={{ color: 'var(--fl-text-tertiary)' }}>{current.month}</div>
          <div className="text-2xl font-bold fl-metric" style={{ color: delta.effectiveRate > 0 ? 'var(--fl-red)' : 'var(--fl-green)' }}>
            {formatRate(current.effectiveRate)}
          </div>
        </div>
      </div>

      {/* Fees chart */}
      <div>
        <div className="text-xs font-medium mb-3" style={{ color: 'var(--fl-text-tertiary)' }}>Fees Paid Comparison</div>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={[{ name: 'Fees', previous: previous.totalFees, current: current.totalFees }]}>
            <XAxis dataKey="name" hide />
            <YAxis tickFormatter={(v) => `$${(v / 100).toLocaleString()}`} tick={{ fontSize: 11, fill: 'var(--fl-text-tertiary)' }} axisLine={false} tickLine={false} />
            <Tooltip formatter={(v) => formatCurrency(Number(v))} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="previous" name={previous.month} fill="var(--fl-border)" radius={[6, 6, 0, 0]} />
            <Bar dataKey="current" name={current.month} fill="var(--fl-indigo)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
