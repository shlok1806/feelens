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

  const [{ data: current }, { data: previous }] = await Promise.all([
    supabase
      .from('balance_transactions')
      .select('amount, fee')
      .eq('user_id', userId)
      .eq('type', 'charge')
      .eq('month_bucket', currentMonth),
    supabase
      .from('balance_transactions')
      .select('amount, fee')
      .eq('user_id', userId)
      .eq('type', 'charge')
      .eq('month_bucket', previousMonth),
  ])

  const totalVolume = (current ?? []).reduce((s, r) => s + r.amount, 0)
  const totalFees = (current ?? []).reduce((s, r) => s + r.fee, 0)
  const transactionCount = (current ?? []).length
  const effectiveRate = totalVolume > 0 ? (totalFees / totalVolume) * 100 : 0

  const prevVolume = (previous ?? []).reduce((s, r) => s + r.amount, 0)
  const prevFees = (previous ?? []).reduce((s, r) => s + r.fee, 0)
  const prevRate = prevVolume > 0 ? (prevFees / prevVolume) * 100 : 0

  return NextResponse.json({
    effectiveRate: Math.round(effectiveRate * 100) / 100,
    totalFees,
    totalVolume,
    transactionCount,
    industryBenchmark: 2.9,
    trendVsPriorMonth: Math.round((effectiveRate - prevRate) * 100) / 100,
  })
}
