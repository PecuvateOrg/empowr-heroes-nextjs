# Empowr Heroes — Dev Log

A running record of development sessions, changes made, and decisions taken.

---

## 2026-08-31 — Failed-payment alerting question recorded; Stripe dunning settings verified and shared with Members

- **Recorded an open question in `memory.md` for its own session:** `handlePaymentFailedEvent` already marks the Notion record `Payment Failed` and emails `hero@empowrcic.org`, but **the alert goes to staff and never to the donor** — recovery depends on someone reading that inbox and chasing manually. Stripe's own failed-payment emails would cover it with no code and carry a payment-update link.
- **Second gap noted: it fires on every retry attempt**, so one failing card produced 8 staff emails across the retry window. Empowr cut the retry schedule from 8 to 4 this session, halving that — so the noise problem is already half-closed before anyone touches the code.
- **Stripe dunning settings verified in the Dashboard** (no API exposes them): cancel the subscription after all retries fail, leave the invoice past-due, 4 attempts over 2 weeks. **All account-level with no per-app override, and the live account is shared with Empowr Members** — whatever is set for one applies to donors too.
- ⚠️ Asymmetry worth knowing when this is picked up: for Members, "cancel" is benign (the member reverts to paying per session and can still attend); for Heroes a recurring donation silently stops and the donor is unlikely to notice. Revenue leak, not a service failure. No code changed this session.

## 2026-08-29 (session 2) — Design-audit fixes: tap-targets and text contrast raised to WCAG AA, merged to `main`

