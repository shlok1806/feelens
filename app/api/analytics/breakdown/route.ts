import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('user_id')
  if (!userId) return NextResponse.json({ error: 'Missing user_id' }, { status: 400 })

  const supabase = await createClient()
  const now = new Date()
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

  const { data: txs } = await supabase
    .from('balance_transactions')
    .select('amount, fee, card_brand, payment_method_type, is_international')
    .eq('user_id', userId)
    .eq('type', 'charge')
    .eq('month_bucket', currentMonth)

  const rows = txs ?? []

  // By card brand
  const brandMap = new Map<string, { volume: number; fees: number; count: number }>()
  for (const tx of rows) {
    const brand = tx.card_brand ?? 'unknown'
    const existing = brandMap.get(brand) ?? { volume: 0, fees: 0, count: 0 }
    brandMap.set(brand, { volume: existing.volume + tx.amount, fees: existing.fees + tx.fee, count: existing.count + 1 })
  }
  const byCardBrand = Array.from(brandMap.entries()).map(([brand, { volume, fees, count }]) => ({
    brand,
    volume,
    fees,
    effectiveRate: volume > 0 ? Math.round((fees / volume) * 10000) / 100 : 0,
    transactionCount: count,
  }))

  // By payment method
  const methodMap = new Map<string, { volume: number; fees: number }>()
  for (const tx of rows) {
    const method = tx.payment_method_type ?? 'card'
    const existing = methodMap.get(method) ?? { volume: 0, fees: 0 }
    methodMap.set(method, { volume: existing.volume + tx.amount, fees: existing.fees + tx.fee })
  }
  const byPaymentMethod = Array.from(methodMap.entries()).map(([method, { volume, fees }]) => ({
    method,
    volume,
    fees,
    effectiveRate: volume > 0 ? Math.round((fees / volume) * 10000) / 100 : 0,
  }))

  // By geography
  const domestic = rows.filter((tx) => !tx.is_international)
  const international = rows.filter((tx) => tx.is_international)
  const domVol = domestic.reduce((s, r) => s + r.amount, 0)
  const domFees = domestic.reduce((s, r) => s + r.fee, 0)
  const intVol = international.reduce((s, r) => s + r.amount, 0)
  const intFees = international.reduce((s, r) => s + r.fee, 0)

  return NextResponse.json({
    byCardBrand,
    byPaymentMethod,
    byGeography: {
      domestic: { volume: domVol, fees: domFees, effectiveRate: domVol > 0 ? Math.round((domFees / domVol) * 10000) / 100 : 0 },
      international: { volume: intVol, fees: intFees, effectiveRate: intVol > 0 ? Math.round((intFees / intVol) * 10000) / 100 : 0 },
    },
  })
}
