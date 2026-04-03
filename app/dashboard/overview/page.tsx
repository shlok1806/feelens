import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SummaryMetrics } from '@/components/dashboard/SummaryMetrics'
import { FeeBreakdownChart } from '@/components/dashboard/FeeBreakdownChart'
import { CardBrandTable } from '@/components/dashboard/CardBrandTable'
import { LeakageList } from '@/components/dashboard/LeakageList'
import { AIRecommendations } from '@/components/dashboard/AIRecommendations'
import { MonthComparison } from '@/components/dashboard/MonthComparison'
import { LogOut, RefreshCw } from 'lucide-react'

export const metadata = { title: 'Overview — FeeLens' }

async function getData(userId: string) {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const [summary, breakdown, leakage, compare, recs] = await Promise.all([
    fetch(`${base}/api/analytics/summary?user_id=${userId}`, { cache: 'no-store' }).then((r) => r.json()),
    fetch(`${base}/api/analytics/breakdown?user_id=${userId}`, { cache: 'no-store' }).then((r) => r.json()),
    fetch(`${base}/api/analytics/leakage?user_id=${userId}`, { cache: 'no-store' }).then((r) => r.json()),
    fetch(`${base}/api/analytics/compare?user_id=${userId}`, { cache: 'no-store' }).then((r) => r.json()),
    fetch(`${base}/api/ai/recommend`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId }),
      cache: 'no-store',
    }).then((r) => r.json()),
  ])
  return { summary, breakdown, leakage, compare, recommendations: recs.recommendations ?? [] }
}

export default async function OverviewPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: connection } = await supabase
    .from('stripe_connections')
    .select('last_synced_at, is_test_mode')
    .eq('user_id', user.id)
    .single()

  if (!connection) redirect('/dashboard')

  const { summary, breakdown, leakage, compare, recommendations } = await getData(user.id)

  const lastSync = connection.last_synced_at
    ? new Date(connection.last_synced_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
    : 'Never'

  return (
    <div className="min-h-screen" style={{ background: 'var(--fl-bg)' }}>
      {/* Navigation */}
      <nav className="fl-glass sticky top-0 z-10" style={{ borderBottom: '1px solid var(--fl-border)' }}>
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-lg font-bold tracking-tight" style={{ color: 'var(--fl-text-primary)' }}>FeeLens</span>
            {connection.is_test_mode && (
              <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: 'var(--fl-amber-light)', color: 'var(--fl-amber)', border: '1px solid rgba(245,158,11,0.2)' }}>
                Test mode
              </span>
            )}
          </div>
          <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--fl-text-tertiary)' }}>
            <span className="hidden sm:inline">Synced {lastSync}</span>
            <form action="/api/auth/signout" method="POST">
              <button type="submit" className="flex items-center gap-1.5 transition-colors rounded-lg px-2 py-1"
                style={{ color: 'var(--fl-text-tertiary)' }}
                onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => e.currentTarget.style.color = 'var(--fl-text-primary)'}
                onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => e.currentTarget.style.color = 'var(--fl-text-tertiary)'}
              >
                <LogOut className="w-3.5 h-3.5" /> Sign out
              </button>
            </form>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-7">
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--fl-text-primary)' }}>Fee Intelligence</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--fl-text-secondary)' }}>
            {user.email} · {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
          </p>
        </div>

        <div className="mb-7">
          <SummaryMetrics data={summary} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 mb-5">
          <div className="lg:col-span-3">
            <FeeBreakdownChart data={breakdown} />
          </div>
          <div className="lg:col-span-2">
            <CardBrandTable data={breakdown} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
          <div className="fl-card p-6">
            <LeakageList data={leakage} />
          </div>
          <div className="fl-card p-6">
            <AIRecommendations recommendations={recommendations} />
          </div>
        </div>

        <div className="fl-card p-6">
          <MonthComparison data={compare} />
        </div>
      </div>
    </div>
  )
}
