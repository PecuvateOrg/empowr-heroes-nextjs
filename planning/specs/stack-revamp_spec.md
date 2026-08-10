# Heroes Stack Revamp — Spec

**Status:** proposed, awaiting decision
**Date:** 2026-08-10
**Applies to:** `empowr-heroes-nextjs` — build structure, tech stack, and CSS architecture

---

## What this is and why it exists

Heroes was the first Empowr platform built, and it is the only one that did not converge on the estate standard. Everything since has been Tailwind v4 + shadcn/ui with eslint; Heroes is plain CSS with no linting.

This is not cosmetic. The divergence means estate-wide changes have to be hand-translated for one project, patterns proven elsewhere cannot be lifted in, and the site carrying **the only revenue path in the organisation** is the one with the least tooling support.

### ⚠️ This spec is the gate

`Empowr CIC/CLAUDE.md` → Shared Constraints currently reads:

> **Legacy:** `empowr-heroes-nextjs` stays on plain CSS — **do not migrate without an explicit decision**

Approving this spec *is* that decision. On approval, that line must be amended in the same change — otherwise the constraint and the codebase contradict each other.

---

## Current state — how Heroes diverges

| | Heroes | Estate standard |
|---|---|---|
| CSS | plain, 1,486-line `globals.css` | Tailwind v4 via `@theme` |
| Component library | none | shadcn/ui |
| `postcss.config.mjs` | absent | present |
| Lint | **no eslint dep, no `lint` script** | `lint` in all 6 peers |
| Business logic | `src/core/` | `lib/` |
| Next.js | 16.2.1 | 16.2.6 (Main, EFN) · 15.x (others) |
| `tsconfig.json` | `strict: true` | identical ✅ |

The TypeScript foundation already matches. The gap is CSS, tooling, and layout.

---

## What must survive

**1. `src/core/` stays exactly as it is.** Platform-agnostic business logic with a thin Netlify adapter is *better* than the estate norm, not worse. It is deliberately extractable into a standalone service. Do not normalise it to `lib/` for the sake of consistency — consistency is not the goal, quality is.

**2. The animation work.** This was the stated reason to be careful, so it was profiled precisely (2026-08-10):

| Asset | Status |
|---|---|
| `@keyframes bob` — `.confetti` on thank-you pages | **live**, the only active keyframe |
| ~24 `transition:` declarations — button/card hover, tier rows, footer accordion (`grid-template-rows 0.3s`) | **live** |
| `@keyframes fadeUp` | **dead** — defined line 793, referenced nowhere |
| `@keyframes cookie-slide-up` / `-down` + `.cookie-*` block | **dead** — banner components deleted 2026-07-30, CSS left behind |

**Three of the four keyframes are dead.** The animation actually worth keeping is one keyframe plus a set of hover transitions — all of which Tailwind v4 expresses natively (`@theme` custom animations, plus `transition-*` utilities). This is the lowest-risk part of the migration, not the highest.

**3. Cookieless PostHog config.** `cookieless_mode: 'always'` and `capture_pageview: 'history_change'` must survive untouched. The latter caused a total funnel blackout when wrong.

---

## Decisions required

### D1 — In-place migration, or parallel rebuild? *(recommend: in-place)*

Eight routes, all largely static, no auth, no database. A parallel rebuild doubles the surface area and puts the donation path through a cutover for no proportionate gain. Migrate in place, route by route, behind normal deploy previews.

### D2 — Port `globals.css`, or retire it progressively? *(recommend: retire)*

Do not translate 1,486 lines wholesale. Lift the **22 CSS custom properties** into `@theme` as brand tokens — they map cleanly — then delete each rule block as its route is converted. `globals.css` shrinks to nothing rather than being rewritten.

### D3 — Adopt shadcn/ui? *(recommend: partial)*

Heroes has five components, three of which are bespoke presentational (`Mantra`, `Footer` accordion, `CheckoutConfirm`). Add shadcn for the new patron form's inputs and any future forms; do not retrofit the existing three. Full adoption would be churn without benefit.

### D4 — Next 16.2.1 → 16.2.6? *(recommend: yes, first)*

