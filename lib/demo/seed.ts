import type { SummaryData, BreakdownData, LeakageData, Recommendation, MonthComparison } from '@/types'

export const DEMO_SUMMARY: SummaryData = {
  effectiveRate: 3.24,
  totalFees: 389500,      // $3,895/month
  totalVolume: 12020000,  // $120,200/month
  transactionCount: 847,
  industryBenchmark: 2.90,
  trendVsPriorMonth: +0.08,
}

export const DEMO_BREAKDOWN: BreakdownData = {
  byCardBrand: [
    { brand: 'visa',        volume: 6900000, fees: 201000, effectiveRate: 2.91, transactionCount: 486 },
    { brand: 'mastercard',  volume: 2800000, fees:  83300, effectiveRate: 2.97, transactionCount: 196 },
    { brand: 'amex',        volume: 1900000, fees:  66400, effectiveRate: 3.49, transactionCount: 112 },
    { brand: 'discover',    volume:  420000, fees:  12500, effectiveRate: 2.98, transactionCount:  53 },
  ],
  byPaymentMethod: [
    { method: 'card',            volume: 12020000, fees: 389500, effectiveRate: 3.24 },
    { method: 'us_bank_account', volume:         0, fees:       0, effectiveRate: 0 },
  ],
  byGeography: {
    domestic:      { volume: 9616000,  fees: 279100, effectiveRate: 2.90 },
    international: { volume: 2404000,  fees: 110400, effectiveRate: 4.59 },
  },
}

export const DEMO_LEAKAGE: LeakageData = {
  refundLeakage:          { total: 3840,  count: 12, avgPerRefund: 320 },
  disputeLeakage:         { total: 4500,  won: 3000, lost: 1500, count: 3 },
  internationalSurcharge: { total: 36060, asPercentOfInternational: 1.50 },
  amexPremium:            { total: 11400, asPercentOfAmexVolume: 0.60 },
}

export const DEMO_RECOMMENDATIONS: Recommendation[] = [
  {
    id: '1',
    title: 'Add ACH as a payment option for recurring customers',
    description:
      'You currently process 100% of your volume via card. ACH bank transfers cost just 0.8% (capped at $5) vs your current 3.24% blended card rate. Customers who pay monthly subscriptions are ideal candidates — ACH churn rates are actually lower than card churn.',
    estimatedMonthlySavings: 180000, // $1,800
    confidence: 'high',
    category: 'payment_method',
    actionSteps: [
      'Enable Stripe ACH Direct Debit in your Stripe dashboard under Payment Methods',
      'Add bank account collection to your checkout for subscription plans ($100+/month)',
      'Set ACH as the default for customers with 3+ successful card payments (proven intent)',
      'Send a one-time email to existing subscribers offering ACH with a $10 credit incentive',
    ],
  },
  {
    id: '2',
    title: 'Route Amex volume to discourage card brand premium',
    description:
      'Amex cards are costing you 3.49% — 60bps above your Visa rate. Your Amex volume ($19,000/month) is generating $660 in excess fees vs if that same spend were on Visa. You can\'t refuse Amex outright, but you can price it in.',
    estimatedMonthlySavings: 11400,
    confidence: 'medium',
    category: 'card_routing',
    actionSteps: [
      'Enable Stripe\'s card brand surcharging (where legally allowed — check state laws)',
      'Add a 0.6% surcharge for Amex at checkout with clear disclosure',
      'Alternatively, offer a small discount for ACH/Visa to nudge payment method choice',
      'Review Stripe\'s "card_present" vs "card_not_present" rates — in-person Amex is cheaper',
    ],
  },
  {
    id: '3',
    title: 'Reduce international volume or add currency-specific pricing',
    description:
      'Your 20% international volume is costing 4.59% effective rate — 1.69% more than domestic. The $36,060/year international surcharge alone justifies adding local currency support or a currency conversion fee.',
    estimatedMonthlySavings: 36060,
    confidence: 'high',
    category: 'card_routing',
    actionSteps: [
      'Enable Stripe\'s automatic currency conversion to present local prices',
      'Add a visible "international processing fee" of 1.5% for non-US cards',
      'Consider Stripe\'s local payment methods (SEPA, iDEAL) for EU customers — much lower fees',
      'If volume is concentrated in one country, explore a local Stripe entity (e.g., Stripe UK)',
    ],
  },
  {
    id: '4',
    title: 'Stop losing money on refunds',
    description:
      'Stripe keeps the processing fee when you issue a refund. You\'ve issued 12 refunds this month, losing $38.40 in non-refunded fees. More importantly, your refund rate may be a leading indicator of product or pricing issues worth addressing.',
    estimatedMonthlySavings: 3840,
    confidence: 'high',
    category: 'refund',
    actionSteps: [
      'Review Stripe\'s partial refund option — refund only the net amount if appropriate',
      'For large refunds, negotiate with Stripe support for fee waivers (possible for high-volume accounts)',
      'Analyze which SKUs/plans generate the most refunds — address root causes to prevent future fees',
      'Consider a clear no-refund policy for digital goods where legally permissible',
    ],
  },
  {
    id: '5',
    title: 'Dispute prevention to recover $30/dispute in net fees',
    description:
      'You won 2 of 3 disputes this month but still paid $15/each in dispute fees — $30 wasted on cases you won. Plus the time cost. Proactive dispute prevention (better receipts, clear billing descriptors) is cheaper than fighting.',
    estimatedMonthlySavings: 4500,
    confidence: 'medium',
    category: 'dispute',
    actionSteps: [
      'Update your Stripe billing descriptor to include your URL or customer support number',
      'Enable Stripe Radar rules to flag high-risk charges for manual review before processing',
      'Send a post-purchase receipt immediately with a clear cancellation/refund link',
      'For subscription businesses, send a reminder 3 days before each renewal charge',
    ],
  },
]

export const DEMO_COMPARISON: MonthComparison = {
  current: {
    month: '2026-03',
    effectiveRate: 3.24,
    totalFees: 389500,
    totalVolume: 12020000,
    transactionCount: 847,
    industryBenchmark: 2.90,
    trendVsPriorMonth: +0.08,
  },
  previous: {
    month: '2026-02',
    effectiveRate: 3.16,
    totalFees: 341200,
    totalVolume: 10800000,
    transactionCount: 762,
    industryBenchmark: 2.90,
    trendVsPriorMonth: +0.03,
  },
  delta: {
    effectiveRate: 0.08,
    fees: 48300,
    volume: 1220000,
  },
}
