import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ArrowRight, Key } from 'lucide-react'

export const metadata = { title: 'Dashboard — FeeLens' }

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: connection } = await supabase
    .from('stripe_connections')
    .select('last_synced_at, is_test_mode')
    .eq('user_id', user.id)
    .single()

  if (connection) redirect('/dashboard/overview')

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--fl-bg)' }}>
      <div className="max-w-md w-full fl-card rounded-2xl p-8 text-center">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4" style={{ background: 'var(--fl-indigo-light)' }}>
          <Key className="w-6 h-6" style={{ color: 'var(--fl-indigo)' }} />
        </div>
        <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--fl-text-primary)' }}>Connect your Stripe account</h2>
        <p className="text-sm mb-6" style={{ color: 'var(--fl-text-secondary)' }}>
          Add your Stripe restricted key to start analyzing your fees. Read-only access only.
        </p>
        <ConnectStripeForm userId={user.id} />
      </div>
    </div>
  )
}

function ConnectStripeForm({ userId }: { userId: string }) {
  return (
    <form action="/api/stripe/connect" method="POST" className="space-y-4 text-left">
      <input type="hidden" name="user_id" value={userId} />
      <div>
        <label className="block text-sm font-medium mb-1" style={{ color: 'var(--fl-text-primary)' }}>
          Stripe Restricted Key
        </label>
        <input
          type="password"
          name="stripe_key"
          required
          placeholder="rk_test_..."
          className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2"
          style={{
            background: 'var(--fl-surface-hover)',
            border: '1px solid var(--fl-border)',
            color: 'var(--fl-text-primary)',
          }}
        />
        <p className="mt-1 text-xs" style={{ color: 'var(--fl-text-tertiary)' }}>
          Create a restricted key with read-only access to Balance, Charges, Disputes, and Refunds.
        </p>
      </div>
      <button
        type="submit"
        className="w-full py-2.5 rounded-lg font-semibold text-sm transition-colors flex items-center justify-center gap-2"
        style={{ background: 'var(--fl-indigo)', color: '#FFFFFF' }}
      >
        Connect & Analyze
        <ArrowRight className="w-4 h-4" />
      </button>
    </form>
  )
}