Patch-level, aligns with Main Site and EFN. Do it before the CSS work so any regression is unambiguously attributable.

---

## Phased plan

**Phase 0 — Safety net (do first)**
1. Add eslint + `lint` script matching the estate config
2. Bump Next 16.2.1 → 16.2.6
3. `npx tsc --noEmit` and `lint` both green before anything else moves

No linting currently exists, so there is nothing guarding a 279-rule CSS refactor. This phase buys the guard rail.

**Phase 1 — Dead code purge (free win, do before migrating)**

Removing dead code first shrinks the migration surface by roughly a fifth:

| Target | Lines | Note |
|---|---|---|
| `.cookie-*` block + 2 keyframes | ~1235 → end of section | banner deleted 2026-07-30 |
| `@keyframes fadeUp` | 793 | referenced nowhere |
| `.el-*` / `.page-el` rules | ~911–1078 | orphaned page — see the 2026-08-10 audit |

⚠️ **`.eyebrow` (line 102) must be kept** — `/patron` uses it. It reads as part of the `.el-*` family and is not. Exact block boundaries to be confirmed at execution time.

**Phase 2 — Tokens**
Install Tailwind v4 + `postcss.config.mjs`; register the 22 custom properties in `@theme`; both systems run side by side.

**Phase 3 — Components**
Convert `Nav`, `Footer`, `Mantra`, `CheckoutConfirm`, `PostHogProvider` wrapper markup.

**Phase 4 — Routes, in ascending risk order**
`/why-experiential-learning` *(if retained)* → `/patron` → `/` → `/tiers` → `/tiers/[key]` → `/become` → **`/checkout` → `/thankyou` → `/thankyou/onetime` last**.

The final three are the money path. They are also the least exercised — zero donations means zero production validation — so they get converted last, individually, with manual verification each time.

**Phase 5 — Close out**
Delete `globals.css`; amend `Empowr CIC/CLAUDE.md` Shared Constraints; update `CLAUDE.md` Key Rules (the "No Tailwind" rule inverts); DEVLOG entry.

---

## Risks

| Risk | Mitigation |
|---|---|
| **Donation path has never run in production** — zero donations means a regression would not surface through real traffic | Convert last, one route at a time; manually walk `/become → /checkout → Stripe` on a deploy preview after each |
| **No test suite anywhere** (estate-wide, not Heroes-specific) | eslint + `tsc` in Phase 0 are the only automated guards; lean on deploy previews |
| **No `prefers-reduced-motion` handling exists** — `.confetti` runs an infinite animation unguarded | Add the guard during Phase 3; the only `transition: none` in the file today is a desktop breakpoint rule, not an accessibility one |
| Netlify `base = "src"` — a root-only commit can cancel as "no content change" | Known estate gotcha; verify each deploy actually built |

---

## Acceptance criteria

- [ ] `lint` and `npx tsc --noEmit` both pass
- [ ] `globals.css` deleted; no plain-CSS rules remain outside `@theme`
- [ ] `.confetti` bob animation and all hover transitions render identically to today
- [ ] `prefers-reduced-motion` guard present
- [ ] PostHog still initialises with `cookieless_mode: 'always'` **and** `capture_pageview: 'history_change'`
- [ ] `src/core/` unchanged in structure
- [ ] Full donation walk verified on a deploy preview: `/` → `/become` → `/checkout` → Stripe redirect
- [ ] `Empowr CIC/CLAUDE.md` Shared Constraints amended
- [ ] Heroes `CLAUDE.md` Key Rules updated — the "No Tailwind" rule inverts

---

## Out of scope

Tracked separately from the 2026-08-10 platform audit:

- **Patron enquiry form** — [`patron-enquiry-form_spec.md`](./patron-enquiry-form_spec.md), independent and higher priority
- Correcting the `heroes@hero.empowrcic.org` claim in `CLAUDE.md`, `memory.md`, `docs/donation-flow.md` — do now, unrelated to the revamp
- `donation_started` instrumentation and the PostHog empty-UA bot filter
- `/thankyou/onetime` Stripe redirect verification
- Billing-portal link surfacing
- DMARC `p=none` → `p=quarantine`
