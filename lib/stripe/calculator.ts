// Pure fee calculation functions — the financial accuracy of FeeLens lives here.
// All amounts are in cents.

export function effectiveRate(totalFees: number, totalVolume: number): number {
  if (totalVolume === 0) return 0
  return (totalFees / totalVolume) * 100
}

/**
 * Refund fee leakage: Stripe keeps the processing fee even when a refund is issued.
 * For a full refund, the entire original processing fee is lost.
 * For a partial refund, a proportional amount is lost.
 */
export function refundLeakage(refundAmount: number, originalAmount: number, originalFee: number): number {
  if (originalAmount === 0) return 0
  return Math.round((refundAmount / originalAmount) * originalFee)
}

/**
 * Amex premium: the extra cost Amex charges vs a standard Visa/MC rate.
 * Amex is typically ~3.5% vs Visa/MC at ~2.9% — a 60bps premium.
 */
export function amexPremium(amexVolume: number, amexRate: number, baselineRate = 0.029): number {
  const amexRateDecimal = amexRate / 100
  if (amexRateDecimal <= baselineRate) return 0
  return Math.round(amexVolume * (amexRateDecimal - baselineRate))
}

/**
 * International surcharge: Stripe adds 1.5% for international cards.
 */
export function internationalSurcharge(internationalVolume: number): number {
  return Math.round(internationalVolume * 0.015)
}

/**
 * Dispute fee: Stripe charges $15 per dispute, regardless of outcome.
 */
export const DISPUTE_FEE_CENTS = 1500

/**
 * Month bucket string from a Unix timestamp.
 */
export function monthBucket(unixSeconds: number): string {
  const d = new Date(unixSeconds * 1000)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

/**
 * Whether a card is international based on country code.
 */
export function isInternational(cardCountry: string | null): boolean {
  if (!cardCountry) return false
  return cardCountry.toUpperCase() !== 'US'
}
