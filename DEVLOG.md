# Empowr Heroes — Dev Log

A running record of development sessions, changes made, and decisions taken.

---

## Session — 5 April 2026 (continued)

### Badge Email & Future Badge Page

#### Badge removed from email
Removed the badge image from the hero welcome email. Replaced the download button with a simple "View your badge →" link pointing directly to the S3 badge URL. S3 badges updated to `Content-Disposition: inline` so clicking the link opens the image in the browser.

Reasoning: cleaner email, better user experience — the reveal of seeing the badge for the first time is more impactful as a separate moment after clicking through.

#### Deferred — Dedicated badge page
Future feature: create a `/badge/[tier]` page on the site that displays the donor's badge with options to share, copy the link, or save the image. The "View your badge →" email link would point here instead of directly to S3. This page could include social share buttons and a proper download button.

---

## Session — 5 April 2026

### Production Go-Live Completion, GDPR Data Minimisation & Email Improvements

---

#### Stripe Payment Link Metadata
All 5 Payment Links confirmed with `tier` metadata set in Stripe dashboard (seed, momentum, community, champion, legacy).

---

#### Email Address Fixes
Corrected `hero@empowr-cic.org` → `hero@empowrcic.org` and `patron@empowr-cic.org` → `patron@empowrcic.org` across `core/email-template.js` and `lib/links.ts`.

---

#### Brand Rulebook Added to CLAUDE.md
Added **Brand & Contact** section covering canonical email addresses and full colour palette. Rule: never use raw hex values — always `var(--variable-name)`.

---

#### Netlify CLI Setup
Installed Netlify CLI, authenticated via GitHub, linked to `empowr-heroes` site. All Netlify env var changes can now be made from the terminal.

---

#### Production Environment Variables
All 6 env vars set in Netlify via `netlify env:set`: `STRIPE_SECRET_KEY` (live), `STRIPE_WEBHOOK_SECRET`, `RESEND_API_KEY`, `NOTION_API_KEY`, `NOTION_DATABASE_ID`, `SITE_URL`.

---

#### Stripe Webhook Registered
Live webhook registered at `https://hero.empowrcic.org/.netlify/functions/stripe-webhook` for `checkout.session.completed`. Signing secret saved to Netlify.

---

#### GDPR Data Minimisation — Notion
Removed donor name and email from Notion. Notion now stores operational data only (tier, amount, currency, date, email status, Stripe Dashboard link). Personal data stays in Stripe.

- `Name` field renamed to `Record` — populated with tier label (e.g. "Community Hero")
- `Email` field removed
- `Stripe Session ID` (text) replaced with `Stripe Dashboard` (URL) — clickable link direct to Stripe session, auto-detects test vs live from session ID prefix

---

#### One-Time Donor Flow
- New thank you page at `/thankyou/onetime` — same layout as hero page, no badge, CTA to become a monthly Hero
- New thank you email for one-time donors — no badge, includes "Become a Hero" card with benefits and CTA button
- Handler updated to detect `onetime` tier and send the correct email

After-payment redirect on Stripe one-time Payment Link set to `https://hero.empowrcic.org/thankyou/onetime` ✓

---

#### Badge Images Moved to S3
- All 5 badge PNGs uploaded to `s3://empowr-cic/badges/`
- `Content-Disposition: attachment` set on all files to trigger browser download
- `BADGE_BASE_URL` constant added to `email-template.js` — single source of truth
- Badge PNGs removed from `public/badges/` (SVGs kept for website use)
- Badge repositioned in email — now appears between tier card and closing message, larger (160px)
- Download button added below badge

**Known issue:** Download button behaviour in email clients needs further investigation — deferred to next session.

---

#### Code Sweep Fixes
- `tier` removed as unused param from `buildEmailHtml` and `buildEmailText`
- `onetime` tier no longer incorrectly flagged as unknown tier in handler
- JSDoc and fallback URL corrected from `heroes.empowr-cic.org` → `hero.empowrcic.org`

---

#### npm Scripts Added
```
npm run dev:netlify   ← starts Netlify dev server
npm run dev:stripe    ← starts Stripe CLI webhook listener
```

---

## Session — 4 April 2026

### Production Deployment — Donation Automation Go-Live

Completed all remaining steps to take the donation automation live in production.

---

#### Email Address Fixes

Corrected a typo in the contact email address across two files — `empowr-cic.org` → `empowrcic.org`:

- `core/email-template.js` — plain text email body
- `lib/links.ts` — both `hero@` and `patron@` contact links

