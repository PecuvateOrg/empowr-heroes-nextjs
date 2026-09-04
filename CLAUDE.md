# Empowr Heroes

> **This repository is PUBLIC** (`PecuvateOrg/empowr-heroes-nextjs`).
>
> **Devlog and memory location:** `../workspace-docs/empowr-heroes-nextjs/`
>
> `DEVLOG.md` and `memory.md` are **not** kept in this repo — they hold operational
> detail that must not be world-readable. Write session entries to the path above,
> in the private Empowr CIC hub. Both filenames are gitignored here, so a copy created
> in this directory is silently never committed.
>
> Never put live identifiers, unremediated security findings, or commercial state
> in any file tracked here. See `../CONTEXT.md` and
> `_config/guides/public-repo-collaboration.md`.

## Identity
Donation platform for the **Empowr Heroes Programme** by Empowr CIC. Supporters choose a monthly giving tier → Stripe checkout → Netlify Function verifies webhook, sends welcome email via Resend, logs donation to Notion.

## Self-Reference
This file is the map. Workspace detail lives in each CONTEXT.md. Also read `DEVLOG.md`, `src/lib/links.ts`, and `src/lib/tiers.ts` at session start.

---

## Routing

| Task | Go to | Read first | Skills |
|---|---|---|---|
| UI — pages, components, styles | `src/` | `src/CONTEXT.md` | `/webapp-testing` |
| Donation webhook, email logic | `src/core/` | `src/CONTEXT.md` | — |
| Tier data and Stripe URLs | `src/lib/tiers.ts` | — | — |
| Project data (Support a Project) | `src/lib/projects.ts` | — | — |
| External links and contact addresses | `src/lib/links.ts` | — | — |
| Specs, architecture decisions | `planning/` | `planning/CONTEXT.md` | — |
| Deploy, env vars, Netlify config | `ops/` | `ops/CONTEXT.md` | `/netlify-deploy` |
| Process documentation | `docs/` | — | — |

---

## Cross-Workspace Flows

- **Stripe** — tier metadata (`tier` field) must be set manually on each Payment Link in the Stripe dashboard; webhook fires on successful payment
- **Resend** — sends from `hero@empowrcic.org` (the **apex** domain); email template in `src/core/email-template.js`. Do **not** change this to `hero.empowrcic.org` — that subdomain has no MX, SPF, DKIM or DMARC (verified 2026-08-10) and mail from it would fail outright. Authentication lives on the apex: DKIM at `resend._domainkey.empowrcic.org`, return-path `send.empowrcic.org`.
- **Notion** — donation records logged to `Empowr Heroes Donations DB`; integration name `Empowr Heroes Webhook`
- **LegalHub** — policy docs hosted at `legalhub.pecuvate.com`; links live in `src/lib/links.ts`

---

## Naming Conventions

- Components: PascalCase (`HeroCard.tsx`)
- Pages: kebab-case route folders (`app/checkout/page.tsx`)
- CSS: custom properties only — `var(--blue)`, `var(--cream)` — never raw hex in components
- External URLs: `LINKS.x` from `src/lib/links.ts` — never hardcode
- Tier data: `TIERS.x` from `src/lib/tiers.ts` — never hardcode

---

## File Placement Rules

- Pages → `src/app/[route]/page.tsx`
- Shared UI components → `src/components/`
- External URLs → `src/lib/links.ts`
- Tier data and Stripe URLs → `src/lib/tiers.ts`
- Project data (funding goal, impact areas) → `src/lib/projects.ts`
- Donation webhook business logic → `src/core/donation-handler.ts`
- Email template → `src/core/email-template.js`
- Netlify function (thin adapter only) → `src/netlify/functions/stripe-webhook.ts`
- Badge assets → `src/public/badges/` (SVG + PNG; emails use PNG only)

---

## Token Management

- Do not load `planning/` unless reviewing or recording an architectural decision
- Do not load `docs/` unless the task involves integration documentation
- Do not load `ops/` unless deploying or configuring environment variables
- Load `src/lib/links.ts` when any policy, contact, or external URL is involved
- Load `src/lib/tiers.ts` when any tier data or Stripe URL is involved
- Load `src/lib/projects.ts` when any project data is involved

---

## Key Rules

- **No Tailwind** — all CSS is custom, in `src/app/globals.css` using CSS variables
- **Never hardcode URLs** — all external links via `src/lib/links.ts`
- **Never hardcode tier data** — all tier info via `src/lib/tiers.ts`
- **`src/core/` is platform-agnostic** — no Netlify-specific code belongs there
- **No cookie banner** — Variant A (`cookieless_mode: 'always'`) sets no cookies and needs none. The two unused banner components were deleted 2026-07-30; only reintroduce one if optional cookies are actually added.
- **Tier copy lives only in `src/lib/tiers.ts`** — `lead`/`body` (full sentence, used by `/become` + `/checkout`) and `short` (compact rows, used by `/tiers`). Both pages map over `TIER_ORDER`; never inline tier copy into a page again. `src/core/` is TypeScript and imports `tiers.ts` directly — there is no separate CommonJS copy to keep in sync (the old `tier-config.js` was deleted 2026-08-18 when the webhook chain was converted to TS for exactly this reason).
- **Project copy lives only in `src/lib/projects.ts`** — same convention as tiers. `/projects` and `/projects/[project]` (the app's first dynamic route) map over `PROJECT_ORDER`. A project hands off to the existing tier/checkout flow via a `?project=` query param rather than having its own Stripe Payment Link — see `ops/runbooks/add-a-project.md`.
- **`capture_pageview` must stay `'history_change'`** — `true` silently disables client-side route-change tracking and makes the entire funnel invisible. See `_config/guides/posthog-consent.md`.
- **Security headers live in two places** — `netlify.toml` (static assets) and `src/next.config.ts` (runtime-rendered HTML). Both required; keep values identical.
- Run `npx tsc --noEmit` before committing to catch type errors early

---

## Deployment

- Platform: Netlify
- Domain: `hero.empowrcic.org`
- Branch: main
- Base directory: src/

---

## Skills and Tools Available

| Tool / Skill | Trigger | Purpose |
|---|---|---|
| `/netlify-deploy` | deploying to Netlify | Deploy to Netlify and configure `hero.empowrcic.org` |
| `/pre-build-check` | before any deploy | Validate build structure and frontend quality |
| `/pre-deploy-security` | before any deploy | Security hygiene scan — secrets, CVEs, headers, RLS; FAILs block the deploy |
| `/webapp-testing` | after frontend changes | Test UI with Playwright, capture screenshots |
| `/simplify` | after a feature is built | Review changed code for reuse, quality, and efficiency |
- GitHub: `PecuvateOrg/empowr-heroes-nextjs` (public)
