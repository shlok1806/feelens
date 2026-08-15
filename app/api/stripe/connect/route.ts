import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createStripeClient, isTestKey, isValidKeyFormat } from '@/lib/stripe/client'
import { encryptKey } from '@/lib/crypto'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const stripeKey = (formData.get('stripe_key') as string)?.trim()

    if (!stripeKey || !isValidKeyFormat(stripeKey)) {
      return NextResponse.json({ error: 'Invalid Stripe key format. Use sk_test_*, sk_live_*, rk_test_*, or rk_live_*.' }, { status: 400 })
    }

    // Validate key by calling Stripe
    const stripe = createStripeClient(stripeKey)
    try {
      await stripe.balance.retrieve()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invalid key'
      return NextResponse.json({ error: `Stripe validation failed: ${msg}` }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const encryptedKey = encryptKey(stripeKey)

    const { error } = await supabase.from('stripe_connections').upsert({
      user_id: user.id,
      stripe_key: encryptedKey,
      is_test_mode: isTestKey(stripeKey),
    })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Trigger sync in background (fire and forget for now)
    const base = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
    fetch(`${base}/api/stripe/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: user.id }),
    }).catch(() => {})

    return NextResponse.redirect(new URL('/dashboard/overview', request.url))
  } catch (err) {
    // Logged rather than swallowed: a silent 500 here is indistinguishable
    // from a working route in production logs.
    console.error('[stripe/connect]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