---

#### Brand Rulebook Added to CLAUDE.md

Added a **Brand & Contact** section to `CLAUDE.md` covering:
- Canonical email addresses (hero, patron, sending address) — never to be guessed or abbreviated
- Full colour palette as a reference table (CSS variables with hex values and usage notes)
- Rule: never use raw hex values in components — always reference via `var(--variable-name)`

---

#### Netlify CLI Setup

Installed and configured the Netlify CLI for terminal-based site management:

```bash
npm install -g netlify-cli
netlify login        # authenticated via GitHub
netlify link         # linked to empowr-heroes site (hero.empowrcic.org)
```

All future Netlify env var changes can now be made from the terminal without touching the dashboard.

---

#### Environment Variables Set in Netlify Production

All required env vars set via `netlify env:set`:

| Variable | Notes |
|---|---|
| `STRIPE_SECRET_KEY` | Live key (`sk_live_...`) |
| `STRIPE_WEBHOOK_SECRET` | From Stripe webhook registration (see below) |
| `RESEND_API_KEY` | Copied from local env |
| `NOTION_API_KEY` | Copied from local env |
| `NOTION_DATABASE_ID` | `9760dd1c24f0437d8b0bbae87524636a` |
| `SITE_URL` | `https://hero.empowrcic.org` |

---

#### Stripe Webhook Registered

Registered the live webhook endpoint in Stripe dashboard:

- **URL:** `https://hero.empowrcic.org/.netlify/functions/stripe-webhook`
- **Event:** `checkout.session.completed`
- **Name:** `Empowr Heroes — Donation Handler`
- Signing secret saved to Netlify as `STRIPE_WEBHOOK_SECRET`

---

#### Stripe Payment Link Metadata

`tier` metadata added to all Payment Links in Stripe dashboard (completed this session):

| Payment Link | Key | Value |
|---|---|---|
| Seed Hero (£10/mo) | `tier` | `seed` |
| Momentum Hero (£25/mo) | `tier` | `momentum` |
| Community Hero (£50/mo) | `tier` | `community` |
| Champion Hero (£250/mo) | `tier` | `champion` |
| Legacy Hero (£500/mo) | `tier` | `legacy` |

---

#### Status

Donation automation is now fully live. Netlify processes webhooks 24/7 — no local machine required. A live end-to-end test is recommended to confirm production flow.

---

## Session — 3 April 2026

### Email Automation — Stripe Webhook, Resend, Notion

Built a complete end-to-end donation automation flow. When a donor completes a checkout, the system automatically sends a branded welcome email and logs the donation to a Notion database.

---

#### Architecture — Agent-First, Split Design

Deliberately built with portability in mind. The logic is split into two layers:

```
core/donation-handler.js              ← all business logic (no platform dependency)
netlify/functions/stripe-webhook.js   ← thin Netlify adapter (handles HTTP only)
```

The core module is self-contained and can be extracted into a standalone Pecuvate service in the future without any changes to the logic itself.

---

#### What Was Built

**`core/donation-handler.js`**
- Verifies Stripe webhook signature
- Extracts donor name, email, and tier from session metadata and billing details
- Sends a branded HTML welcome email via Resend (with plain text fallback)
- Logs donation to Notion with: Name, Email, Tier, Amount, Currency, Date, Email Status, Stripe Session ID, Donor ID (auto-increment), Record Created, Last Updated
- Errors are caught gracefully — a Resend or Notion failure does not crash the webhook or cause Stripe to retry

**`netlify/functions/stripe-webhook.js`**
- Receives POST request from Stripe
- Passes raw body and signature header to core handler
- Returns 200 to Stripe

**Email**
- Sent from `heroes@hero.empowrcic.org`
- Subject: `You're an Empowr Hero`
- Branded HTML email welcoming donor by name, confirming tier, including badge
- Plain text fallback included
- Handles all 5 badge tiers (seed, momentum, community, champion, legacy)

**Notion Database**
- Created `Donations` database inside `Empowr Heroes — Donor Hub` page in Notion
- Schema: Name (Title), Donor ID (Auto-increment, prefix DON), Email, Tier (Select), Amount (£), Currency (Select), Date, Email Status (Select), Stripe Session ID (Text), Record Created, Last Updated

---

#### Stripe Payment Link Metadata

Metadata must be added manually to each Payment Link in the Stripe dashboard:

