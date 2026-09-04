# Empowr Heroes — Context (Layer 1)

Read this after `CLAUDE.md`. Orients Claude Code within this project.

---

## What This Project Does

Next.js 14 donation platform for the **Empowr Heroes Programme**. Supporters choose a monthly giving tier, pay via Stripe, and receive a welcome email via Resend. Donations are logged to a Notion database via a Netlify Function webhook.

Deployed on Netlify. GitHub repo: `PecuvateOrg/empowr-heroes-nextjs` (`main` branch, public).

---

## Workspace Structure

```
empowr-heroes-nextjs/
├── CLAUDE.md                  Layer 0 — project rules and routing
├── CONTEXT.md                 This file — orientation
├── README.md                  Setup guide and local testing instructions
│
├── src/                       Application code — read src/CONTEXT.md first
│   ├── app/                   Next.js App Router pages
│   ├── components/            Shared UI components
│   ├── lib/                   links.ts, tiers.ts, tier-config.js, badges.js
│   └── core/                  Donation handler, email template
│
├── public/                    Static assets (must stay at root — Next.js requirement)
│   └── badges/                Badge PNGs (for email) and SVGs (for web)
│
├── netlify/functions/         Stripe webhook adapter (thin — no business logic)
│
├── planning/                  Pre-code thinking — read planning/CONTEXT.md
│   ├── specs/                 Feature specs written before implementation
│   └── decisions/             Architectural decision records
│
├── docs/                      Process documentation — read docs/CONTEXT.md
│   ├── donation-flow.md       End-to-end donation flow
│   └── email-guide.md        Email system — template, testing, updating
│
└── ops/                       Infrastructure and tooling — read ops/CONTEXT.md
    ├── scripts/               Dev utilities (email preview)
    └── runbooks/              Step-by-step operational procedures
```

---

## Routing

| Task | Read first |
|---|---|
| UI, pages, or components | `src/CONTEXT.md` |
| Donation flow or webhook logic | `src/CONTEXT.md` → `src/core/donation-handler.js` |
| Email copy or design | `src/CONTEXT.md` → `src/core/email-template.js` |
| Tier or pricing changes | `src/lib/tiers.ts` |
| Links or contact details | `src/lib/links.ts` |
| Planning a new feature | `planning/CONTEXT.md` |
| Understanding how the system works | `docs/CONTEXT.md` |
| Deploy, infrastructure, or key rotation | `ops/CONTEXT.md` → relevant runbook |

---

## Before Starting Work

1. Read `../workspace-docs/empowr-heroes-nextjs/DEVLOG.md` — the log lives in the private hub, not this repo
2. Route to the correct workspace using the table above
3. Run `npx tsc --noEmit` before committing to catch type errors early

---

## Status

**Launched.** Fully live in production as of 23 April 2026. Donation flow verified end-to-end. All pre-launch tasks complete. Now in post-launch maintenance and feature development.
