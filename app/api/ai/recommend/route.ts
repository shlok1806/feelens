import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Anthropic from '@anthropic-ai/sdk'
import { createHash } from 'crypto'
import type { SummaryData, BreakdownData, LeakageData, Recommendation } from '@/types'
import { formatCurrency, formatRate } from '@/lib/utils'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

function buildPrompt(summary: SummaryData, breakdown: BreakdownData, leakage: LeakageData): string {
  const brandTable = breakdown.byCardBrand
    .map((b) => `| ${b.brand.toUpperCase()} | ${formatCurrency(b.volume)} | ${formatCurrency(b.fees)} | ${formatRate(b.effectiveRate)} | ${b.transactionCount} txns |`)
    .join('\n')

  const totalLeakage =
    leakage.refundLeakage.total +
    leakage.disputeLeakage.total +
    leakage.internationalSurcharge.total +
    leakage.amexPremium.total

  return `You are a payments optimization analyst specializing in Stripe fee reduction for early-stage SaaS companies.

Analyze this Stripe fee breakdown and provide 3-5 specific, actionable recommendations with realistic savings estimates. Be conservative — underpromise.

## Fee Summary
- Effective rate: ${formatRate(summary.effectiveRate)} (industry avg: ${formatRate(summary.industryBenchmark)})
- Total monthly fees: ${formatCurrency(summary.totalFees)}
- Total monthly volume: ${formatCurrency(summary.totalVolume)}
- Transactions: ${summary.transactionCount}
- Rate trend vs last month: ${summary.trendVsPriorMonth > 0 ? '+' : ''}${formatRate(summary.trendVsPriorMonth)}

## Card Brand Breakdown
| Brand | Volume | Fees | Rate | Transactions |
|-------|--------|------|------|-------------|
${brandTable}

## Payment Method Mix
- Card: ${formatCurrency(breakdown.byPaymentMethod.find((m) => m.method === 'card')?.volume ?? 0)}
- ACH/Bank: ${formatCurrency(breakdown.byPaymentMethod.find((m) => m.method === 'us_bank_account')?.volume ?? 0)}

## Geographic Split
- Domestic: ${formatCurrency(breakdown.byGeography.domestic.volume)} at ${formatRate(breakdown.byGeography.domestic.effectiveRate)}
- International: ${formatCurrency(breakdown.byGeography.international.volume)} at ${formatRate(breakdown.byGeography.international.effectiveRate)}

## Fee Leakage (total: ${formatCurrency(totalLeakage)}/month)
- Refund fee retention: ${formatCurrency(leakage.refundLeakage.total)}/month (${leakage.refundLeakage.count} refunds)
- Dispute fees (incl. won): ${formatCurrency(leakage.disputeLeakage.total)}/month (${leakage.disputeLeakage.count} disputes, ${formatCurrency(leakage.disputeLeakage.won)} on won cases)
- International surcharge: ${formatCurrency(leakage.internationalSurcharge.total)}/month
- Amex premium over Visa: ${formatCurrency(leakage.amexPremium.total)}/month

Respond with valid JSON only, no markdown:
{
  "recommendations": [
    {
      "id": "string",
      "title": "concise title",
      "description": "2-3 sentence description referencing their specific numbers",
      "estimatedMonthlySavings": number_in_cents,
      "confidence": "high" | "medium" | "low",
      "category": "payment_method" | "card_routing" | "dispute" | "refund" | "payout",
      "actionSteps": ["step 1", "step 2", "step 3"]
    }
  ]
}`
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const body = await request.json()

    // Fetch analytics data for the user
    const base = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
    const userId = body.user_id ?? user?.id
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const now = new Date()
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

    const [summary, breakdown, leakage] = await Promise.all([
      fetch(`${base}/api/analytics/summary?user_id=${userId}`, { cache: 'no-store' }).then((r) => r.json()) as Promise<SummaryData>,
      fetch(`${base}/api/analytics/breakdown?user_id=${userId}`, { cache: 'no-store' }).then((r) => r.json()) as Promise<BreakdownData>,
      fetch(`${base}/api/analytics/leakage?user_id=${userId}`, { cache: 'no-store' }).then((r) => r.json()) as Promise<LeakageData>,
    ])

    const inputHash = createHash('sha256')
      .update(JSON.stringify({ summary, breakdown, leakage }))
      .digest('hex')

    // Check cache
    const { data: cached } = await supabase
      .from('ai_recommendations')
      .select('recommendations')
      .eq('user_id', userId)
      .eq('month_bucket', currentMonth)
      .eq('input_hash', inputHash)
      .gte('generated_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .single()

    if (cached) {
      return NextResponse.json({ recommendations: cached.recommendations, fromCache: true })
    }

    // Generate AI-powered fee recommendations
    const prompt = buildPrompt(summary, breakdown, leakage)
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      messages: [{ role: 'user', content: prompt }],
    })

    const content = message.content[0]
    if (content.type !== 'text') {
      return NextResponse.json({ error: 'Unexpected AI response format' }, { status: 500 })
    }

    const parsed = JSON.parse(content.text) as { recommendations: Recommendation[] }

    // Cache result
    await supabase.from('ai_recommendations').upsert({
      user_id: userId,
      month_bucket: currentMonth,
      recommendations: parsed.recommendations,
      input_hash: inputHash,
    })

    return NextResponse.json({ recommendations: parsed.recommendations, fromCache: false })
  } catch (err) {
    console.error('AI recommend error:', err)
    return NextResponse.json({ error: 'Failed to generate recommendations' }, { status: 500 })
  }
}
