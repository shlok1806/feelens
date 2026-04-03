export interface SummaryData {
  effectiveRate: number
  totalFees: number
  totalVolume: number
  transactionCount: number
  industryBenchmark: number
  trendVsPriorMonth: number
}

export interface CardBrandBreakdown {
  brand: string
  volume: number
  fees: number
  effectiveRate: number
  transactionCount: number
}

export interface BreakdownData {
  byCardBrand: CardBrandBreakdown[]
  byPaymentMethod: Array<{ method: string; volume: number; fees: number; effectiveRate: number }>
  byGeography: {
    domestic: { volume: number; fees: number; effectiveRate: number }
    international: { volume: number; fees: number; effectiveRate: number }
  }
}

export interface LeakageData {
  refundLeakage: { total: number; count: number; avgPerRefund: number }
  disputeLeakage: { total: number; won: number; lost: number; count: number }
  internationalSurcharge: { total: number; asPercentOfInternational: number }
  amexPremium: { total: number; asPercentOfAmexVolume: number }
}

export interface Recommendation {
  id: string
  title: string
  description: string
  estimatedMonthlySavings: number
  confidence: 'high' | 'medium' | 'low'
  category: 'payment_method' | 'card_routing' | 'dispute' | 'refund' | 'payout'
  actionSteps: string[]
}

export interface MonthComparison {
  current: SummaryData & { month: string }
  previous: SummaryData & { month: string }
  delta: { effectiveRate: number; fees: number; volume: number }
}
