# Donation Flow — Empowr Heroes

End-to-end reference for how a donation works — from the first page load through to the Notion record and welcome email. Written for a developer or agent picking up the project cold.

---

## Overview

```
User → Home → Become/Tiers → Tier Detail → Checkout → Stripe (external) → Webhook → Thank You
                                                                 ↓
                                                    Resend (welcome email)
                                                    Notion (donation log)
                                                    Internal alert
```

---

## 1. Entry — Home Page (`/`)

The user arrives at `hero.empowrcic.org`. The home page communicates the mission and warms them up:

- **Hero section:** Mission statement + "Become a Hero Today" CTA
- **Impact cards:** 4 columns — workforce, health services, communities, economy
- **Three pillars:** Grow through action / Find belonging / Build wellbeing
- **Support list:** What contributions fund
- **Tier preview grid:** 6 cards (seed through legacy + one-time)
- **Founding Patron teaser:** Link to `/patron`
- **Mantra block:** Brand tagline

---

## 2. Tier Selection — `/become` or `/tiers`

Two routes lead to tier selection:

**`/become`** — full marketing treatment:
- All 6 monthly tiers displayed with emoji, name, price, description
- One-time giving card
- "Most Popular" badge driven by Notion analytics (see [Analytics](#analytics) below)
- Each card has: "Choose This Tier" button → `/checkout?tier=X` and "Find out more" → `/tiers/{tier}`
- Founding Patron reveal section at bottom

**`/tiers`** — compact comparison layout:
- Horizontal rows (desktop) with tier details and dual action buttons

---

## 3. Tier Detail Pages — `/tiers/{seed|momentum|community|champion|legacy|onetime}`

Optional step — user can skip directly to checkout.

Each tier has a dedicated page with:
- Hero section: large emoji, tier name, price, tagline
- Impact breakdown: 4–6 custom impact areas specific to that tier level
- Role quotes: "What a £X/month Hero looks like"
- Benefits checklist
- CTA gradient band linking to checkout

---

## 4. Checkout Confirmation — `/checkout?tier={name}`

Pre-payment consent gate. URL param `?tier=name` drives the UI.

- Displays: tier emoji, name, price, description (read from `src/lib/tiers.ts`)
- Legal links: Legal Disclaimer, T&Cs, Privacy Policy (hosted on `legalhub.pecuvate.com`)
- Checkbox consent gate — "Proceed to Payment" button is disabled until checked
- On click: opens Stripe Payment Link URL (from `src/lib/tiers.ts`) in same tab

**Component:** `src/components/CheckoutConfirm.tsx` — client component that manages checkbox state.

---

## 5. Stripe Payment (External)

User is now on Stripe's hosted payment page. Stripe handles all PCI compliance.

- User enters card details and billing info
- Stripe creates a `PaymentIntent` (one-time) or `Subscription` (monthly)
- On success: Stripe fires a webhook to `/.netlify/functions/stripe-webhook`
- On success: Stripe redirects user to `/thankyou?tier={name}` (configured in the Stripe Payment Link settings)

**Important:** Each Stripe Payment Link must have a metadata field `tier: "seed"` (or equivalent) set manually in the Stripe Dashboard. This is how the webhook handler identifies which tier was purchased.

---

## 6. Webhook Processing — `/.netlify/functions/stripe-webhook`

The Netlify Function is a thin adapter. It verifies the Stripe webhook signature and passes the raw event to `src/core/donation-handler.ts`.

### Events Handled

**`checkout.session.completed`** — New donation (monthly or one-time)
1. Extract from event: donor name, email (from `customer_details`), amount, currency, tier (from Payment Link metadata), Stripe session ID, subscription ID
2. Send donor email via Resend (HTML + plain text):
   - To: donor's email
   - From: `hero@empowrcic.org`
   - `tier === 'onetime'` → one-time thank-you (no badge)
   - known monthly tier → welcome email with tier card, badge image (S3 PNG), Stripe portal link, mantra block
   - **tier unresolved** → falls back to the one-time thank-you so a paying donor always hears from us
3. Send internal notification to `hero@empowrcic.org`. An unresolved tier sends an `ACTION NEEDED` alert instead — it means a Payment Link is missing its `tier` metadata in Stripe
4. Log record to Notion Donations DB:
   - Record title: tier label
   - Fields: Tier, Amount, Currency, Date, Email Status, Stripe Dashboard URL, Subscription ID, Status
   - Notion failure is caught and logged, never thrown — the email has already been sent

**`customer.subscription.deleted`** — Subscription cancelled
1. Update Notion record: Status → "Cancelled"
2. Log cancellation reason (from Stripe feedback field)
3. Send internal cancellation notification to `hero@empowrcic.org`

**`invoice.payment_failed`** — Payment failed
1. Update Notion record: Status → "Payment Failed"
2. Send internal payment-failed notification to `hero@empowrcic.org`, including Stripe's `attempt_count`

Any other event type is ignored and logged. Note that **`customer.subscription.created` is not handled** — the subscription ID is captured from `checkout.session.completed` instead.

### Notion Schema

Each record in `Empowr Heroes Donations DB` contains:

| Field | Type | Description |
|---|---|---|
| Record (Title) | Text | Tier name |
| Donor ID | Auto | DON-xxx (auto-generated) |
| Email | Text | Donor email address |
| Tier | Select | seed / momentum / community / champion / legacy |
| Amount | Number | Payment amount (2 decimal places) |
| Currency | Select | GBP, USD, etc. |
| Date | Date | Transaction timestamp |
| Email Status | Select | Success / Failed |
| Stripe Dashboard | URL | Link to Stripe session |
| Subscription ID | Text | For recurring donations |
| Status | Select | Active / Cancelled / Payment Failed |
| Cancellation Reason | Text | Stripe feedback + comment |
| Record Created | Auto | Notion auto-timestamp |
| Last Updated | Auto | Notion auto-timestamp |

---

## 7. Thank You — `/thankyou?tier={name}`

Post-payment landing page. Stripe redirects here automatically.

- Confetti emoji + "You're now officially an Empowr Hero"
- Tier pill (validated from `?tier` param)
- Three steps shown to the user:
  1. Check inbox for welcome email
  2. Download Hero badge
  3. Share on social
- Badge teaser box
- Social share buttons: Instagram, LinkedIn share (pre-filled), Refer Friend (mailto template)
- Navigation: Home or See Other Heroes

Separate variant at `/thankyou/onetime` for one-time gifts.

---

## 8. Email System

**Provider:** Resend  
**Sending domain:** `empowrcic.org` — the **apex** domain, verified in Resend  
**From address:** `Empowr Heroes <hero@empowrcic.org>`

> ⚠️ Not `heroes@hero.empowrcic.org`. This document, `CLAUDE.md` and `memory.md` all claimed that address until 2026-08-10. It would not work: `hero.empowrcic.org` has **no MX, SPF, DKIM or DMARC**. Authentication lives on the apex — DKIM at `resend._domainkey.empowrcic.org`, return-path `send.empowrcic.org` → `feedback-smtp.eu-west-1.amazonses.com`.

### Templates (in `src/core/email-template.js`)

| Template | Trigger | Recipient |
|---|---|---|
| Monthly donation welcome | `checkout.session.completed`, known monthly tier | Donor |
| One-time donation welcome | `checkout.session.completed`, `tier === 'onetime'` **or** tier unresolved | Donor |
| Internal new donation | Same — `ACTION NEEDED` variant if tier unresolved | `hero@empowrcic.org` |
| Internal cancellation | `customer.subscription.deleted` | `hero@empowrcic.org` |
| Internal payment failed | `invoice.payment_failed` | `hero@empowrcic.org` |

All templates have both HTML and plain-text variants. Badge images are served from S3 (PNG) — they won't display in local testing (localhost not publicly accessible), which is expected.

Preview emails locally with: `npm run preview:email`

---

## Analytics

**Most Popular Tier Badge logic** (`src/lib/analytics.ts`):

- Queries Notion Donations DB (cached 1 hour)
- Counts donations per tier
- Shows "Most Popular" badge on `/become` **only if**:
  - The leading tier has 20+ total donations, AND
  - It leads second place by 20+ donations
- Below that threshold: badge does not display (avoids premature signals)

---

## Supplementary Pages

| Route | Purpose |
|---|---|
| `/patron` | Founding Patron programme (£100k+ annual/multi-year, by invitation) |

`/why-experiential-learning` was removed on 2026-08-10. It duplicated `empowrcic.org/experiential-learning/report` word for word while having no inbound links and zero pageviews since launch; the Main Site copy is canonical. Source preserved at `Empowr CIC/_trash/empowr-heroes-nextjs/`.

---

## Data Sources

All flow-critical data lives in typed library files — not hardcoded in components:

| File | Contains |
|---|---|
| `src/lib/tiers.ts` | Tier names, prices, descriptions, Stripe Payment Link URLs |
| `src/lib/links.ts` | All external URLs (social, legal, portal, email, main site) |
| `src/lib/badges.js` | S3 badge image URLs (5 tiers — no onetime badge) |
| `src/core/donation-handler.ts` | All webhook business logic — imports `tiers.ts` directly for email/Notion tier data, no separate config file |
| `src/core/email-template.js` | All email HTML/text builders |
