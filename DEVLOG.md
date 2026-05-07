# Empowr Heroes — Dev Log

A running record of development sessions, changes made, and decisions taken.

---

## Session — 7 May 2026

### Payment Failed Webhook & Data-Driven "Most Popular" Badge

---

#### invoice.payment_failed webhook

New `handlePaymentFailedEvent` function added to `src/core/donation-handler.js`:
- Handles `invoice.payment_failed` Stripe webhook events
- Fetches subscriber name and email from Stripe customer
- Queries Notion by Subscription ID to find the matching record
- Updates Notion Status → "Payment Failed"
- Sends an orange-header internal notification email to `hero@empowrcic.org` with name, email, tier, amount, attempt count (x of 4), date, and Stripe link
- Non-matching subscriptions (pre-code records) log a warning and continue cleanly

New email template functions in `src/core/email-template.js`:
- `buildPaymentFailedNotificationHtml` — orange header to distinguish from blue (new hero) and red (cancellation)
- `buildPaymentFailedNotificationText`

**Action required:** Add `invoice.payment_failed` to the live Stripe webhook endpoint in the Stripe Dashboard (same endpoint as `checkout.session.completed` and `customer.subscription.deleted`).

Note: If a payment fails but then succeeds on Stripe's retry, the Notion Status will remain "Payment Failed". A `invoice.payment_succeeded` handler could be added later to revert this — deferred.

---

#### Data-driven "Most Popular" tier badge

Removed the hardcoded `popular` class from the Community Hero tier card — it was not based on real data.

New `src/lib/analytics.ts`:
- `getMostPopularTier()` — queries the Notion Donations DB, counts donations by tier, returns the leading tier key
- Uses `unstable_cache` (1-hour TTL) so Notion is queried at most once per hour, not on every page load
- Returns `null` if there are no donations yet, if the query fails, or if two tiers are tied — no badge is shown in these cases

`src/app/become/page.tsx` updated:
- Now `async`, with `export const revalidate = 3600` (ISR — page regenerates hourly)
- All 5 tier cards now apply `popular` class dynamically based on `getMostPopularTier()` result
- The `.tc.popular` CSS styling in `globals.css` is unchanged

**Result:** The badge is truthful and self-maintaining. As real donation data accumulates, the badge migrates automatically to whichever tier is genuinely most popular.

#### Verified
- `npx tsc --noEmit` — clean

---

## Session — 29 April 2026

### Subscription Management, Cancellation Logging, Notifications & 404 Page

---

#### 404 page
Custom `src/app/not-found.tsx` added — replaces Next.js bare default. Shows branded 404 with CTAs to home and `/become`. Gets Nav and Footer from root layout automatically.

#### Cancellation notification email
When a subscription is cancelled, a notification is sent to `hero@empowrcic.org` with subscriber name (fetched from Stripe customer), email, tier, cancellation reason, date, and Stripe link. Red header to distinguish from new subscriber notifications.

#### Notion SDK v5 compatibility fix
`notion.databases.query` does not exist in `@notionhq/client` v5. Fixed by switching to `notion.dataSources.query` with the collection ID (`86ae1485-c4e1-8269-ba31-870796a355e1`), stored as `NOTION_DONATIONS_DATA_SOURCE_ID` constant in `donation-handler.js`. Documented in `CLAUDE.md`.

#### Deferred
- `invoice.payment_failed` webhook — worth adding to catch failed renewals and update Notion status automatically
- Stripe Customer Portal custom domain (`manage.hero.empowrcic.org`) — low priority, can be added when needed

---

### Subscription Management — Customer Portal, Cancellation Logging & Notifications

---

#### Stripe Customer Portal configured
Stripe Customer Portal enabled at `https://billing.stripe.com/p/login/28E00iavGdHc0r3gfM18c00`.
Settings: portal header "Empowr Heroes", redirect to `https://hero.empowrcic.org`, custom domain skipped (default Stripe domain used).
Cancellation reasons enabled (8 Stripe preset options + free text).

Portal URL stored in `LINKS.stripe.portal` in `src/lib/links.ts`.

#### Welcome email updated
Subscription welcome email now includes a muted "manage or cancel your subscription" line linking to the portal. One-time email unaffected.

#### Cancellation logging (Notion + webhook)
Three new fields added to the Notion Donations DB via MCP:
- **Subscription ID** — Stripe `sub_xxx` ID, used to match cancellation events to existing records
- **Status** — Select: Active / Cancelled / One-Time, set on record creation and updated on cancellation
- **Cancellation Reason** — free text populated from Stripe's cancellation feedback + comment

New `handleCancellationEvent` function added to `src/core/donation-handler.js`:
- Handles `customer.subscription.deleted` webhook events
- Queries Notion by Subscription ID to find the matching record
- Updates Status → Cancelled and logs the cancellation reason
- Non-matching subscriptions (pre-code records) log a warning and continue cleanly

