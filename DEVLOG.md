# Empowr Heroes — Dev Log

A running record of development sessions, changes made, and decisions taken.

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

## 2026-08-11 (session 2) — Two enquiry forms replace the site's last mailto links

Both `patron-enquiry-form_spec.md` (written the previous session) and a new `general-enquiry-form_spec.md` are now built and applied. Both existed to fix the same problem: `mailto:` CTAs with no subject/body land in a Google Workspace inbox as unauthenticated mail from an unknown domain with no prior correspondence — a textbook spam classification, first diagnosed for `/patron` and structurally identical for the `/tiers` "Contact Us" link.

**Shared plumbing, not a shared form.** `src/core/enquiry-handler.js` holds `handlePatronEnquiry()` and `handleGeneralEnquiry()` — two functions sharing `escapeHtml`, a honeypot check, and the Resend send shape, each with its own Netlify function (`patron-enquiry.js` / `general-enquiry.js`) so the client can never influence which inbox a submission reaches. The two forms themselves stay separate components (`PatronEnquiryForm.tsx`, `GeneralEnquiryForm.tsx`) — different required fields, different recipient, different tone; forcing both through one generic form would only have hidden the difference in a config object.

- **`/patron`** — the `mailto:patron@empowrcic.org` CTA inside `.patron-contact` is now a form (name, email, organisation, phone, interest, indicative commitment, message). Styled for the dark gold `.patron-contact` background it sits inside.
- **`/contact`** (new route) — replaces the bare `mailto:hero@empowrcic.org` on `/tiers`. Fields: name, email, topic (dropdown), message. Linked from `/tiers`, the footer, and added to `sitemap.ts` (a real landing page, not a transient flow step). Deliberately not added to the main nav — kept the primary nav conversion-focused.
- **Topic taxonomy lives in its own file** (`src/lib/enquiry-topics.ts`) — the user wants to eventually route some enquiries into a Calendly/video-call flow, and this is the seam that lets a future topic branch into a scheduling embed without restructuring anything shipped here. No scheduling code was added — a "Book a call" option that doesn't book a call would be worse than not offering it.
- **`PATRON_EMAIL`** and **`GENERAL_EMAIL`** env vars added to Netlify (production, deploy-preview, branch-deploy, dev) via CLI — both have hardcoded fallbacks in the handler so a missing var can't silently black-hole a submission.
- **Verified for real, not just built:** ran `netlify dev` locally and hit both Netlify functions directly — honeypot-populated (200, no mail), required-field-missing (400, no mail), and one full success submission per form. Both success submissions used the org's own inboxes (`patron@empowrcic.org`, `hero@empowrcic.org`) as the "prospect" address too, so both the internal notification and the acknowledgement email landed only in inboxes the user already monitors — clearly marked as a Claude Code build-verification test, nothing sent externally.
- `contact-routing.md` and `_config/registry/env-vars.md` updated. `LINKS.email.hero` / `LINKS.email.patron` in `links.ts` are no longer referenced in the UI but left in place, unchanged from the patron spec's original decision.

**Open:** everything the original patron spec left open (the `?tier=` key-vs-label question, unsurfaced billing-portal link, YouTube `sameAs` 404, DMARC `p=none`) is untouched by this session.

---

## 2026-08-11 — Platform audit: the "zero donations" premise was wrong, mail landmine cleared, duplicate page removed, first funnel event shipped

- **This platform has converted. The "nobody has donated" claim in the 2026-07-30 entry below is wrong** — corrected inline there, and superseded here. The Notion DB holds **5 donations, £165 total**, 2026-04-29 → 2026-06-10: four one-time (£100/£20/£15/£20) and one Seed Hero monthly (£10) that later cancelled. Every record shows `Email Status = Sent`, so webhook → Resend → Notion → cancellation are all proven in production. All five predate instrumentation (22 Jun), which is why "zero `/thankyou` pageviews" was true *and* fully consistent with real donations. Correct framing: **no donations since 10 June**. Note the shape — 4 of 5 were one-time and the only monthly subscriber churned, while the site leads with the monthly ladder.
- **Mail landmine cleared.** `CLAUDE.md`, `memory.md` and `docs/donation-flow.md` all named `heroes@hero.empowrcic.org` as the Resend sender; that subdomain has no MX, SPF, DKIM or DMARC, so mail from it would fail outright. The code's `hero@empowrcic.org` was always right — the docs were wrong in the direction that breaks production if acted on. Same pass fixed webhook drift: the doc described `payment_intent.succeeded`, `customer.subscription.created` and `invoice.payment_action_required`, none of which the handler uses.
- **`/why-experiential-learning` removed** (`bd8489e`, PR #12) — a word-for-word duplicate of `empowrcic.org/experiential-learning/report`, with no inbound links and two pageviews ever, while three "read the research" links sent people off-site to the Main Site copy. Main Site is canonical; the URL now 301s there (`4a34abc`), chosen over a 404 because Main Site planning notes record its copy as ported *from* this page. Took 181 lines of dead CSS with it; source preserved in `Empowr CIC/_trash/`.
- **`donation_started` shipped** (`3c46ad4`) — the site's first custom event, on the Proceed-to-Payment click. Verified live with correct `tier`/`price`/`is_recurring`, and it immediately captured a Stripe abandonment, previously indistinguishable from never clicking.
- **`TIER_CONFIG` gained an `onetime` entry** (`2f08701`, PR #14) — its absence made the Notion logger write the raw key, visible on all four one-time rows. This also corrected a claim committed hours earlier in `5c1f782`: the one-time Payment Link **already** redirects to `/thankyou/onetime`, so that flow was never broken. The error came from treating a memory note labelled "verified via Stripe MCP" as the verification itself.
- **Two specs written** (`65f1e9f`), neither built: `patron-enquiry-form_spec.md` — replace the `/patron` mailto, since inbound Outlook mail is spam-filtered by the receiving Google Workspace mailbox and no DNS fix exists for mail composed on the sender's infrastructure; and `stack-revamp_spec.md` — Heroes is the only estate project still on plain CSS with no eslint, D1–D4 awaiting decisions. **Open:** whether `?tier=` carries the key or the label on the monthly redirect (the pill silently vanishes if it is the label), the unsurfaced billing-portal link, the YouTube `sameAs` 404, and DMARC still at `p=none`.

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
