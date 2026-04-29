# Empowr Heroes — Claude Project Context

Read this file at the start of every session before doing anything else.
Also read: `DEVLOG.md`, `src/lib/links.ts`, `src/lib/tiers.ts`.

---

## What This Project Is

Next.js 14 site for the **Empowr Heroes Programme** by **Empowr CIC** (a UK Community Interest Company).

**Empowr CIC mission:** To promote lifelong wellbeing through experiential learning. Empowr works with people of **all ages** — not just young people.
Hosted on **Netlify**. Repo: `Pecuvate/empowr-heroes-nextjs` on GitHub (`main` branch).

The site allows supporters to become "Heroes" by choosing a monthly giving tier,
which routes them through a checkout page to Stripe. On successful payment, a Netlify
Function fires — verifying the webhook, sending a welcome email via Resend, and logging
the donation to a Notion database.

---

## Who You Are Working With

Non-technical founder. Communicates via voice-to-text — read messages for intent,
not literal wording. Understands the business well. Needs plain-language explanations
with real-world analogies. Always explain the *why* behind recommendations.

**Design principle established this project:** Everything should be built **agent-first** —
structured, typed, and programmatically accessible so AI agents can manage the platform
in the future. Human readability is secondary, not an afterthought.

---

## Project Structure

```
src/                          Application code (read src/CONTEXT.md first)
  app/                        Pages (Next.js app router)
  components/                 Shared UI components
  lib/
    links.ts                  ← ALL external URLs for the entire site (update here only)
    tiers.ts                  ← ALL tier data: names, prices, descriptions, Stripe URLs
  core/
    donation-handler.js       ← All webhook business logic (Stripe, Resend, Notion)
    email-template.js         ← HTML and plain text email builders (separated for easy updates)
netlify/
  functions/
    stripe-webhook.js         ← Thin Netlify adapter — calls src/core/donation-handler.js
public/
  badges/                     ← Badge assets (SVG + PNG). PNG versions used in emails.
  empowr-favicon-logo.png     (large, unused — kept for reference)
  favicon.ico                 Favicon (also served statically at /favicon.ico)
src/app/favicon.ico           Active favicon (ICO with 16×16 and 32×32 sizes)
planning/                     Pre-code specs and architectural decision records
docs/                         Process documentation — donation flow, email system
ops/                          Infrastructure, runbooks, dev scripts
DEVLOG.md                     ← Running log of every dev session and decisions made
README.md                     ← Setup guide and Stripe CLI local testing instructions
.env.example                  ← Documents all required environment variables
```

---

## Key Decisions & Rules

### Styling
- No Tailwind. All CSS is custom, in `src/app/globals.css` using CSS variables.
- Font: Nunito via `next/font/google`. Weights: 400, 500, 600, 700, 800, 900 + italic.
- **Never use raw hex values in components — always reference colours via `var(--variable-name)`.**

### Brand & Contact

**Email addresses — always use these exactly:**

| Purpose | Address |
|---|---|
| Hero contact (site links, email body) | `hero@empowrcic.org` |
| Patron contact | `patron@empowrcic.org` |
| Sending address (Resend, outbound emails) | `heroes@hero.empowrcic.org` |

All site contact links live in `src/lib/links.ts` — never hardcode.

**Colour palette — all defined as CSS variables in `src/app/globals.css`:**

| Variable | Value | Usage |
|---|---|---|
| `--blue` | `#4A70C2` | Primary brand colour |
| `--blue-dark` | `#3558a8` | Hover states |
| `--blue-light` | `#7093d4` | Lighter accents |
| `--blue-pale` | `#eef3fc` | Backgrounds |
| `--blue-soft` | `rgba(74,112,194,0.10)` | Subtle highlights |
| `--red` | `#FF6161` | Alerts / destructive |
| `--black` | `#1B1B1B` | Body text |
| `--mid` | `#4a4a4a` | Secondary text |
| `--muted` | `#7a7a8a` | Tertiary / captions |
| `--cream` | `#f8f7f4` | Page background |
| `--warm-white` | `#fdfcfa` | Card/section background |
| `--border` | `#e5e1db` | Standard borders |
| `--patron-gold` | `#b8924a` | Patron tier accent |