`checkout.session.completed` handler updated to populate Subscription ID and Status on new records.

`customer.subscription.deleted` added to the live Stripe webhook endpoint (done via Stripe Dashboard — CLI key lacked permission).

#### Deferred
- `invoice.payment_failed` webhook — worth adding in future to catch failed renewals and update Notion status automatically

---

### Internal Notification Email & Live Payment Confirmed

---

#### Live payment confirmed
First real payment tested end-to-end in production — confirmed working correctly.

#### Internal notification email (new subscriptions)
When a new subscription Hero signs up, an internal notification email is now sent to `hero@empowrcic.org` via the existing Resend setup (no new infrastructure needed).

The email includes: donor name, email, tier, amount/month, date (UK timezone), Stripe session ID, and a direct link to the session in the Stripe Dashboard.

**Files changed:**
- `src/core/email-template.js` — added `buildInternalNotificationHtml` and `buildInternalNotificationText`; moved Resend instantiation out of the per-branch blocks so a single instance is shared across all sends
- `src/core/donation-handler.js` — added step 4b (internal notification) after the welcome email send; scoped to subscription tiers only (not one-time); non-critical — failure is logged but does not break the webhook response

**Verified:** `npx tsc --noEmit` clean, `npm run build` all 17 pages.

---

## Session — 23 April 2026

### Workspace Restructure (agent-first folder architecture)

---

#### Branching practice established
All future changes must go on a named branch before merging to `main`. Previous sessions committed directly to `main` — this session corrected that practice. Branch used: `chore/workspace-restructure`.

#### Folder restructure
Implemented a three-layer workspace architecture based on `_config/folder-architecture.md`:

- `src/` — application code (`app/`, `components/`, `lib/`, `core/` moved inside)
- `planning/` — pre-code specs and architectural decision records
- `docs/` — process documentation (donation flow, email system)
- `ops/` — infrastructure, runbooks, dev scripts (`scripts/` moved to `ops/scripts/`)

Next.js natively supports the `src/` directory pattern — no config changes to `next.config.ts` required. `public/` must stay at root (Next.js hard requirement).

#### Files updated
- `tsconfig.json` — `@/*` alias updated from `"./*"` to `"./src/*"`
- `netlify/functions/stripe-webhook.js` — require path updated to `../../src/core/donation-handler`
- `ops/scripts/preview-email.js` — three require paths updated to `../../src/core/` and `../../src/lib/`
- `package.json` — `preview:email` script updated to `node ops/scripts/preview-email.js`
- `CLAUDE.md` — all path references updated, new workspace layers documented
- `CONTEXT.md` — fully rewritten (was incomplete); now includes workspace routing table

#### New files created
- `src/CONTEXT.md`, `planning/CONTEXT.md`, `docs/CONTEXT.md`, `ops/CONTEXT.md`
- `ops/runbooks/add-a-tier.md`, `ops/runbooks/deploy-checklist.md`, `ops/runbooks/rotate-secrets.md`

#### Verified
- `npx tsc --noEmit` — clean
- `npm run build` — all 17 pages generated successfully

#### PR raised and merged
Branch pushed to GitHub. PR `chore/workspace-restructure` → `main` raised, reviewed, and merged.
- `npm run preview:email` verified post-restructure — output correct
- Netlify deploy triggered by merge — succeeded, all pages live

#### Site officially launched
Empowr Heroes is fully live in production as of 23 April 2026. All pre-launch tasks are complete. The project moves into post-launch maintenance and feature development from this point.

---

## Session — 23 April 2026

### Footer Redesign, Social Icons & Mobile Accordion

---

#### Badge upload confirmed
Final badge PNGs confirmed uploaded to AWS S3 (`empowr-cic` bucket, `badges/` prefix). This was the last outstanding pre-launch task — the site is now fully launch-ready.

#### Footer redesigned
Replaced the minimal single-bar footer with a structured 3-column layout:

- **Brand column** — Empowr CIC name + tagline
- **Legal column** — Legal Disclaimer, T&Cs, Privacy Policy, Cookie Policy
- **Find Us column** — Instagram, LinkedIn, and website globe icon

Desktop: 3-column CSS grid (`1.5fr 1fr 1fr`), always expanded, section headings non-interactive.
Mobile: accordion — each section collapses/expands with a chevron toggle.

#### Mobile accordion animation
Added smooth slide open/close using the `grid-template-rows: 0fr → 1fr` CSS transition technique. Padding also transitions to avoid a flash on open. Desktop sections are unaffected (transition disabled, always expanded).

#### Social icons added
Inline SVG icons for Instagram and LinkedIn added to the Find Us section. Globe icon added for the main Empowr website (`www.empowrcic.org`). No new dependencies — all icons are self-contained SVG paths.