| Payment Link | Key | Value |
|---|---|---|
| Seed Hero (£10/mo) | `tier` | `seed` |
| Momentum Hero (£25/mo) | `tier` | `momentum` |
| Community Hero (£50/mo) | `tier` | `community` |
| Champion Hero (£250/mo) | `tier` | `champion` |
| Legacy Hero (£500/mo) | `tier` | `legacy` |

Only Community Hero metadata had been added by end of session — others to be added before going live.

---

#### Infrastructure — DNS Migration to AWS Route 53

Migrated DNS management for `empowrcic.org` from Wix to AWS Route 53 to enable subdomain MX records (required by Resend for bounce handling).

- All existing DNS records exported from Wix and recreated in Route 53 via zone file import
- Nameservers updated in Namecheap from Wix (`ns14/ns15.wixdns.net`) to Route 53
- Propagated globally within minutes
- Wix website and Google Workspace email unaffected

**Resend domain verification records added to Route 53:**

| Type | Name | Value |
|---|---|---|
| TXT | `resend._domainkey.hero` | DKIM public key |
| TXT | `send.hero` | `v=spf1 include:amazonses.com ~all` |
| MX | `send.hero` | `feedback-smtp.eu-west-1.amazonses.com` (priority 10) |

---

#### Dependencies Added

```
stripe
resend
@notionhq/client
```

---

#### Environment Variables Required

| Variable | Purpose |
|---|---|
| `STRIPE_SECRET_KEY` | Stripe API authentication |
| `STRIPE_WEBHOOK_SECRET` | Webhook signature verification |
| `RESEND_API_KEY` | Resend email sending |
| `NOTION_API_KEY` | Notion integration token |
| `NOTION_DATABASE_ID` | `9760dd1c24f0437d8b0bbae87524636a` |
| `SITE_URL` | Used to build badge image URLs in emails |

---

#### Tested

Full end-to-end test completed locally using Stripe CLI + `netlify dev`:
- Stripe signature verified ✓
- Community Hero metadata read correctly ✓
- Welcome email delivered to real inbox ✓
- Donation row created in Notion with all fields populated ✓

---

#### Deferred / Still To Do

- Set all env vars in Netlify production environment
- Register webhook endpoint in Stripe dashboard for production: `https://hero.empowrcic.org/.netlify/functions/stripe-webhook`
- Switch `STRIPE_SECRET_KEY` back to live key (`sk_live_...`) for production
- Fix contact email address in `core/email-template.js`

---

#### Follow-up — Email Template Separation & Badge PNG Conversion

Done in same session, committed separately.

**Email template extracted:**
- Moved `buildEmailHtml` and `buildEmailText` out of `donation-handler.js` into `core/email-template.js`
- `donation-handler.js` now imports from the template file
- Reason: template will change independently of handler logic — cleaner separation for future agent management

**Badge assets converted to PNG:**
- All 5 badge SVGs converted to PNG using `sharp` (already a project dependency)
- PNG files added to `public/badges/` alongside SVGs
- `TIER_CONFIG` badge filenames updated from `.svg` to `.png`
- Reason: SVG images are not rendered by email clients (Gmail, Outlook, Apple Mail)
- Note: Badge images will not display in test emails sent from localhost — this is expected. They will display correctly once the site is deployed and `SITE_URL` is set to the live domain in Netlify env vars.

**Sending address updated:**
- From: `heroes@empowr.com` → `heroes@hero.empowrcic.org`

---

## Session — 27 March 2026

### Cookie Banner

**Problem:** The original cookie banner had no animation and only an "Accept All / Decline" prompt with no explanation of what cookies were being used or why.

**What we built:**
- Added a slide-up animation on entry and slide-down on dismiss
- Restructured the banner with clearer copy
- Had a full discussion about GDPR and cookie categories (Strictly Necessary, Analytics, Functional) — decided to keep the live banner simple since no optional cookies are currently in use
- Built a second component `CookieBannerFull` which is ready to swap in when optional cookies are added. It features a compact bar with **Decline / Cookie Settings / Accept All**, and "Cookie Settings" expands an upward panel with toggles for each category

**Decision:** Only show cookie categories that are actually being used. Showing toggles for non-existent cookies is misleading under GDPR.

**How to activate the full banner:**
1. Add the optional cookie service to the codebase (e.g. Google Analytics), gated on consent
2. Update the cookie policy document at legalhub.pecuvate.com
3. In `app/layout.tsx`, comment out `<CookieBanner />` and uncomment `<CookieBannerFull />`

---

### Performance Audit & Fixes

