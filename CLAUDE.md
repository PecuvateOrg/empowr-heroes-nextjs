# Empowr Heroes

> **This repository is PUBLIC** (`PecuvateOrg/empowr-heroes-nextjs`).
>
> **Devlog and memory location:** `../workspace-docs/empowr-heroes-nextjs/`
>
> `DEVLOG.md` and `memory.md` are not kept in this repo — write session entries to the path
> above instead. See `NON-NEGOTIABLES.md` for what must never be committed here.

## Identity
Donation platform for the **Empowr Heroes Programme** by Empowr CIC. Supporters choose a monthly giving tier → Stripe checkout → Netlify Function verifies webhook, sends welcome email via Resend, logs donation to Notion.

## Self-Reference
This file is Layer 0 — routing only. Read `NON-NEGOTIABLES.md` before doing anything; project
detail lives in each CONTEXT.md. Also read `DEVLOG.md`, `src/lib/links.ts`, and `src/lib/tiers.ts`
at session start.

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
