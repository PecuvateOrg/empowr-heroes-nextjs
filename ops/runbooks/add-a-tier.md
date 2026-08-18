# Runbook: Add a New Giving Tier

---

## 1. Create the Stripe Payment Link

1. Log in to Stripe dashboard
2. Go to Payment Links → Create new
3. Set the product name, price, and billing interval (monthly)
4. Under **Metadata**, add: `tier` = `<tier-key>` (e.g. `seed`, `momentum`, `community`, `champion`, `legacy`)
   — This is critical. The webhook uses this to identify the donor's tier.
5. Copy the Payment Link URL

---

## 2. Update `src/lib/tiers.ts`

Add the new tier to the `TIERS` array with all required fields: `id`, `name`, `price`, `description`, `stripeUrl`, and any badge/feature data.

---

## 3. Update `src/lib/badges.js`

Add the badge URL mapping for the new tier key. Ensure both SVG (for web) and PNG (for email) versions of the badge exist in `public/badges/`.

---

## 4. Upload badge assets

Upload the badge PNG to AWS S3: `empowr-cic` bucket, `badges/` prefix.
The file must be publicly accessible — the email template links to it directly.

---

## 5. Test locally

```bash
npm run preview:email -- <tier-key>
```

Open `ops/scripts/preview.html` in a browser and verify the badge and copy are correct.

---

## 6. Test the webhook end-to-end

```bash
npm run dev:netlify
npm run dev:stripe
```

Use Stripe test mode to trigger a `checkout.session.completed` event with the new tier metadata. Verify:
- Welcome email is received
- Notion row is created with the correct tier

---

## 7. Deploy

Merge to `main`. Netlify deploys automatically.
