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
- PostHog analytics instrumented — cookieless server hash mode (`cookieless_mode: 'always'`) since 2026-07-28, replacing memory-mode persistence; fixes donation-funnel bounce rate/session data
- Cookie banner: simple CookieBanner active; CookieBannerFull ready but inactive
- **2026-07-29:** Found this repo was never covered by an earlier Main Site/EELA referrer-restoration pass — all 6 links back to empowrcic.org (`src/lib/links.ts`'s `site.main`/`site.el`/`site.elReport`) had `rel="noopener noreferrer"`, stripping the referrer. Fixed to `noopener` + added `?utm_source=empowr-heroes&utm_medium=internal`. Commit `81d2b09`.
