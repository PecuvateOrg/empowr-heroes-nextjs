'use client'

import { useState } from 'react'
import posthog from 'posthog-js'
import { LINKS } from '@/lib/links'
import { TIERS, type TierKey } from '@/lib/tiers'

export default function CheckoutConfirm({
  stripeUrl,
  tierKey,
  project,
}: {
  stripeUrl: string
  tierKey: TierKey
  project?: string | null
}) {
  const [agreed, setAgreed] = useState(false)
  // Stripe delivers this back on session.client_reference_id in the webhook —
  // see donation-handler.ts. Appended as a URL param, not metadata, because
  // Payment Link metadata is fixed per-link in the dashboard and can't vary
  // per project.
  const finalStripeUrl = project ? `${stripeUrl}?client_reference_id=${encodeURIComponent(project)}` : stripeUrl

  return (
    <div className="checkout-confirm">
      <div className="checkout-disclaimer">
        <p>
          Before proceeding, please read our{' '}
          <a href={LINKS.policy.legalDisclaimer} target="_blank" rel="noopener noreferrer">Legal Disclaimer</a>.
          By making a donation you also agree to our{' '}
          <a href={LINKS.policy.termsAndConditions} target="_blank" rel="noopener noreferrer">Terms &amp; Conditions</a>{' '}
          and{' '}
          <a href={LINKS.policy.privacyPolicy} target="_blank" rel="noopener noreferrer">Privacy Policy</a>.
        </p>
      </div>

      <label className="checkout-checkbox">
        <input
          type="checkbox"
          checked={agreed}
          onChange={e => setAgreed(e.target.checked)}
        />
        <span>I have read and agree to the Legal Disclaimer, Terms &amp; Conditions, and Privacy Policy</span>
      </label>

      <a
        href={agreed ? finalStripeUrl : undefined}
        className={`btn btn-blue checkout-btn${!agreed ? ' btn-disabled' : ''}`}
        aria-disabled={!agreed}
        onClick={e => {
          if (!agreed) { e.preventDefault(); return }
          // The last thing we can observe before the donor leaves for Stripe.
          // Without it the funnel ends at the /checkout pageview and there is
          // no way to tell "abandoned on Stripe" from "never clicked".
          // Deliberately fire-and-forget: never delay navigation on the money
          // path to wait for analytics.
          posthog.capture('donation_started', {
            tier: tierKey,
            tier_name: TIERS[tierKey].name,
            price: TIERS[tierKey].price,
            is_recurring: tierKey !== 'onetime',
            ...(project && { project }),
          })
        }}
      >
        Proceed to Payment →
      </a>
    </div>
  )
}
