# Empowr Heroes — Context (Layer 1)

Live in production since 2026-04-23.

## What This Project Does

Next.js 14 donation platform for the **Empowr Heroes Programme**. Supporters choose a monthly giving tier, pay via Stripe, and receive a welcome email via Resend. Donations are logged to a Notion database via a Netlify Function webhook.

Deployed on Netlify. GitHub repo: `PecuvateOrg/empowr-heroes-nextjs` (`main` branch, public).

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
