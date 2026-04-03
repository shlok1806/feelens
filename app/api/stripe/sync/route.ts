import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createStripeClient } from '@/lib/stripe/client'
import { decryptKey } from '@/lib/crypto'
import { fetchBalanceTransactions } from '@/lib/stripe/fetcher'

export const maxDuration = 60

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: connection } = await supabase
      .from('stripe_connections')
      .select('stripe_key')
      .eq('user_id', user.id)
      .single()

    if (!connection) return NextResponse.json({ error: 'No Stripe connection found' }, { status: 404 })

    const apiKey = decryptKey(connection.stripe_key)
    const stripe = createStripeClient(apiKey)

    const { transactions, leakage, disputes } = await fetchBalanceTransactions(stripe, 90)

    // Upsert balance_transactions
    if (transactions.length > 0) {
      const rows = transactions.map((tx) => ({ ...tx, user_id: user.id }))
      const { error } = await supabase.from('balance_transactions').upsert(rows, { onConflict: 'id' })
      if (error) console.error('balance_transactions upsert error:', error)
    }

    // Upsert refund_fee_leakage
    if (leakage.length > 0) {
      const rows = leakage.map((l) => ({ ...l, user_id: user.id }))
      const { error } = await supabase.from('refund_fee_leakage').upsert(rows, { onConflict: 'id' })
      if (error) console.error('refund_fee_leakage upsert error:', error)
    }

    // Upsert dispute_records
    if (disputes.length > 0) {
      const rows = disputes.map((d) => ({ ...d, user_id: user.id }))
      const { error } = await supabase.from('dispute_records').upsert(rows, { onConflict: 'id' })
      if (error) console.error('dispute_records upsert error:', error)
    }

    // Update last_synced_at
    await supabase
      .from('stripe_connections')
      .update({ last_synced_at: new Date().toISOString() })
      .eq('user_id', user.id)

    return NextResponse.json({
      ok: true,
      synced: { transactions: transactions.length, leakage: leakage.length, disputes: disputes.length },
    })
  } catch (err) {
    console.error('Sync error:', err)
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 })
  }
}
