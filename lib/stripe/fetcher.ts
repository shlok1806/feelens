import Stripe from 'stripe'
import pLimit from 'p-limit'
import { isInternational, monthBucket, refundLeakage, DISPUTE_FEE_CENTS } from './calculator'

const BATCH_CONCURRENCY = 10

export interface EnrichedBalanceTx {
  id: string
  created_date: string
  type: string
  amount: number
  fee: number
  net: number
  currency: string
  source_id: string | null
  card_brand: string | null
  card_country: string | null
  is_international: boolean
  payment_method_type: string | null
  month_bucket: string
}

export interface LeakageRecord {
  id: string
  charge_id: string
  original_fee_paid: number
  refund_date: string
  month_bucket: string
}

export interface DisputeRecord {
  id: string
  charge_id: string
  dispute_fee: number
  status: string
  dispute_date: string
  month_bucket: string
}

export async function fetchBalanceTransactions(
  stripe: Stripe,
  daysBack = 90
): Promise<{ transactions: EnrichedBalanceTx[]; leakage: LeakageRecord[]; disputes: DisputeRecord[] }> {
  const since = Math.floor(Date.now() / 1000) - daysBack * 86400
  const limit = pLimit(BATCH_CONCURRENCY)

  // 1. Paginate balance_transactions
  const rawTxs: Stripe.BalanceTransaction[] = []
  let startingAfter: string | undefined

  do {
    const page = await stripe.balanceTransactions.list({
      limit: 100,
      created: { gte: since },
      ...(startingAfter ? { starting_after: startingAfter } : {}),
    })
    rawTxs.push(...page.data)
    startingAfter = page.has_more ? page.data[page.data.length - 1].id : undefined
  } while (startingAfter)

  // 2. Collect charge IDs for enrichment
  const chargeIds = rawTxs
    .filter((tx) => tx.type === 'charge' && tx.source && typeof tx.source === 'string')
    .map((tx) => tx.source as string)

  // 3. Fetch charges in parallel to get card details
  const chargeMap = new Map<string, Stripe.Charge>()
  await Promise.all(
    chargeIds.map((id) =>
      limit(async () => {
        try {
          const charge = await stripe.charges.retrieve(id, {
            expand: ['payment_method_details'],
          })
          chargeMap.set(id, charge)
        } catch {
          // ignore individual charge fetch failures
        }
      })
    )
  )

  // 4. Build enriched transactions
  const transactions: EnrichedBalanceTx[] = rawTxs.map((tx) => {
    const sourceId = typeof tx.source === 'string' ? tx.source : null
    const charge = sourceId ? chargeMap.get(sourceId) : null
    const cardDetails = charge?.payment_method_details?.card ?? null
    const brand = cardDetails?.brand ?? null
    const country = cardDetails?.country ?? null
    const pmType = charge?.payment_method_details?.type ?? null

    return {
      id: tx.id,
      created_date: new Date(tx.created * 1000).toISOString().split('T')[0],
      type: tx.type,
      amount: tx.amount,
      fee: tx.fee,
      net: tx.net,
      currency: tx.currency,
      source_id: sourceId,
      card_brand: brand,
      card_country: country,
      is_international: isInternational(country),
      payment_method_type: pmType,
      month_bucket: monthBucket(tx.created),
    }
  })

  // 5. Compute refund fee leakage
  const leakage: LeakageRecord[] = []

  const refundTxs = rawTxs.filter((tx) => tx.type === 'refund')
  for (const refundTx of refundTxs) {
    const refundId = typeof refundTx.source === 'string' ? refundTx.source : null
    if (!refundId) continue

    try {
      const refund = await stripe.refunds.retrieve(refundId)
      const originalChargeId = typeof refund.charge === 'string' ? refund.charge : refund.charge?.id
      if (!originalChargeId) continue

      const originalChargeTx = rawTxs.find((tx) => tx.source === originalChargeId && tx.type === 'charge')
      if (!originalChargeTx) continue

      const leakedFee = refundLeakage(
        Math.abs(refundTx.amount),
        originalChargeTx.amount,
        originalChargeTx.fee
      )

      leakage.push({
        id: refundId,
        charge_id: originalChargeId,
        original_fee_paid: leakedFee,
        refund_date: new Date(refundTx.created * 1000).toISOString().split('T')[0],
        month_bucket: monthBucket(refundTx.created),
      })
    } catch {
      // skip
    }
  }

  // 6. Fetch disputes
  const disputeRecords: DisputeRecord[] = []
  let disputeAfter: string | undefined

  do {
    const page = await stripe.disputes.list({
      limit: 100,
      created: { gte: since },
      ...(disputeAfter ? { starting_after: disputeAfter } : {}),
    })

    for (const dispute of page.data) {
      disputeRecords.push({
        id: dispute.id,
        charge_id: typeof dispute.charge === 'string' ? dispute.charge : dispute.charge?.id ?? '',
        dispute_fee: DISPUTE_FEE_CENTS,
        status: dispute.status,
        dispute_date: new Date(dispute.created * 1000).toISOString().split('T')[0],
        month_bucket: monthBucket(dispute.created),
      })
    }

    disputeAfter = page.has_more ? page.data[page.data.length - 1].id : undefined
  } while (disputeAfter)

  return { transactions, leakage, disputes: disputeRecords }
}
