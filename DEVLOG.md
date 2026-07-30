# Empowr Heroes — Dev Log

A running record of development sessions, changes made, and decisions taken.

---

## 2026-07-30 (session 2) — Cleanup batch: tier data centralised, dead code removed, SEO gaps closed

### `tiers.ts` is now the single source of tier copy

Tier data was hardcoded in **three** places with **three different copy variants** per tier, already drifted:

| Where | Variant |
|---|---|
| `lib/tiers.ts` | full sentence (used by `/checkout`) |
| `become/page.tsx` | full sentence with bolded lead — drifted from `tiers.ts` (e.g. "contributes to the practical infrastructure" vs "funds the infrastructure") |
| `tiers/page.tsx` | terse one-liner — deliberately different register, but had no home |

`TIERS` now carries `lead` / `body` / `short` so all three registers live in one place, plus `TIER_ORDER` for display order and a `tierDesc()` helper. Removed the old `desc` field — `/checkout` composes `lead — body` instead, so the full sentence cannot drift from its parts.

`become/page.tsx` and `tiers/page.tsx` now map over `TIER_ORDER`. That deletes ~90 lines of duplicated markup and restores the project's own "never hardcode tier data" rule, which both pages had been violating.

Adding a tier is now: one entry in `tiers.ts`, one `/tiers/<key>` detail page, one Stripe Payment Link. (Detail pages stay bespoke — they carry unique long-form impact content, not tier metadata.)

Two copy consequences, both intentional: `/become` now says **"One-Time Hero"** rather than "One-Time Hero Contribution", and its lowercase-after-dash phrasing now matches `tiers.ts` rather than the drifted capitalised variant.

Verified against the built HTML: `/become` renders 6 cards and `/tiers` 6 rows, correct names, prices and order.

### Removed dead cookie banners

`CookieBanner.tsx` and `CookieBannerFull.tsx` were mounted **nowhere** — confirmed by grep before deleting. Variant A (`cookieless_mode: 'always'`) sets no cookies and needs no banner. `CLAUDE.md` had claimed CookieBanner was active; corrected in the previous commit.

Recoverable: `git checkout 02dd085 -- src/components/CookieBanner.tsx src/components/CookieBannerFull.tsx`

### SEO / AI-crawler gaps

- **`sitemap.xml` was returning 404** while `robots.txt` had been advertising it all along. Added `app/sitemap.ts`, with tier detail pages derived from `TIER_ORDER` so it can't go stale. `/checkout` and `/thankyou` deliberately excluded — transient flow steps, not landing pages.
- **`llms.txt` pointed at two pages that don't exist** (`/donate`, `/impact` — both 404). Since `robots.txt` explicitly welcomes GPTBot, ClaudeBot and PerplexityBot, this was the map being handed to them. Rewritten against the real routes, with the tier ladder and both contact addresses added.

### Verified

`npx tsc --noEmit` clean · `npm run build` clean · `/sitemap.xml` present in the build output and well-formed

---

## 2026-07-30 — Platform review: funnel tracking was never working, plus pre-campaign fixes

Full review of source + live site + PostHog. Headline: **the donation funnel has been invisible since instrumentation began.**

### Root cause — `capture_pageview: true`

`PostHogProvider.tsx` set `capture_pageview: true`. In posthog-js, `HistoryAutocapture` is gated on an exact string match — `isEnabled(){return"history_change"===this._instance.config.capture_pageview}` — so `true` means "hard page loads only". Every internal link here is a Next.js `<Link>`, so **no client-side navigation produced a pageview**.

Evidence from PostHog (90d): 11 autocaptured clicks on "🏆 Become a Hero Today →" against **4** `/become` pageviews (3 of which were session entries); 4 "Choose This Tier" clicks against **0** `/checkout` pageviews ever recorded; 64 of 67 sessions with exactly one pageview; every page showing up as an entry page.

So the 96% bounce rate and 1.04 pages/session were **artefacts**, not behaviour. The 2026-07-28 switch to `cookieless_mode: 'always'` fixed session identity but not this.

Fixed to `capture_pageview: 'history_change'` here **and fleet-wide** — Main Site, EELA, Members, Landing Page, plus the canonical templates in `_config/guides/posthog-consent.md`, which is where all of them inherited it. Added a "never set this back to `true`" section to that guide with the gating code quoted.

### Also confirmed real (not an artefact)

`/thankyou` has **zero** pageviews since instrumentation began (22 Jun 2026). It is reached by a hard load from stripe.com, so it would record regardless of the bug. User confirmed the Notion DB is working and nobody has donated — so this is an acquisition problem, not a plumbing one. **Still outstanding:** the Stripe post-payment redirect has therefore never been exercised. Needs verifying on all 6 Payment Links before campaign launch.

### Security headers — HTML pages had none

`netlify.toml` `[[headers]]` only apply to CDN-served static files. This site runs through the Next.js runtime (`publish = ".next"` + plugin-nextjs), and runtime-rendered responses bypass them. Verified: `/favicon-32x32.png` carried all five, `/` and `/become` carried none.

