# Memory — Empowr Heroes

Running state and persistent context for the Heroes donation platform.

---

## Infrastructure

| Service | Detail |
|---|---|
| Hosting | Netlify — `hero.empowrcic.org` |
| Payments | Stripe (Payment Links, webhooks) |
| Email | Resend — sending domain `empowrcic.org` (apex), address `hero@empowrcic.org` |
| Donations DB | Notion — `Empowr Heroes Donations DB` (ID: `2d5e1485c4e1821baaed01000f3df0aa`) |
| DNS | AWS Route 53 |

## Notion Integration

- Database ID: `2d5e1485c4e1821baaed01000f3df0aa`
- Data Source ID: `86ae1485-c4e1-8269-ba31-870796a355e1`
- Integration: `Empowr Heroes Webhook`

## Stripe Tiers

All tier data lives in `src/lib/tiers.ts`. Each Stripe Payment Link must have `tier` metadata set manually in the Stripe dashboard.

## Support a Project

All project data lives in `src/lib/projects.ts` (`PROJECTS`/`PROJECT_ORDER`, explicit `Project` type). **Zero projects configured as of 2026-08-18** — `/projects` shows an empty state. No new Stripe Payment Link needed per project: backing one carries a `?project=<slug>` through `/become` → `/checkout`, and `CheckoutConfirm` tags the outgoing Stripe URL with `?client_reference_id=<slug>`, which Stripe returns on the webhook's `session.client_reference_id`. Donations DB has a `Project` Select property (added 2026-08-18) that `donation-handler.ts` writes to when resolved. Adding a real project = one edit to `projects.ts`, see `ops/runbooks/add-a-project.md`.

## Current State

