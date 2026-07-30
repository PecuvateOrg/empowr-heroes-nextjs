# Memory — Empowr Heroes

Running state and persistent context for the Heroes donation platform.

---

## Infrastructure

| Service | Detail |
|---|---|
| Hosting | Netlify — `hero.empowrcic.org` |
| Payments | Stripe (Payment Links, webhooks) |
| Email | Resend — sending domain `hero.empowrcic.org`, address `heroes@hero.empowrcic.org` |
| Donations DB | Notion — `Empowr Heroes Donations DB` (ID: `2d5e1485c4e1821baaed01000f3df0aa`) |
| DNS | AWS Route 53 |

## Notion Integration

- Database ID: `2d5e1485c4e1821baaed01000f3df0aa`
- Data Source ID: `86ae1485-c4e1-8269-ba31-870796a355e1`
- Integration: `Empowr Heroes Webhook`

## Stripe Tiers

All tier data lives in `src/lib/tiers.ts`. Each Stripe Payment Link must have `tier` metadata set manually in the Stripe dashboard.

## Current State

- src/ migration complete (2026-06-23)
- PostHog analytics instrumented — cookieless server hash mode (`cookieless_mode: 'always'`) since 2026-07-28, replacing memory-mode persistence
- **2026-07-30:** `capture_pageview` was `true`, which disables posthog-js `HistoryAutocapture` — so no client-side route change ever produced a pageview and the whole funnel was invisible. Fixed to `'history_change'` here and fleet-wide. **All PostHog data before 2026-07-30 is landing-page-only:** bounce rate (~96%) and pages/session (1.04) are artefacts, and `/checkout` having zero views is an artefact too. Do not treat pre-30-July numbers as behaviour.
- **Zero donations** since instrumentation began (22 Jun 2026) — confirmed against the Notion DB, not an analytics gap. `/thankyou` is a hard load from Stripe so it would have recorded.
- **Stripe post-payment redirects are already verified — do not re-raise this.** All 6 Payment Links have `after_completion` → `/thankyou` correctly configured; checked via Stripe MCP 2026-07-28 (acct `acct_1TBhN2CpJGJ55gu5`). Zero `/thankyou` pageviews is therefore genuine zero donations, not a broken redirect.
- **The constraint is traffic, not the funnel.** 70 pageviews/30d vs Main Site 1,634; ~0.1% click-through from Main Site despite a sitewide "Support Us" CTA. No campaign is driving traffic yet — one is being planned. Don't try to optimise conversion on ~50 real visitors/month.
- Campaign UTM taxonomy ready at `planning/specs/campaign-utm-taxonomy_spec.md`. `utm_campaign=heroes-launch-2026` is a **placeholder** — rename before anything publishes.
- Security headers live in **both** `netlify.toml` (static assets) and `src/next.config.ts` (runtime-rendered HTML). Both are required — netlify.toml headers do not apply to Next.js runtime responses. Keep the values identical.
- Cookie banner: **none, by design.** Both unused banner components deleted 2026-07-30 (Variant A cookieless sets no cookies). CLAUDE.md had wrongly claimed one was active.
- Tier copy centralised in `src/lib/tiers.ts` 2026-07-30 (`lead`/`body`/`short` + `TIER_ORDER`); `/become` and `/tiers` map over it. Previously hardcoded in 3 places with 3 drifted variants.
- `sitemap.xml` added 2026-07-30 (was 404 while `robots.txt` advertised it); `llms.txt` rewritten — it had pointed at `/donate` and `/impact`, neither of which exists.
- Campaign UTM taxonomy: `planning/specs/campaign-utm-taxonomy_spec.md`
- **2026-07-29:** Found this repo was never covered by an earlier Main Site/EELA referrer-restoration pass — all 6 links back to empowrcic.org (`src/lib/links.ts`'s `site.main`/`site.el`/`site.elReport`) had `rel="noopener noreferrer"`, stripping the referrer. Fixed to `noopener` + added `?utm_source=empowr-heroes&utm_medium=internal`. Commit `81d2b09`.