- Ran `/design-audit` against 6 public routes (`/`, `/projects`, `/tiers`, `/become`, `/patron`, `/contact`) × 8 viewports. Found 1 HIGH (`/contact` form fields have no visible focus indicator — still open) and ~41 MEDIUM findings.
- **Two shared button classes explained most tap-target findings.** `.btn`/`.tca` now guarantee `min-height: 44px` (were rendering 38-42px on mobile) — cleared ~34 findings across `/tiers` and `/become` in one CSS change each, not per-instance fixes.
- **Contrast fixed via two design tokens.** Darkened `--muted` (`#7a7a8a`→`#6b6b78`) and `--patron-gold` (`#b8924a`→`#7d6329`, consolidated with a new `--patron-gold-text` alias since both needs converged on the same value) — clears description text, `.back-btn`, and every Patron-page gold text/button instance (including white-on-gold buttons that were failing at 2.9:1).
- **Roughly half the original findings were checker noise, not real defects.** `design-audit.mjs` itself was alpha-blind (scored a 10%-opacity color tint as full-strength, producing false `1.00:1`/`1.85:1` readings on `--blue-soft`/`--patron-gold-s` tints) and gradient-blind (never read `background-image`, so white text inside a dark gradient CTA section scored against a distant light ancestor as `1.06:1`). Both fixed in Web Build Framework's own checker — full detail in that project's DEVLOG.
- Also fixed a `run-audit.ps1` port-passthrough bug in `_config` that silently timed out every server-mode project's audit (not just this one) — the harness waited on port 4173 while `next start` always bound 3000.
- Merged `feat/design-audit-fixes` to `main`, pushed — live.
- **Still open, not attempted this session:** HIGH focus-visible gap on `/contact`; missing `<h1>` on `/become`/`/projects`/`/tiers`; missing `aria-current` in the nav; 2 badges under the 12px text floor; one iOS input-zoom and one heading-skip LOW; one unresolved ~2.8:1 contrast near-miss (single sample per page, couldn't pin to a specific element without disproportionate digging).

## 2026-08-29 — Email templates surveyed from the Members side: 9 duplicated shells and an off-brand blue (findings only, nothing changed)

No code in this repo was touched. Recorded here so the finding is not lost in another project's log.

- `src/core/email-template.js` is **956 lines containing 9 separate `<!DOCTYPE` shells** — the same layout re-hand-written per email type.
- Its palette mixes brand tokens (`#4A70C2`, `#e5e1db`, `#7a7a8a`, `#1B1B1B`) with off-brand ones, including **`#4f6ef7` — a different blue from brand `#4A70C2`** — in live donor email.
- Heroes does have something Members lacks: **plain-text variants** (`buildEmailText`, `buildOneTimeEmailText`). Worth keeping if a shared shell is ever adopted.
- Context and the proposal live in `Empowr CIC/DEVLOG.md` 2026-08-29. **Awaiting a scope decision — do not treat as scheduled work.**

## 2026-08-27 — add-a-tier runbook now covers Product-ID registration; metadata stamping planned

Follow-up to yesterday's ownership gate. No code changed.

- **`ops/runbooks/add-a-tier.md` gained a load-bearing step (new step 2).** Since the dispatch gate landed, adding a tier without registering its Stripe **Product ID** in `HEROES_PRODUCT_IDS` makes the tier *silently half-work*: donations still arrive (checkout sessions are identified by `payment_link`), but every `customer.subscription.deleted` and `invoice.payment_failed` for it is ignored — no alert, no Notion row, nothing errors. The step carries its own rationale, because a step whose reason is missing gets skipped.
- **Documented the Payment Link metadata trap** in the same runbook and in `memory.md`: link `metadata` reaches the Checkout Session, but only `subscription_data.metadata` reaches the Subscription. All five recurring links leave it empty — which is exactly why Heroes' own subscriptions carry no marker and the guard identifies structurally.
- **Planned, not done:** stamp `metadata.app = "heroes"` on the 6 Products and the 5 Payment Links' `subscription_data.metadata`. **Symmetry and future-proofing, not a fix** — and it must *not* replace the Product-ID guard, since every subscription created before stamping has no metadata and a metadata-only check would reject genuine donors. ~11 reversible CLI calls; affects future subscriptions only.
- Yesterday's gate confirmed still live (deploy `ready` on `83be16e`) and **still not exercised by a real event** — the first signal will be an `Ignoring … not a Heroes object` line once Members has a live subscription.

## 2026-08-26 — The August guard covered one of three branches; ownership now resolved at dispatch (PR #15, MERGED and live)

## 2026-08-18 (session 2) — Cross-app Stripe webhook bug found and fixed: a Members booking triggered a real donation email

## 2026-08-18 — "Support a Project" section shipped; webhook chain converted to TypeScript, `tier-config.js` retired

---

## 2026-08-14 — Added a new `## Skills and Tools Available` section to `CLAUDE.md`, closing an M8 gap flagged by the scheduled mwp-health compliance audit (README alr…

## 2026-08-11 (session 2, part 2) — Design pass: patron form expand/collapse, centred heroes, new headline

## 2026-08-11 (session 2) — Two enquiry forms (`/patron`, new `/contact`) replaced the site's last mailto CTAs, fixing a spam-classification problem; verified live via netlify dev

## 2026-08-11 — Platform audit: the "zero donations" premise was wrong, mail landmine cleared, duplicate page removed, first funnel event shipped

## 2026-07-30 (session 2) — Cleanup batch: tier data centralised into `tiers.ts` (removed 3 drifted copies across `/checkout`, `/become`, `/tiers`), dead cookie-banner components removed, sitemap.xml/llms.txt SEO gaps closed

## 2026-07-30 — Platform review: fixed `capture_pageview:true` breaking pageview tracking fleet-wide, added security headers to the Next.js runtime, fixed a silent failure on unresolved Stripe tier metadata, corrected inaccurate tier copy, and wrote the campaign UTM taxonomy spec (the "nobody has donated" finding here was corrected by the 2026-08-11 entry above)

## 2026-07-29 — Fixed referrer-stripping `rel="noopener noreferrer"` on 3 outbound links back to empowrcic.org (missed by an earlier sweep) and added UTM tags to them

## 2026-07-28 — Switched PostHog from `persistence: 'memory'` to `cookieless_mode: 'always'` (`0713504`) as part of the Empowr CIC-wide cookieless rollout; deploy verified ready

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