### Links
- **Never hardcode external URLs in components or pages.**
- All links live in `src/lib/links.ts` — import `LINKS` from there.
- Policy docs are hosted at `legalhub.pecuvate.com`.

### Tiers
- All tier data lives in `src/lib/tiers.ts` — import `TIERS` from there.
- Stripe URLs are in `src/lib/tiers.ts` too.
- Tier metadata (`tier: seed` etc.) must also be set on each Stripe Payment Link manually in the Stripe dashboard.

### Donation Automation (src/core/)
- Business logic lives in `src/core/donation-handler.js` — no platform-specific code here.
- Email template lives in `src/core/email-template.js` — update this for any email copy or design changes.
- The Netlify function in `netlify/functions/stripe-webhook.js` is a thin adapter only — no logic belongs there.
- This architecture is intentionally portable — `src/core/` can be extracted into a standalone Pecuvate service in future.
- Stripe metadata field `tier` must be set on each Payment Link for the handler to identify the donor's tier.

### Badge Assets
- `public/badges/` contains both SVG and PNG versions of each badge.
- **Emails use PNG** — SVGs are not rendered by email clients.
- **Website can use SVG** — higher quality, smaller file size.
- Badge filenames: `seed-hero`, `momentum-hero`, `community-hero`, `champion-hero`, `legacy-hero` (no `onetime-hero`).
- Badge images in emails will not display when testing locally (localhost is not publicly accessible). This is expected — they display correctly in production.

### Cookie Banner
- **Active:** `CookieBanner` (simple — Accept/Decline only)
- **Ready but inactive:** `CookieBannerFull` (expandable settings panel with toggles)
- To swap: edit the two commented lines in `src/app/layout.tsx`
- Only activate `CookieBannerFull` when optional cookies are actually in use AND the cookie policy doc has been updated. See `DEVLOG.md` for full details.

### Favicon
- `src/app/favicon.ico` is the active favicon (Empowr logo, 16×16 and 32×32).
- To update: replace `src/app/favicon.ico` with a new ICO file. Keep `public/favicon.ico` in sync.

---

## Infrastructure

### DNS
- Domain registrar: **Namecheap**
- DNS management: **AWS Route 53** (migrated from Wix)
- Wix still serves the `empowrcic.org` website — DNS just moved to Route 53 for full control

### Email Sending
- Provider: **Resend**
- Sending domain: `hero.empowrcic.org` (verified in Resend)
- Sending address: `heroes@hero.empowrcic.org`

### Notion
- Donations database: `Empowr Heroes Donations DB` (moved to new Notion workspace April 2026)
- Database ID: `2d5e1485c4e1821baaed01000f3df0aa`
- Data Source ID: `86ae1485-c4e1-8269-ba31-870796a355e1` (collection ID — used in `donation-handler.js` for querying; distinct from the database page ID)
- Integration name: `Empowr Heroes Webhook`
- Schema: Name, Donor ID (auto DON-xxx), Email, Tier, Amount, Currency, Date, Email Status, Stripe Session ID, Record Created, Last Updated, Subscription ID, Status, Cancellation Reason

### Environment Variables
See `.env.example` for full list. All must be set in Netlify > Site configuration > Environment variables for production.

---

## Before Starting Work

1. Read `DEVLOG.md` — check the latest session and the deferred issues list
2. Check `src/lib/links.ts` if any policy or contact links are involved
3. Check `src/lib/tiers.ts` if any tier data is involved
4. Check `src/core/donation-handler.js` and `src/core/email-template.js` if anything touches the donation flow or email
5. Run `npx tsc --noEmit` before committing anything to catch type errors early

## Before Ending a Session

1. Update `DEVLOG.md` with a summary of what was done
2. Update `CLAUDE.md` if any new infrastructure, architecture decisions, or rules were established
3. Prompt the user to commit and push if not already done
