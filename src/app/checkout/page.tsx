import Link from 'next/link'
import { notFound } from 'next/navigation'
import CheckoutConfirm from '@/components/CheckoutConfirm'
import { TIERS, type TierKey } from '@/lib/tiers'

export const metadata = {
  title: 'Confirm Your Contribution — Empowr Heroes',
  description: 'Review and confirm your Hero tier contribution to Empowr CIC. Your support helps us deliver experiential wellbeing programmes across the UK.',
}

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ tier?: string }>
}) {
  const { tier } = await searchParams
  const tierInfo = tier ? TIERS[tier as keyof typeof TIERS] : null

  if (!tierInfo) notFound()

  return (
    <main className="page-content page-checkout">
      <div className="wrap checkout-wrap">
        <Link href="/become" className="back-btn">← Back to Hero Tiers</Link>

        <div className="checkout-header">
          <div className="checkout-emoji">{tierInfo.emoji}</div>
          <h1 className="checkout-title">You're becoming a<br /><strong>{tierInfo.name}</strong></h1>
          <div className="checkout-price">{tierInfo.price}</div>
          <p className="checkout-desc">{tierInfo.lead} — {tierInfo.body}</p>
        </div>

        <CheckoutConfirm stripeUrl={tierInfo.stripeUrl} tierKey={tier as TierKey} />
      </div>
    </main>
  )
}