Moved into `src/next.config.ts` via `async headers()`, values identical to netlify.toml. Kept the netlify.toml block — it still covers static assets — with a comment on both sides explaining the split.

Note: **Main Site is unaffected.** It is a static export (`output: "export"`, `publish = "out"`), so its netlify.toml headers do apply. An earlier check suggested otherwise; that was a `curl` against the apex domain reading the 301's headers rather than the destination's.

### Silent failure on the money path

`donation-handler.js`: if a Stripe Payment Link was missing its `tier` metadata (set by hand per link), the donor got **no email** and the team got **no internal notification** — money taken, nobody told, only a `console.warn` and a Notion row marked Failed.

- donor now gets the generic thank-you as a fallback
- internal notification is now unconditional, with an `ACTION NEEDED — donation with unrecognised tier` subject

### Copy

Homepage said *"Whether you sponsor at £5 a month or £100+"*. There is no £5 tier and no £100 tier (they are £10/25/50/250/500 plus one-time-any-amount). The £5 came from the one-time tier being open-ended. Reworded to *"Whether it's a one-off fiver or £500 a month"* — accurate at both ends and anchors on the real top tier rather than capping the ask at £100.

### Added

`planning/specs/campaign-utm-taxonomy_spec.md` — channel roster and UTM convention for the upcoming fundraising campaign (core: WhatsApp, Instagram, LinkedIn; Facebook/newsletter/QR defined but dormant). Includes ready-made tagged links per channel and a verified session-level attribution query, since `identified_only` + cookieless means UTMs land on the entry pageview only and PostHog's person-level `$initial_utm_*` cannot be relied on here.

### Verified

`npx tsc --noEmit` clean · `npm run build` clean (17 routes)

---

## 2026-07-29 — Referrer fix (missed by earlier sweep) + cross-site UTM tagging

- Found this repo was never covered by the Main Site/EELA referrer-restoration sweep from a prior session — every link back to `empowrcic.org` (`src/lib/links.ts`'s `site.main`/`site.el`/`site.elReport`, used in `become/page.tsx`, `Footer.tsx`, `page.tsx`, `patron/page.tsx`, `tiers/page.tsx`, `why-experiential-learning/page.tsx`) had `rel="noopener noreferrer"`, stripping the referrer. Fixed to `noopener`.
- Same 3 links now also carry `?utm_source=empowr-heroes&utm_medium=internal` — the practical alternative to full cross-domain session linking, ruled out this session as incompatible with `cookieless_mode: 'always'` (full reasoning in AnalyticsHub DEVLOG)
- Commit `81d2b09`, pushed to `main`, Netlify auto-deployed

---

## 2026-07-28

- Switched PostHog from `persistence: 'memory'` to `cookieless_mode: 'always'` in `src/components/PostHogProvider.tsx` (`0713504`) — part of the Empowr CIC-wide cookieless rollout (see AnalyticsHub DEVLOG); fixes the donation-funnel bounce rate and session data being invalid under memory mode
- Netlify deploy verified `ready` post-push; no other code changes

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

## Session — 23 April 2026 — Workspace restructured to agent-first architecture (src/planning/docs/ops layers); PR merged; Empowr Heroes officially launched to production

---

## Session — 23 April 2026 — Footer redesigned to 3-column layout (Brand/Legal/Find Us) with mobile accordion + social icons; final badge PNGs confirmed on S3 (last pre-launch task)

---

## Session — 17 April 2026 — Notion workspace migrated (new integration token + database ID); pre-launch code review fixed truncated Legacy Hero description

---

## Session — 14 April 2026 — Share buttons connected on thank-you page; "charity"→"CIC" copy corrections; new `/why-experiential-learning` research page built

---

## Session — 6 April 2026 — Email layout restructured, brand `Mantra.tsx` component extracted to all 10 pages, `preview-email.js` script added, S3 badge `Content-Disposition` fixed to inline

---

## Session — 5 April 2026 (continued) — Badge removed from welcome email in favour of a "View your badge →" S3 link; dedicated `/badge/[tier]` page deferred

---

## Session — 5 April 2026 — Production go-live completed: env vars set, Stripe webhook registered, GDPR data minimisation in Notion (name/email removed, kept in Stripe only), one-time donor flow built, badges moved to S3

---

## Session — 4 April 2026 — Donation automation taken fully live in production (env vars, Stripe webhook, all 5 payment-link tier metadata set)

---

## Session — 3 April 2026 — Built full donation automation end-to-end (Stripe webhook → Resend welcome email → Notion logging, agent-first split architecture); DNS migrated to Route 53 for Resend bounce handling

---

## Session — 27 March 2026 — Cookie banner redesigned with slide animation; performance audit (LCP/image format/favicon fixes); `lib/links.ts` centralised all external links; `favicon.ico` added

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
