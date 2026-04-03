import { DemoBanner } from '@/components/demo/DemoBanner'
import { DemoNav } from '@/components/demo/DemoNav'
import { SummaryMetrics } from '@/components/dashboard/SummaryMetrics'
import { FeeBreakdownChart } from '@/components/dashboard/FeeBreakdownChart'
import { CardBrandTable } from '@/components/dashboard/CardBrandTable'
import { LeakageList } from '@/components/dashboard/LeakageList'
import { AIRecommendations } from '@/components/dashboard/AIRecommendations'
import { MonthComparison } from '@/components/dashboard/MonthComparison'
import {
  DEMO_SUMMARY,
  DEMO_BREAKDOWN,
  DEMO_LEAKAGE,
  DEMO_RECOMMENDATIONS,
  DEMO_COMPARISON,
} from '@/lib/demo/seed'

export const metadata = {
  title: 'FeeLens — Stripe Fee Intelligence Dashboard',
  description: 'See exactly where your Stripe fees go and get AI-powered recommendations to reduce your effective rate.',
}

export default function DemoPage() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--fl-bg)' }}>
      <DemoBanner />
      <DemoNav />

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-7">
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--fl-text-primary)' }}>Fee Intelligence</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--fl-text-secondary)' }}>Your true Stripe costs, broken down. Updated daily.</p>
        </div>

        <div className="mb-7">
          <SummaryMetrics data={DEMO_SUMMARY} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 mb-5">
          <div className="lg:col-span-3">
            <FeeBreakdownChart data={DEMO_BREAKDOWN} />
          </div>
          <div className="lg:col-span-2">
            <CardBrandTable data={DEMO_BREAKDOWN} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
          <div className="fl-card p-6">
            <LeakageList data={DEMO_LEAKAGE} />
          </div>
          <div className="fl-card p-6">
            <AIRecommendations recommendations={DEMO_RECOMMENDATIONS} />
          </div>
        </div>

        <div className="fl-card p-6">
          <MonthComparison data={DEMO_COMPARISON} />
        </div>
      </div>
    </div>
  )
}
