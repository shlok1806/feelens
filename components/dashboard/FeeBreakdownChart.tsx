'use client'

import {
  PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { brandColor, brandLabel, formatCurrency, formatRate } from '@/lib/utils'
import type { BreakdownData } from '@/types'

interface Props {
  data: BreakdownData
}

const ChartTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number; payload?: { effectiveRate?: number } }> }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl px-3 py-2.5 text-sm" style={{
      background: 'var(--fl-surface-raised)',
      border: '1px solid var(--fl-border)',
      boxShadow: 'var(--fl-shadow-lg)',
    }}>
      <p className="font-semibold mb-0.5" style={{ color: 'var(--fl-text-primary)' }}>{payload[0].name}</p>
      <p className="fl-metric" style={{ color: 'var(--fl-text-secondary)' }}>{formatCurrency(payload[0].value)}</p>
      {payload[0].payload?.effectiveRate && (
        <p className="text-xs" style={{ color: 'var(--fl-text-tertiary)' }}>{formatRate(payload[0].payload.effectiveRate)} eff. rate</p>
      )}
    </div>
  )
}

export function FeeBreakdownChart({ data }: Props) {
  const brandData = data.byCardBrand.map((b) => ({
    name: brandLabel(b.brand),
    value: b.fees,
    effectiveRate: b.effectiveRate,
    fill: brandColor(b.brand),
  }))

  const methodData = [
    { name: 'Card', fees: data.byPaymentMethod.find((m) => m.method === 'card')?.fees ?? 0, fill: 'var(--fl-indigo)' },
    { name: 'ACH', fees: data.byPaymentMethod.find((m) => m.method === 'us_bank_account')?.fees ?? 0, fill: 'var(--fl-green)' },
  ]

  const geoData = [
    { name: 'Domestic', fees: data.byGeography.domestic.fees, rate: data.byGeography.domestic.effectiveRate, fill: 'var(--fl-indigo)' },
    { name: 'International', fees: data.byGeography.international.fees, rate: data.byGeography.international.effectiveRate, fill: 'var(--fl-amber)' },
  ]

  return (
    <div className="fl-card p-6 h-full">
      <div className="mb-5">
        <h3 className="text-sm font-semibold" style={{ color: 'var(--fl-text-primary)' }}>Fee Breakdown</h3>
        <p className="text-xs mt-0.5" style={{ color: 'var(--fl-text-tertiary)' }}>Where your fees come from</p>
      </div>

      <Tabs defaultValue="brand">
        <TabsList className="rounded-lg p-0.5 mb-5 h-8" style={{ background: 'var(--fl-surface-hover)' }}>
          <TabsTrigger value="brand" className="text-xs h-7 px-3 rounded-md data-[state=active]:shadow-sm" style={{ color: 'var(--fl-text-secondary)' }}>By Brand</TabsTrigger>
          <TabsTrigger value="method" className="text-xs h-7 px-3 rounded-md data-[state=active]:shadow-sm" style={{ color: 'var(--fl-text-secondary)' }}>By Method</TabsTrigger>
          <TabsTrigger value="geo" className="text-xs h-7 px-3 rounded-md data-[state=active]:shadow-sm" style={{ color: 'var(--fl-text-secondary)' }}>By Geo</TabsTrigger>
        </TabsList>

        <TabsContent value="brand" className="mt-0">
          <div className="flex items-center gap-6">
            <ResponsiveContainer width="55%" height={200}>
              <PieChart>
                <Pie
                  data={brandData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={2}
                  label={false}
                >
                  {brandData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} strokeWidth={0} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {brandData.map((b) => (
                <div key={b.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: b.fill }} />
                    <span style={{ color: 'var(--fl-text-secondary)' }}>{b.name}</span>
                  </div>
                  <span className="font-semibold fl-metric" style={{ color: 'var(--fl-text-primary)' }}>{formatCurrency(b.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="method" className="mt-0">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={methodData} margin={{ top: 8, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--fl-border-subtle)" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--fl-text-tertiary)' }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={(v) => `$${(v / 100).toLocaleString()}`} tick={{ fontSize: 11, fill: 'var(--fl-text-tertiary)' }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v) => formatCurrency(Number(v))} content={<ChartTooltip />} />
              <Bar dataKey="fees" name="Fees" radius={[6, 6, 0, 0]}>
                {methodData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-3 p-3 rounded-xl text-xs" style={{
            background: 'var(--fl-indigo-light)',
            color: 'var(--fl-indigo)',
            border: '1px solid var(--fl-indigo)',
            borderColor: 'rgba(99, 102, 241, 0.15)',
          }}>
            <strong>0% ACH usage detected.</strong> Switching recurring customers to ACH (0.8% capped at $5) could save ~$1,800/mo.
          </div>
        </TabsContent>

        <TabsContent value="geo" className="mt-0">
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={geoData} margin={{ top: 8, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--fl-border-subtle)" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--fl-text-tertiary)' }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={(v) => `$${(v / 100).toLocaleString()}`} tick={{ fontSize: 11, fill: 'var(--fl-text-tertiary)' }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v, name) => [formatCurrency(Number(v)), String(name)]} />
              <Bar dataKey="fees" name="Fees" radius={[6, 6, 0, 0]}>
                {geoData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {geoData.map((g) => (
              <div key={g.name} className="rounded-xl p-3" style={{
                background: 'var(--fl-surface-hover)',
                border: '1px solid var(--fl-border-subtle)',
              }}>
                <div className="text-xs mb-1" style={{ color: 'var(--fl-text-tertiary)' }}>{g.name}</div>
                <div className="font-semibold fl-metric text-sm" style={{ color: 'var(--fl-text-primary)' }}>{formatCurrency(g.fees)}</div>
                <div className="text-xs mt-0.5" style={{ color: 'var(--fl-text-tertiary)' }}>{formatRate(g.rate)} eff. rate</div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