- src/ migration complete (2026-06-23)
- PostHog analytics instrumented — cookieless server hash mode (`cookieless_mode: 'always'`) since 2026-07-28, replacing memory-mode persistence
- **2026-07-30:** `capture_pageview` was `true`, which disables posthog-js `HistoryAutocapture` — so no client-side route change ever produced a pageview and the whole funnel was invisible. Fixed to `'history_change'` here and fleet-wide. **All PostHog data before 2026-07-30 is landing-page-only:** bounce rate (~96%) and pages/session (1.04) are artefacts, and `/checkout` having zero views is an artefact too. Do not treat pre-30-July numbers as behaviour.
- **5 donations, £165 total** — 2026-04-29 to 2026-06-10, verified against the Notion DB 2026-08-11. Four one-time (£100, £20, £15, £20) and one Seed Hero monthly (£10) which later cancelled. Every record shows `Email Status = Sent`, so the Stripe webhook, Resend delivery, Notion logging and the cancellation path are all **proven in production**. Earlier notes here and in Claude memory said "zero donations"; that was wrong. All 5 predate instrumentation (22 Jun 2026), which is why `/thankyou` still has zero pageviews with no contradiction. Correct framing: **no donations since 10 June** — a drought, not a platform that has never converted.
- **One-time is what converts.** 4 of 5 gifts were one-time; the only monthly subscriber ever churned. `/become` and `TIER_ORDER` lead with monthly and put One-Time last — worth revisiting against this.
- **Stripe post-payment redirects are correctly wired.** The **one-time** link goes to `/thankyou/onetime` (user-confirmed 2026-08-11), pairing the one-time email (no badge) with the matching page; monthly tiers go to `/thankyou`. `/thankyou/onetime` is **not** orphaned — nothing in the app links to it *by design*, since Stripe is its only entry point. An earlier note here and in Claude memory said "all 6 → `/thankyou`, verified via Stripe MCP"; that was wrong, and building on it unchecked produced a false claim in a merged PR. Zero `/thankyou` pageviews since 22 Jun reflects no donations **in that window**, not a broken redirect.
- **Still genuinely unverified:** what `?tier=` contains on the monthly redirect. `/thankyou` looks the tier up by **key** (`seed`), so if Stripe passes the **label** (`Seed Hero`) the tier pill silently does not render. No monthly donor has completed since instrumentation, so this has never been observed either way.
- **The constraint is traffic, not the funnel.** 70 pageviews/30d vs Main Site 1,634; ~0.1% click-through from Main Site despite a sitewide "Support Us" CTA. No campaign is driving traffic yet — one is being planned. Don't try to optimise conversion on ~50 real visitors/month.
- Campaign UTM taxonomy ready at `planning/specs/campaign-utm-taxonomy_spec.md`. `utm_campaign=heroes-launch-2026` is a **placeholder** — rename before anything publishes.
- Security headers live in **both** `netlify.toml` (static assets) and `src/next.config.ts` (runtime-rendered HTML). Both are required — netlify.toml headers do not apply to Next.js runtime responses. Keep the values identical.
- **2026-08-10 — mail landmine cleared.** `CLAUDE.md`, this file, and `docs/donation-flow.md` all named `heroes@hero.empowrcic.org` as the sending address. DNS check: `hero.empowrcic.org` has **no MX, SPF, DKIM or DMARC** — mail from it would fail outright. The code has always used `hero@empowrcic.org` and is correct; the docs were wrong in the direction that breaks production if anyone "aligned" the code to them. All three corrected. Authentication lives on the apex: DKIM `resend._domainkey.empowrcic.org`, return-path `send.empowrcic.org` (Amazon SES), DMARC `p=none`.
- Cookie banner: **none, by design.** Both unused banner components deleted 2026-07-30 (Variant A cookieless sets no cookies). CLAUDE.md had wrongly claimed one was active.
- Tier copy centralised in `src/lib/tiers.ts` 2026-07-30 (`lead`/`body`/`short` + `TIER_ORDER`); `/become` and `/tiers` map over it. Previously hardcoded in 3 places with 3 drifted variants.
- `sitemap.xml` added 2026-07-30 (was 404 while `robots.txt` advertised it); `llms.txt` rewritten — it had pointed at `/donate` and `/impact`, neither of which exists.
- Campaign UTM taxonomy: `planning/specs/campaign-utm-taxonomy_spec.md`
- **2026-08-11 (session 2, part 2):** Design polish, reviewed via a local `next start` preview server before shipping (screenshot-verified, not shipped blind). Patron form collapsed by default — original "Get in Touch" button now expands the form on click (grid-rows transition) instead of showing it open under the page copy. Every hero/intro block across the site now centred (`/patron`, `/become`, `/tiers`, all 6 tier-detail pages), not just the homepage. Homepage headline changed from "Real Change Starts Here" to **"Wellbeing, Built by Doing"** (ties to the sitewide brand mantra) — went through an intermediate "no headline, bold description instead" version first, reverted after user feedback that it read as too much text for a hero; kept the `.h1` tag throughout for SEO (shared with `not-found.tsx`, the only other `.h1` user).
- **2026-08-11 (session 2):** Both enquiry-form specs built and applied. `src/core/enquiry-handler.js` holds `handlePatronEnquiry()` + `handleGeneralEnquiry()`, sharing escaping/honeypot/Resend-send helpers but staying two functions (different required fields, recipient, tone). `/patron`'s mailto CTA is now `PatronEnquiryForm.tsx`; `/tiers`'s mailto CTA is now a link to the new `/contact` page (`GeneralEnquiryForm.tsx`). `PATRON_EMAIL` and `GENERAL_EMAIL` env vars live on Netlify (all contexts), both with hardcoded fallbacks. Topic taxonomy for the general form lives in its own file (`src/lib/enquiry-topics.ts`) as a seam for a future Calendly/scheduling flow — nothing scheduling-related was built. Verified locally via `netlify dev`: honeypot (200, no mail), missing-field (400, no mail), and one real success submission per form, both addressed to the org's own inboxes so nothing went externally. `contact-routing.md` and `_config/registry/env-vars.md` updated.
- **2026-07-29:** Found this repo was never covered by an earlier Main Site/EELA referrer-restoration pass — all 6 links back to empowrcic.org (`src/lib/links.ts`'s `site.main`/`site.el`/`site.elReport`) had `rel="noopener noreferrer"`, stripping the referrer. Fixed to `noopener` + added `?utm_source=empowr-heroes&utm_medium=internal`. Commit `81d2b09`.
- **2026-07-30 (separate session, full-site link audit):** All 4 donor-email templates (`src/core/email-template.js`) linked to `legalhub.pecuvate.com/share/empowr/empowr-privacy-policy` (404 — missing the `heroes/` segment the netlify.toml redirect actually uses). Fixed to `.../heroes/privacy-policy`. Commit `3d75ab9`. Same session: Landing Page's "BECOME A HERO TODAY" CTA was repointed from this site's homepage to `/become` directly — more referred traffic should now land straight on the tier-selection page. Full audit detail: [[project_empowr_link_audit_2026_07_30]] in Claude memory.
- **2026-08-18 — "Support a Project" section shipped to `main` (commits `148ffa5`, `69af5a7`), Netlify auto-deploys.** `src/core/donation-handler.js`/`stripe-webhook.js` converted to `.ts`, importing `tiers.ts` directly; `tier-config.js` deleted (the hand-synced CommonJS duplicate that had already caused one real bug). New `/projects` section hands off into the existing tier/checkout flow via `?project=` and `client_reference_id` — see "Support a Project" section above. Verified live: `tsc`/`next build` clean, full Playwright pass, and a manually-signed synthetic webhook event confirmed the Notion `Tier`/`Project`/`Amount` write and the cross-app `payment_link` guard both work correctly. **Outstanding:** a synthetic test row (session `cs_test_synthetic_1787056255718`) needs manual deletion from the live Donations DB; scoping the production Stripe key down to a restricted `Customers: Read`-only key was discussed and deliberately deferred as separate, more careful work.
