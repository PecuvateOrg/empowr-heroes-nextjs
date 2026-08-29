# Empowr Heroes — Dev Log

A running record of development sessions, changes made, and decisions taken.

---

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

Found from the Members side while scoping Phase 2 subscriptions. The 2026-08-18 fix below was real but **incomplete in a way that mattered**: it guarded `checkout.session.completed`, and that branch sits *below* `customer.subscription.deleted` and `invoice.payment_failed` in the same router. Both were unguarded.

- **What would have happened.** Members' Phase 2 introduces per-session Subscriptions on the same shared account. A member cancelling their £25/mo Skate Jam plan fires `customer.subscription.deleted`; Heroes would have fetched that customer from Stripe, **written them into the Heroes donor Notion database**, and emailed an internal "supporter cancelled" alert. Same for a failed card via `invoice.payment_failed`. Members holds children's data, which makes the leak worse than the original incident. Nothing had fired yet — Members had no subscriptions.
- **Stripe endpoint event filters do not help.** Filtering is by event *type*, not originating app, and this endpoint already subscribes to both events. Confirmed against the live account: Heroes' endpoint `we_1TIQI0…` carries `checkout.session.completed`, `customer.subscription.deleted`, `invoice.payment_failed`.
- **Fix is structural, not another guard.** `resolveEventOwnership()` in new `core/event-ownership.ts` runs **once, before routing**. Positive identification only; default-deny; a new event type cannot reach a handler without being classified first. Adding a per-branch check would have rebuilt the same fragility — the reason this recurred is that the rule lived in one of three sibling branches. Same shape as the AdminHeader misses on Members.
- **The signal is the Stripe Product ID, not metadata.** All five recurring Payment Links carry `subscription_data.metadata = {}`, so **Heroes' own subscriptions have no metadata on the Subscription object** — a metadata guard would have rejected genuine donors. Product IDs are embedded in the event payload (`subscription.items.data[].price.product`, `invoice.lines.data[].pricing.price_details.product`), so the check costs zero API calls and works retroactively. ⚠️ **Adding a tier now means adding its Product ID to `HEROES_PRODUCT_IDS`** or its subscription/invoice events are silently ignored.
- **Also fixed a pre-existing bug in the same function.** `invoice.subscription` does not exist on this account's API version — it moved to `invoice.parent.subscription_details.subscription`. The `(invoice as any).subscription` cast silenced TypeScript and evaluated to `undefined` every time, so **every payment-failed alert and Notion row has carried a null subscription ID.** Verified by fetching a real invoice (`in_1TRWKy…`), not by reading SDK types.
- **Verified against a real foreign object, not just fixtures.** `npm run verify:ownership` is 12/12 with fixtures mirroring live payloads. Beyond that, a genuine Members subscription was created in test mode (`sub_1U8lnw…`, product `prod_V93Ye60bephM1l`) and fed through the deployed resolver: rejected with *"subscription products [prod_V93Ye60bephM1l] are not Heroes products"*. A suite fed only Heroes' own events proves the handler works, not the guard.
- **Live.** Merged as `83be16e`, Netlify deploy `ready` on that exact commit 18:57 UTC. **Not yet exercised by a real event** — the first genuine signal will be an `Ignoring … not a Heroes object` line in the function logs when Members' first live subscription event arrives. Deliberately not forced: the only way to trigger it today would be a real donor-facing side effect.
- Blast radius check: the live account holds exactly **one** subscription ever (a £10 Seed Hero, already cancelled), and it carried `metadata: {}` — which is what proved the metadata-guard approach wrong.

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
