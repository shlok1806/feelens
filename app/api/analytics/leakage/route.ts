import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { amexPremium, internationalSurcharge } from '@/lib/stripe/calculator'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('user_id')
  if (!userId) return NextResponse.json({ error: 'Missing user_id' }, { status: 400 })

  const supabase = await createClient()
  const now = new Date()
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

  const [{ data: leakageRows }, { data: disputeRows }, { data: txRows }] = await Promise.all([
    supabase.from('refund_fee_leakage').select('original_fee_paid').eq('user_id', userId).eq('month_bucket', currentMonth),
    supabase.from('dispute_records').select('dispute_fee, status').eq('user_id', userId).eq('month_bucket', currentMonth),
    supabase.from('balance_transactions').select('amount, fee, card_brand, is_international').eq('user_id', userId).eq('type', 'charge').eq('month_bucket', currentMonth),
  ])

  // Refund leakage
  const refundTotal = (leakageRows ?? []).reduce((s, r) => s + r.original_fee_paid, 0)
  const refundCount = (leakageRows ?? []).length

  // Dispute leakage
  const disputes = disputeRows ?? []
  const disputeTotal = disputes.reduce((s, d) => s + d.dispute_fee, 0)
  const wonFees = disputes.filter((d) => d.status === 'won').reduce((s, d) => s + d.dispute_fee, 0)
  const lostFees = disputes.filter((d) => d.status !== 'won').reduce((s, d) => s + d.dispute_fee, 0)

  // International surcharge
  const txs = txRows ?? []
  const intlVolume = txs.filter((tx) => tx.is_international).reduce((s, r) => s + r.amount, 0)
  const intlSurcharge = internationalSurcharge(intlVolume)
  const totalVolume = txs.reduce((s, r) => s + r.amount, 0)

  // Amex premium
  const amexTxs = txs.filter((tx) => tx.card_brand === 'amex')
  const amexVolume = amexTxs.reduce((s, r) => s + r.amount, 0)
  const amexFees = amexTxs.reduce((s, r) => s + r.fee, 0)
  const amexRate = amexVolume > 0 ? (amexFees / amexVolume) * 100 : 0
  const amexPrem = amexPremium(amexVolume, amexRate)

  return NextResponse.json({
    refundLeakage: {
      total: refundTotal,
      count: refundCount,
      avgPerRefund: refundCount > 0 ? Math.round(refundTotal / refundCount) : 0,
    },
    disputeLeakage: {
      total: disputeTotal,
      won: wonFees,
      lost: lostFees,
      count: disputes.length,
    },
    internationalSurcharge: {
      total: intlSurcharge,
      asPercentOfInternational: totalVolume > 0 ? Math.round((intlVolume / totalVolume) * 10000) / 100 : 0,
    },
    amexPremium: {
      total: amexPrem,
      asPercentOfAmexVolume: amexVolume > 0 ? Math.round((amexPrem / amexVolume) * 10000) / 100 : 0,
    },
  })
}
