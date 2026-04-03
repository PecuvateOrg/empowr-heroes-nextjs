# Empowr Heroes

Next.js 14 site for the **Empowr Heroes Programme** by **Empowr CIC**.

Hosted on Netlify. Supports monthly giving tiers routed through Stripe.

---

## Local Development

```bash
npm install
npm run dev
```

---

## Email Automation (Stripe Webhook)

When a donor completes a checkout, Stripe fires a webhook to a Netlify Function which:

1. Verifies the request is genuinely from Stripe
2. Sends a branded welcome email via Resend
3. Logs the donation to a Notion database

### Architecture

```
netlify/functions/stripe-webhook.js   ← thin adapter (handles HTTP)
core/donation-handler.js              ← all business logic (portable)
```

### Environment Variables

Copy `.env.example` to `.env.local` and fill in all values before running locally.

| Variable | Description |
|---|---|
| `STRIPE_SECRET_KEY` | Stripe secret key (`sk_test_...` or `sk_live_...`) |
| `STRIPE_WEBHOOK_SECRET` | Webhook signing secret (`whsec_...`) |
| `RESEND_API_KEY` | Resend API key (`re_...`) |
| `NOTION_API_KEY` | Notion integration token (`secret_...`) |
| `NOTION_DATABASE_ID` | ID of the Notion donations database |
| `SITE_URL` | Live site URL — used to build badge image URLs in emails |

All variables must also be set in **Netlify > Site configuration > Environment variables** for production.

---

### Stripe Payment Link Metadata

The webhook extracts the Hero tier from Stripe session metadata. You must add a `tier` metadata field to each Payment Link in the Stripe dashboard.

Go to **Stripe Dashboard > Payment Links > [select link] > Edit > Metadata** and add:

| Payment Link | Key | Value |
|---|---|---|
| Seed Hero (£10/mo) | `tier` | `seed` |
| Momentum Hero (£25/mo) | `tier` | `momentum` |
| Community Hero (£50/mo) | `tier` | `community` |
| Champion Hero (£250/mo) | `tier` | `champion` |
| Legacy Hero (£500/mo) | `tier` | `legacy` |

Donor name and email are captured automatically by Stripe from billing details.

---

### Notion Database Setup

Create a Notion database with the following properties before going live:

| Property name | Type |
|---|---|
| Name | Title |
| Email | Email |
| Tier | Select |
| Amount | Number |
| Currency | Text |
| Date | Date |
| Email Status | Select |

Then share the database with your Notion integration and copy the database ID into `NOTION_DATABASE_ID`.

---

### Testing the Webhook Locally with Stripe CLI

The Stripe CLI lets you forward real Stripe events to your local machine so you can test the webhook without deploying.

#### 1. Install the Stripe CLI

Download from [stripe.com/docs/stripe-cli](https://stripe.com/docs/stripe-cli) and log in:

```bash
stripe login
```

#### 2. Start the Netlify dev server

```bash
npx netlify dev
```

This runs your site and Netlify Functions locally, typically on `http://localhost:8888`.

#### 3. Forward Stripe events to your local function

In a second terminal:

```bash
stripe listen --forward-to http://localhost:8888/.netlify/functions/stripe-webhook
```

The CLI will print a webhook signing secret starting with `whsec_`. Copy this and set it as `STRIPE_WEBHOOK_SECRET` in your `.env.local` — it is different from your production webhook secret.

#### 4. Trigger a test event

In a third terminal, simulate a completed checkout:

```bash
stripe trigger checkout.session.completed
```

You should see the event appear in the Stripe CLI output, and the function logs should show the email being sent and the Notion row being created.

#### 5. Test with a specific tier

To test with real metadata (tier, name, email), use the Stripe dashboard to create a test Payment Link with the `tier` metadata set, complete a test checkout, and the CLI will forward the real event to your local function.

---

## Deployment

Push to `main` — Netlify deploys automatically.

Webhook endpoint to register in Stripe dashboard (production):

```
https://[your-netlify-site]/.netlify/functions/stripe-webhook
```

Select the event: `checkout.session.completed`
