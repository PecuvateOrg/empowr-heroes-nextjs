'use client'

import { useState } from 'react'

export default function CheckoutConfirm({ stripeUrl }: { stripeUrl: string }) {
  const [agreed, setAgreed] = useState(false)

  return (
    <div className="checkout-confirm">
      <div className="checkout-disclaimer">
        <p>
          Before proceeding, please read our{' '}
          <a href="https://legalhub.pecuvate.com/share/empowr/donor-information-and-legal-disclaimer" target="_blank" rel="noopener noreferrer">Legal Disclaimer</a>.
          By making a donation you also agree to our{' '}
          <a href="https://legalhub.pecuvate.com/share/empowr/empowr-terms-and-conditions" target="_blank" rel="noopener noreferrer">Terms &amp; Conditions</a>{' '}
          and{' '}
          <a href="https://legalhub.pecuvate.com/share/empowr/empowr-privacy-policy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>.
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
        href={agreed ? stripeUrl : undefined}
        target="_blank"
        rel="noopener noreferrer"
        className={`btn btn-blue checkout-btn${!agreed ? ' btn-disabled' : ''}`}
        aria-disabled={!agreed}
        onClick={e => { if (!agreed) e.preventDefault() }}
      >
        Proceed to Payment →
      </a>
    </div>
  )
}