#### lib/links.ts updated
Added `LINKS.social.linkedin` (`https://www.linkedin.com/company/empowr-cic`). The existing `linkedinShare` key (used on the thank you page share button) is unchanged.

#### CONTEXT.md
A `CONTEXT.md` file was started for this project but is incomplete — deferred to a future session.

---

## Session — 17 April 2026

### Notion Workspace Migration & Pre-Launch Code Review

---

#### Notion workspace migration completed
- Donations DB moved to a new Notion workspace
- New integration token updated in `.env.local` (`NOTION_API_KEY`)
- New database ID confirmed via Notion MCP: `2d5e1485c4e1821baaed01000f3df0aa` (old: `9760dd1c24f0437d8b0bbae87524636a`)
- Both `NOTION_DATABASE_ID` and `NOTION_API_KEY` updated in Netlify environment variables via CLI
- Verified end-to-end in production using Stripe test mode — Notion row created successfully
- `CLAUDE.md` updated with new database ID and workspace name

#### Pre-launch code review
- Fixed truncated Legacy Hero description in `lib/tier-config.js` — was missing "while maintaining financial stability." (email copy now matches `lib/tiers.ts`)
- Removed stale placeholder comment from `lib/links.ts` (`research.notionDoc` — link is live)
- No other breaking issues found; inline style cleanup deferred (cosmetic, not launch-blocking)

#### Deferred to next session
- Upload final badge PNGs to AWS S3 (`empowr-cic` bucket, `badges/` prefix) — this is the last remaining task before launch

---

## Session — 14 April 2026

### Share Buttons, Research Page & Copy Corrections

---

#### Share buttons connected (thank you page)
- Replaced placeholder `<button>` elements with working `<a>` tags
- "Follow us on Instagram" → links to `instagram.com/empowr.cic`
- "Share on LinkedIn" → LinkedIn share dialog pre-loaded with `hero.empowrcic.org/become`
- "Refer a Friend" → `mailto:` with pre-written subject and body (includes main site URL)
- All social URLs stored in `lib/links.ts` under `social`

#### Mission and CIC copy corrections
- Fixed all references from "charity" to "Community Interest Company" (CIC)
- Fixed all references from "young people" to "people of all ages" (or equivalent)
- Affected files: `CLAUDE.md`, `app/thankyou/onetime/page.tsx`, `core/email-template.js` (HTML + plain text), `lib/links.ts`
- Mission statement added to `CLAUDE.md`: "To promote lifelong wellbeing through experiential learning. Works with people of all ages."

#### New page: /why-experiential-learning
- Standalone research page built from Empowr's 2025 report
- Sections: stat strip, The Problem, The Science, The Evidence (cards), The Economic Case (cards), Conclusion
- References collapsed behind a native `<details>` toggle — no JS required
- CTA at bottom links to `/become` and `www.empowrcic.org`
- Linked from: become, tiers, and patron pages
- Patron page has a dedicated "Further Reading" section with both the internal page and a Notion doc placeholder (update `LINKS.research.notionDoc` in `lib/links.ts` when new link is provided)

#### lib/links.ts additions
- `social` — instagram, linkedinShare, referFriend
- `site.main` — `https://www.empowrcic.org`
- `research.notionDoc` — Notion placeholder (to be updated)

---

## Session — 6 April 2026

### Email Overhaul, Brand Mantra Component & Email Preview Script

---

#### Email layout restructured
- Tier description moved inside the tier card, directly below the label — card now contains all tier info in one place
- Standalone "You've joined as a..." sentence removed — card does all the work
- Brand mantra added to bottom of both hero and one-time emails (HTML and plain text versions)
- Mantra uses brand colours in HTML: red, blue, black per phrase

#### Brand mantra extracted into shared component
- Created `components/Mantra.tsx` — single source of truth for mantra text, colours, and styling
- Added to all 10 pages; removing from any one page or updating the copy only requires one file change
- Home page shows full version (mantra + statement); all other pages show mantra only
- Mantra placed inside each page's content container so it inherits the correct background
- Text centred via `.tagline` CSS class

#### Email preview script
- Created `scripts/preview-email.js` — renders any email template to `scripts/preview.html` for instant browser preview
- Run: `npm run preview:email` (defaults to community), `npm run preview:email -- seed`, etc.
- Open output: `start scripts/preview.html`
- `scripts/preview.html` added to `.gitignore`

#### S3 badge Content-Disposition updated
- All 5 badge PNGs switched from `attachment` to `inline` via AWS CLI
- Clicking "View your badge →" in email now opens the image in the browser rather than downloading

#### Stripe one-time redirect confirmed
- After-payment redirect on Stripe one-time Payment Link set to `https://hero.empowrcic.org/thankyou/onetime` ✓

#### Deferred — Dedicated badge page
Future feature: create a `/badge/[tier]` page on the site that displays the donor's badge with options to share, copy the link, or save the image. The "View your badge →" email link would point here instead of directly to S3.

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
