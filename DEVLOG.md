# Empowr Heroes — Dev Log

A running record of development sessions, changes made, and decisions taken.

---

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

Discovered from the Empowr Members side, mid-way through that project's live-mode Stripe smoke test: a real Members booking payment (Skate Jam, £7) triggered both the correct Members booking-confirmation email AND a Heroes "Thank You for Supporting Empowr" donor email plus an internal "ACTION NEEDED — unrecognised tier" alert to `hero@empowrcic.org` (confirmed sent 11:07 UTC via Gmail). No phantom Notion row landed — the missing `tier` value was rejected by Notion's own select-field schema before any write could happen.

- **Root cause**: Heroes and Members share one live Stripe account. Stripe fires `checkout.session.completed` to every webhook endpoint registered on the account, regardless of which app's API key created the session — this is not scoped by API key. `donation-handler.ts`'s fallback path (written for a *misconfigured Heroes Payment Link* missing its `tier` metadata) had no way to tell that case apart from *an entirely different app's session*, so it treated the Members booking as an unresolved-tier donation and ran the full donor-email/alert/Notion-log path.
- **Fix**: every genuine Heroes donation arrives via a dashboard-configured Payment Link; every other app (Members included) creates its own sessions via the API with `price_data`, which never carries a `payment_link`. Added a guard on `!session.payment_link` immediately after event-type routing, before any donor/email/Notion logic runs, in `donation-handler.ts`.
- **Landed via a concurrent session, not a standalone commit here**: the fix was written mid-way through this project's own JS→TS migration/"Support a Project" work happening in parallel (same day, same repo) — the guard was sitting uncommitted in the shared working tree and got picked up automatically when that work was committed (`148ffa5`). Confirmed live: deployed commit `69af5a7`, published 12:54 UTC.
- No cleanup needed on the Notion side (nothing was written); the stray internal alert email in `hero@empowrcic.org` was left as-is, not deleted.

## 2026-08-18 — "Support a Project" section shipped; webhook chain converted to TypeScript, `tier-config.js` retired

Two clean commits, both pushed to `main` (`148ffa5`, `69af5a7`) — Netlify auto-deploys.

- **Architecture fix first:** `donation-handler.js`/`stripe-webhook.js` converted to `.ts`, importing `tiers.ts` directly instead of the hand-synced `tier-config.js` (now deleted) — the split only existed because the webhook was CommonJS and couldn't import the app's TS config, and it had already caused one real bug (the missing-`onetime`-entry incident). `analytics.ts` refactored onto a new shared `notion-donations.ts` fetch.
- **New `/projects` section**, alongside (not replacing) the generic Hero signup. `src/lib/projects.ts` is the single source of truth — an explicit `Project` type rather than `as const` inference, so the app type-checks correctly with zero projects configured. `/projects/[project]` is the app's first dynamic route. Backing a project hands off to the *existing* tier/checkout flow via a `?project=` param; `CheckoutConfirm` tags the Stripe URL with `client_reference_id` (no new Payment Link needed per project — confirmed against Stripe's docs). `donation-handler.ts` now writes the resolved project to a new Notion `Project` select property (added via MCP).
- **No real projects configured yet** — `/projects` shows a "no open projects right now" empty state pointing to `/become`, deliberately not shipped with placeholder content. Adding one is a one-file edit to `projects.ts` (see `ops/runbooks/add-a-project.md`); discussed and declined a yes/no interest-survey in favour of watching real conversion via PostHog once a project exists.
- **Verified live, not just built:** `stripe trigger` turned out unable to test the project-tagged path (`payment_link` isn't settable via the API — only Stripe itself sets it on a genuine Payment Link checkout), so verification used a manually-signed synthetic webhook event instead. Confirmed via direct Notion query: the row landed with the correct Tier/Project/Amount. Also confirmed a cross-app guard already present in the working tree (`if (!session.payment_link) return ignored` — not authored this session, found mid-work, preserved) correctly rejects non-Heroes sessions.
- **Along the way:** cleared a stale leftover `next dev` process blocking local testing; caught `donation-handler.js` reappearing on disk byte-identical to git `HEAD` after being deleted (almost certainly an editor auto-restore, not real work — removed again); re-ran `stripe login` after finding the CLI's stored credential had been expired since 2026-07-01.
- **Open:** a synthetic test donation row ("Test Donor (synthetic webhook)", session `cs_test_synthetic_1787056255718`) needs manual deletion from the live Notion Donations DB — no page-trash tool was available to do it directly. A restricted `Customers: Read`-only Stripe key for production (currently a full `sk_test_`/`sk_live_` key) was discussed and deferred as a separate, more careful task.

---

## 2026-08-14

- Added a new `## Skills and Tools Available` section to `CLAUDE.md`, closing an M8 gap flagged by the scheduled mwp-health compliance audit (README already existed and passed M10).

---

## 2026-08-11 (session 2, part 2) — Design pass: patron form expand/collapse, centred heroes, new headline

Follow-up polish after the enquiry forms shipped, done via a local production-build preview server (`next start` on a scratch port) rather than shipping blind.

- **Patron form is now collapsed by default.** It sat open under the page copy on `/patron`, which read as pushy for a rare, high-value CTA. Now it's the original "✉️ Get in Touch" button until clicked, then grows open via a `grid-template-rows` transition (avoids needing a measured height in JS).
- **Every hero/intro block centred**, not just the homepage: `/patron`'s badge+headline+intro, `/become`'s welcome callout, `/tiers`' intro line, and all six tier-detail pages' badge/name/price/tagline. Tier-detail pages centre the back-link too (it's one shared block there); `/patron` keeps its back-link left, matching how `/checkout` and other pages treat back-links.
- **Homepage headline rewritten twice.** First pass replaced "Real Change Starts Here" with no headline at all — promoted the description to a bold `<h1>` instead. User feedback: too much text for a hero, doesn't read as a "quick hit." Reverted to a real two-line headline, new copy **"Wellbeing, Built *by Doing*"** — ties into the brand mantra already used sitewide instead of a generic line that didn't connect to the mission. Chosen from a set of options I drafted; kept the H1 tag throughout both passes for SEO/heading-hierarchy reasons (this page and `not-found.tsx` are the only two `.h1` users).

---

## 2026-08-11 (session 2) — Two enquiry forms (`/patron`, new `/contact`) replaced the site's last mailto CTAs, fixing a spam-classification problem; verified live via netlify dev

---

## 2026-08-11 — Platform audit: the "zero donations" premise was wrong, mail landmine cleared, duplicate page removed, first funnel event shipped

---

## 2026-07-30 (session 2) — Cleanup batch: tier data centralised into `tiers.ts` (removed 3 drifted copies across `/checkout`, `/become`, `/tiers`), dead cookie-banner components removed, sitemap.xml/llms.txt SEO gaps closed

---

## 2026-07-30 — Platform review: fixed `capture_pageview:true` breaking pageview tracking fleet-wide, added security headers to the Next.js runtime, fixed a silent failure on unresolved Stripe tier metadata, corrected inaccurate tier copy, and wrote the campaign UTM taxonomy spec (the "nobody has donated" finding here was corrected by the 2026-08-11 entry above)

---

## 2026-07-29 — Fixed referrer-stripping `rel="noopener noreferrer"` on 3 outbound links back to empowrcic.org (missed by an earlier sweep) and added UTM tags to them

---

## 2026-07-28 — Switched PostHog from `persistence: 'memory'` to `cookieless_mode: 'always'` (`0713504`) as part of the Empowr CIC-wide cookieless rollout; deploy verified ready

---

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
