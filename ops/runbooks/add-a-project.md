# Runbook: Add a New Project

Unlike a tier, a project needs **no Stripe Payment Link of its own** — it hands off to the existing tier Payment Links, tagged via `client_reference_id`. Adding a project is a one-file code change plus an image upload; there is no dashboard step.

---

## 1. Update `src/lib/projects.ts`

Add a new entry to `PROJECTS` keyed by a URL-safe slug, and add that slug to `PROJECT_ORDER`. Required fields:

- `name`, `emoji`, `tagline` — used on the `/projects` list card
- `lead`, `body`, `short` — same copy convention as `tiers.ts`
- `goalAmount` — funding target in GBP, used to compute the progress bar
- `status` — `'active' | 'funded' | 'closed'`
- `impactAreas` — 4 items of `{ icon, title, body }`, shown on the detail page

No separate email/webhook config file is needed — `donation-handler.ts` imports `PROJECTS` directly.

---

## 2. Upload any hero/detail imagery

If the project uses an image rather than just an emoji, upload it to S3 (`empowr-cic` bucket) following the same pattern as `src/lib/badges.js`, and reference the URL from the project's entry.

---

## 3. Add the `Project` Select property in Notion (one-time only)

The Empowr Heroes Donations DB needs a `Project` Select property before any project-tagged donation can be logged. This only needs doing once, ever — not per project. If it's already there, skip this step. New project names become new Select options automatically the first time a donation logs one.

---

## 4. Test locally

```bash
npm run dev:netlify
npm run dev:stripe
```

Visit `/projects/<slug>` → click through to `/become?project=<slug>` → choose a tier → confirm `/checkout?tier=X&project=<slug>` shows the project banner. Complete a test-mode Stripe payment (the checkout button appends `?client_reference_id=<slug>` onto whichever tier's Payment Link was chosen — no new link needed) and confirm:

- The Notion row has the new `Project` property set
- The donor and internal emails send as normal

---

## 5. Deploy

Merge to `main`. Netlify deploys automatically. `getProjectFundingTotals()` is cached for an hour, so a fresh project's "£0 raised" figure updates within an hour of the first donation — no redeploy needed for the progress bar to move.
