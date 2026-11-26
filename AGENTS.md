# Empowr Heroes

> **This repository is PUBLIC** (`PecuvateOrg/empowr-heroes-nextjs`).
>
> **Devlog and memory location:** `../workspace-docs/empowr-heroes-nextjs/`
>
> `DEVLOG.md` and `memory.md` are not kept in this repo — write session entries to the path
> above instead. See `NON-NEGOTIABLES.md` for what must never be committed here.

Read `NON-NEGOTIABLES.md` before doing anything.

## Routing

| Task | Go to | Read first | Skills |
|---|---|---|---|
| **Design: look, colours, components** | `design-system/` | `design-system/MASTER.md` (then the Empowr brand kit it names) | — |
| UI — pages, components, styles | `src/` | `src/CONTEXT.md` | `/webapp-testing` |
| Donation webhook, email logic | `src/core/` | `src/CONTEXT.md` | — |
| Tier data and Stripe URLs | `src/lib/tiers.ts` | — | — |
| Project data (Support a Project) | `src/lib/projects.ts` | — | — |
| External links and contact addresses | `src/lib/links.ts` | — | — |
| Specs, architecture decisions | `planning/` | `planning/CONTEXT.md` | — |
| Deploy, env vars, Netlify config | `ops/` | `ops/CONTEXT.md` | `/netlify-deploy` |
| Process documentation | `docs/` | — | — |

## Cross-Workspace Flows

- **Stripe** — tier metadata (`tier` field) must be set manually on each Payment Link in the Stripe dashboard; webhook fires on successful payment
- **Resend** — sends from `hero@empowrcic.org` (the **apex** domain); email template in `src/core/email-template.js`. Do **not** change this to `hero.empowrcic.org` — that subdomain has no MX, SPF, DKIM or DMARC (verified 2026-08-10) and mail from it would fail outright. Authentication lives on the apex: DKIM at `resend._domainkey.empowrcic.org`, return-path `send.empowrcic.org`.
- **Notion** — donation records logged to `Empowr Heroes Donations DB`; integration name `Empowr Heroes Webhook`
- **LegalHub** — policy docs hosted at `legalhub.pecuvate.com`; links live in `src/lib/links.ts`

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

## Deployment

- Platform: Netlify
- Domain: `hero.empowrcic.org`
- Branch: main
- Base directory: src/
