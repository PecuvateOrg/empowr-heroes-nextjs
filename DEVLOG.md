# Empowr Heroes — Dev Log

A running record of development sessions, changes made, and decisions taken.

---

## 2026-08-11 — Platform audit: the "zero donations" premise was wrong, mail landmine cleared, duplicate page removed, first funnel event shipped

- **This platform has converted. The "nobody has donated" claim in the 2026-07-30 entry below is wrong** — corrected inline there, and superseded here. The Notion DB holds **5 donations, £165 total**, 2026-04-29 → 2026-06-10: four one-time (£100/£20/£15/£20) and one Seed Hero monthly (£10) that later cancelled. Every record shows `Email Status = Sent`, so webhook → Resend → Notion → cancellation are all proven in production. All five predate instrumentation (22 Jun), which is why "zero `/thankyou` pageviews" was true *and* fully consistent with real donations. Correct framing: **no donations since 10 June**. Note the shape — 4 of 5 were one-time and the only monthly subscriber churned, while the site leads with the monthly ladder.
- **Mail landmine cleared.** `CLAUDE.md`, `memory.md` and `docs/donation-flow.md` all named `heroes@hero.empowrcic.org` as the Resend sender; that subdomain has no MX, SPF, DKIM or DMARC, so mail from it would fail outright. The code's `hero@empowrcic.org` was always right — the docs were wrong in the direction that breaks production if acted on. Same pass fixed webhook drift: the doc described `payment_intent.succeeded`, `customer.subscription.created` and `invoice.payment_action_required`, none of which the handler uses.
- **`/why-experiential-learning` removed** (`bd8489e`, PR #12) — a word-for-word duplicate of `empowrcic.org/experiential-learning/report`, with no inbound links and two pageviews ever, while three "read the research" links sent people off-site to the Main Site copy. Main Site is canonical; the URL now 301s there (`4a34abc`), chosen over a 404 because Main Site planning notes record its copy as ported *from* this page. Took 181 lines of dead CSS with it; source preserved in `Empowr CIC/_trash/`.
- **`donation_started` shipped** (`3c46ad4`) — the site's first custom event, on the Proceed-to-Payment click. Verified live with correct `tier`/`price`/`is_recurring`, and it immediately captured a Stripe abandonment, previously indistinguishable from never clicking.
- **`TIER_CONFIG` gained an `onetime` entry** (`2f08701`, PR #14) — its absence made the Notion logger write the raw key, visible on all four one-time rows. This also corrected a claim committed hours earlier in `5c1f782`: the one-time Payment Link **already** redirects to `/thankyou/onetime`, so that flow was never broken. The error came from treating a memory note labelled "verified via Stripe MCP" as the verification itself.
- **Two specs written** (`65f1e9f`), neither built: `patron-enquiry-form_spec.md` — replace the `/patron` mailto, since inbound Outlook mail is spam-filtered by the receiving Google Workspace mailbox and no DNS fix exists for mail composed on the sender's infrastructure; and `stack-revamp_spec.md` — Heroes is the only estate project still on plain CSS with no eslint, D1–D4 awaiting decisions. **Open:** whether `?tier=` carries the key or the label on the monthly redirect (the pill silently vanishes if it is the label), the unsurfaced billing-portal link, the YouTube `sameAs` 404, and DMARC still at `p=none`.

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

> **CORRECTION 2026-08-11.** "Nobody has donated" was wrong. Querying the Notion Donations DB directly returned **5 donations totalling £165**, between 2026-04-29 and 2026-06-10 — four one-time (£100/£20/£15/£20) and one Seed Hero monthly (£10) that later cancelled. All five carry `Email Status = Sent`, so the webhook, Resend delivery, Notion logging and cancellation path are proven in production, and the post-payment redirect **has** been exercised by real donors.
>
> The zero-pageview observation above was accurate and remains so: every donation predates instrumentation, so it evidences no donations **since 10 June**, not "never". The original entry is left intact — the error was the premise, not the reasoning built on it.

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

## 2026-07-28 — Switched PostHog from `persistence: 'memory'` to `cookieless_mode: 'always'` (`0713504`) as part of the Empowr CIC-wide cookieless rollout; deploy verified ready

---

## Session — 7 May 2026 — Added `invoice.payment_failed` webhook handler (Notion status + orange internal alert); replaced the hardcoded "Most Popular" tier badge with a data-driven one from Notion donation counts (`lib/analytics.ts`, 1h cache)

---

## Session — 29 April 2026 — Subscription management: Stripe Customer Portal wired, cancellation logging to Notion (Subscription ID/Status/Reason fields), cancellation + payment-failed notification emails, custom 404 page; fixed Notion SDK v5 by switching `databases.query` to `dataSources.query`

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
