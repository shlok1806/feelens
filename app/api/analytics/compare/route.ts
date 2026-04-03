import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('user_id')
  if (!userId) return NextResponse.json({ error: 'Missing user_id' }, { status: 400 })

  const supabase = await createClient()
  const now = new Date()
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const prevDate = new Date(now.getFullYear(), now.getMonth() - 1)
  const previousMonth = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`

  const [{ data: curr }, { data: prev }] = await Promise.all([
    supabase.from('balance_transactions').select('amount, fee').eq('user_id', userId).eq('type', 'charge').eq('month_bucket', currentMonth),
    supabase.from('balance_transactions').select('amount, fee').eq('user_id', userId).eq('type', 'charge').eq('month_bucket', previousMonth),
  ])

  const calcSummary = (rows: Array<{ amount: number; fee: number }>, month: string) => {
    const totalVolume = rows.reduce((s, r) => s + r.amount, 0)
    const totalFees = rows.reduce((s, r) => s + r.fee, 0)
    const effectiveRate = totalVolume > 0 ? (totalFees / totalVolume) * 100 : 0
    return {
      month,
      effectiveRate: Math.round(effectiveRate * 100) / 100,
      totalFees,
      totalVolume,
      transactionCount: rows.length,
      industryBenchmark: 2.9,
      trendVsPriorMonth: 0,
    }
  }

  const current = calcSummary(curr ?? [], currentMonth)
  const previous = calcSummary(prev ?? [], previousMonth)

  return NextResponse.json({
    current,
    previous,
    delta: {
      effectiveRate: Math.round((current.effectiveRate - previous.effectiveRate) * 100) / 100,
      fees: current.totalFees - previous.totalFees,
      volume: current.totalVolume - previous.totalVolume,
    },
  })
}