Ran a full sweep of the source code for performance issues. Key findings and fixes:

| Fix | File(s) | Impact |
|---|---|---|
| Added `priority` prop to nav logo | `components/Nav.tsx` | Faster LCP — logo now loads first |
| Removed unused font weight `300` | `app/layout.tsx` | One fewer font file downloaded |
| Enabled AVIF/WebP image formats | `next.config.ts` | 30–50% smaller images for modern browsers |
| Replaced 426KB PNG favicon with SVG | `app/icon.svg` | 99.9% size reduction (500 bytes) |
| Added `description` to all pages missing it | All tier pages, checkout, patron, thankyou | SEO and social sharing |
| Extracted tier data to shared file | `lib/tiers.ts` | Single source of truth for all tier info |

**Note on favicon:** The SVG is a placeholder (blue square, white "E"). To replace with the actual Empowr logo, visit favicon.io, upload the logo PNG, download the output, rename to `icon.png` or `icon.ico` and drop into the `app/` folder.

---

### Centralised Links (`lib/links.ts`)

**Problem:** External URLs were hardcoded in multiple files. Updating a link required tracking down every file that used it — and some files had already gone stale (CheckoutConfirm still had old policy URLs).

**Solution:** Created `lib/links.ts` as the single source of truth for all external links.

```
lib/
  links.ts   ← all external links (policy, email, assets)
  tiers.ts   ← tier names, prices, Stripe URLs
```

**Links managed:**
- `LINKS.policy.legalDisclaimer`
- `LINKS.policy.termsAndConditions`
- `LINKS.policy.privacyPolicy`
- `LINKS.policy.cookiePolicy`
- `LINKS.email.hero`
- `LINKS.email.patron`
- `LINKS.assets.logo`

To update any link across the entire site, edit `lib/links.ts` only.

---

### Other Fixes

- Fixed a TypeScript error on the thank you page when indexing `TIERS` — caused a Netlify deploy failure
- Updated Legal Disclaimer and Terms & Conditions links in the footer (URLs had changed)
- Fixed stale policy URLs in `CheckoutConfirm.tsx` that had not been updated when footer links changed
- Added `.claude/settings.local.json` to `.gitignore` to prevent Claude Code's local config appearing as a pending change

---

### Known Issues — Noted but Deferred

These were flagged during the performance audit but left as-is. No need to re-audit them next session.

| Issue | File | Reason deferred |
|---|---|---|
| `backdrop-filter: blur(14px)` on nav | `globals.css:51` | Design choice — removing/reducing would change the look |
| `@keyframes bob` infinite animation | `globals.css:713` | Decorative, only on thank you page, low impact |
| Inline styles on nav link and logo | `Nav.tsx:18,24` | Functional, very minor |
| Inline styles on become page | `become/page.tsx` | Functional, very minor |
| No dynamic imports / code splitting | All pages | App is small enough that this isn't worth the complexity yet |
| CheckoutConfirm uses `<a>` instead of `<button>` for disabled state | `CheckoutConfirm.tsx:30` | Works correctly, semantic improvement only |

---

### Favicon — ICO File Added

**What we did:**
- Added `favicon.ico` (Empowr logo, 16×16 and 32×32) to both `app/` and `public/`
- Removed the old `app/icon.svg` placeholder (blue square, white "E")
- Updated `CLAUDE.md` to reflect the new favicon setup

**Why ICO over SVG/PNG:** Browsers request `/favicon.ico` by default. Having a proper ICO file at that path avoids unnecessary 404 requests, which adds a small load-time improvement. The ICO format also bundles multiple sizes (16×16 for browser tabs, 32×32 for taskbars) in one file.

**How to update the favicon in future:** Replace `app/favicon.ico` with a new ICO file, and keep `public/favicon.ico` in sync.

---

## Earlier Sessions (pre 27 March 2026)

| Commit | What was done |
|---|---|
| Initial Next.js migration | Rebuilt the Empowr Heroes landing page in Next.js |
| Netlify deployment config | Set up `netlify.toml` for hosting |
| Favicon | Added Empowr logo as favicon (later replaced with optimised SVG) |
| Dynamic thank you page | Thank you page reads Stripe tier param and shows personalised message |
| Footer, legal policies, checkout flow | Added site footer, policy links, and checkout confirmation component |
| GDPR cookie consent banner | First version of the cookie banner |
| Homepage updates | Increased mission statement size, added bold caption |
| Hero tier badge assets | Added placeholder SVG badge assets for each tier |
