# Runbook: Add a New Giving Tier

---

## 1. Create the Stripe Payment Link

1. Log in to Stripe dashboard
2. Go to Payment Links → Create new
3. Set the product name, price, and billing interval (monthly)
4. Under **Metadata**, add: `tier` = `<tier-key>` (e.g. `seed`, `momentum`, `community`, `champion`, `legacy`)
   — This is critical. The webhook uses this to identify the donor's tier.
5. Under **Subscription settings → Metadata** (a *separate* field from the one
   above), add `tier` = `<tier-key>` and `app` = `heroes`.
   ⚠️ Payment Link `metadata` lands on the **Checkout Session**; only
   `subscription_data.metadata` reaches the **Subscription** object. The five
   existing links leave it empty, which is why Heroes' own subscriptions carry
   no marker at all and the webhook has to identify them structurally.
6. Copy the Payment Link URL

---

## 2. Register the Product ID in `src/core/event-ownership.ts` 🔴 DO NOT SKIP

Add the new tier's Stripe **Product** ID to `HEROES_PRODUCT_IDS`.

**If you skip this, the tier silently half-works.** Donations still arrive
(checkout sessions are identified by `payment_link`), but every
`customer.subscription.deleted` and `invoice.payment_failed` event for that
tier is **ignored** — no cancellation alert, no failed-payment alert, no Notion
row. Nothing errors; the events simply never reach a handler.

Why it works this way: the Empowr CIC Stripe account is **shared with the
Members platform**, and Stripe delivers every subscribed event type to every
endpoint on the account regardless of which app created the object. Ownership
is therefore resolved once, at dispatch, default-deny — see the header comment
in `event-ownership.ts`. Product ID is the signal because it is embedded in the
event payload (no extra API call) and works retroactively.

Find the Product ID: Stripe dashboard → Product catalogue → the tier's product
→ copy `prod_…`. Or `stripe prices retrieve <price_id>` and read `.product`.

Verify with `npm run verify:ownership` (add a case for the new tier).

---

## 3. Update `src/lib/tiers.ts`

Add the new tier to the `TIERS` array with all required fields: `id`, `name`, `price`, `description`, `stripeUrl`, and any badge/feature data.

---

## 4. Update `src/lib/badges.js`

Add the badge URL mapping for the new tier key. Ensure both SVG (for web) and PNG (for email) versions of the badge exist in `public/badges/`.

---

## 5. Upload badge assets

Upload the badge PNG to AWS S3: `empowr-cic` bucket, `badges/` prefix.
The file must be publicly accessible — the email template links to it directly.

---

## 6. Test locally

```bash
npm run preview:email -- <tier-key>
```

Open `ops/scripts/preview.html` in a browser and verify the badge and copy are correct.

---

## 7. Test the webhook end-to-end

```bash
npm run dev:netlify
npm run dev:stripe
```

Use Stripe test mode to trigger a `checkout.session.completed` event with the new tier metadata. Verify:
- Welcome email is received
- Notion row is created with the correct tier

---

## 8. Deploy

Merge to `main`. Netlify deploys automatically.
