# Empowr Heroes — Dev Log

A running record of development sessions, changes made, and decisions taken.

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
