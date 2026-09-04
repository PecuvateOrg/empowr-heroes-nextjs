# ops/ — Infrastructure and Operations

This workspace covers deployment, infrastructure, and operational tooling.

---

## What lives here

| Path | Purpose |
|---|---|
| `scripts/preview-email.js` | Renders the email template to HTML for local browser preview |
| `scripts/preview.html` | Generated output — open in browser after running the script |
| `runbooks/add-a-tier.md` | Step-by-step: how to add a new giving tier |
| `runbooks/deploy-checklist.md` | Pre-deploy / pre-merge checklist |

Rotating an API key is **not** documented here. The procedure is workspace-level
(`_config/guides/environment.md` → "Rotating a credential"), the variable list is in
`_config/registry/env-vars.md` → `empowr-heroes`, and where to get a replacement value
is in `_config/registry/third-party-services.md` per service. This repo previously
carried its own copy; it had already drifted — it listed six variables when the
project uses eight.

---

## Infrastructure summary

| Layer | Provider |
|---|---|
| Hosting | Netlify |
| DNS | AWS Route 53 |
| Domain registrar | Namecheap |
| Email sending | Resend — sends from `hero@empowrcic.org`, the **apex** domain. Not `hero.empowrcic.org`: that subdomain has no MX, SPF, DKIM or DMARC (verified 2026-08-10) and mail from it fails outright. See `docs/donation-flow.md` §8. |
| Payment processing | Stripe (Payment Links) |
| Donation logging | Notion (`Empowr Heroes Donations DB`) |
| Badge assets | AWS S3 (`empowr-cic` bucket, `badges/` prefix) |

---

## Running the email preview script

```bash
npm run preview:email              # defaults to community tier
npm run preview:email -- seed
npm run preview:email -- legacy
npm run preview:email -- onetime
```

Then open `ops/scripts/preview.html` in a browser. Refresh after each regeneration.

---

## Verifying a Stripe webhook secret locally

Needed after rotating `STRIPE_WEBHOOK_SECRET`, and whenever the webhook handler changes.

```bash
npm run dev:netlify     # netlify dev — serves functions on :8888
npm run dev:stripe      # stripe listen --forward-to .../stripe-webhook
```

Then trigger a test event and confirm the handler processes it. A signature that
verifies is not enough on its own: this account is **shared with Empowr Members** and
Stripe delivers every subscribed event to every endpoint, so also confirm the handler
still rejects events that are not Heroes'. `npm run verify:ownership` covers that.

---

## Config files at project root (do not move)

- `netlify.toml` — Netlify build and header config (must be at root)
- `next.config.ts` — Next.js config
- `.env.example` — documents all required environment variables
