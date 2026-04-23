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
| `runbooks/rotate-secrets.md` | How to update API keys across Netlify, Resend, and Notion |

---

## Infrastructure summary

| Layer | Provider |
|---|---|
| Hosting | Netlify |
| DNS | AWS Route 53 |
| Domain registrar | Namecheap |
| Email sending | Resend (`heroes@hero.empowrcic.org`) |
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

## Config files at project root (do not move)

- `netlify.toml` — Netlify build and header config (must be at root)
- `next.config.ts` — Next.js config
- `.env.example` — documents all required environment variables
