import Stripe from 'stripe'

export function createStripeClient(apiKey: string): Stripe {
  return new Stripe(apiKey, {
    apiVersion: '2026-03-25.dahlia',
    typescript: true,
  })
}

export function isTestKey(key: string): boolean {
  return key.startsWith('sk_test_') || key.startsWith('rk_test_')
}

export function isValidKeyFormat(key: string): boolean {
  return (
    key.startsWith('sk_test_') ||
    key.startsWith('sk_live_') ||
    key.startsWith('rk_test_') ||
    key.startsWith('rk_live_')
  )
}
