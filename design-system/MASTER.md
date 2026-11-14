# Design System — Empowr Heroes (hero.empowrcic.org)

> What **this project** decided. Read before building or changing any page.
> Layers, read bottom-up; each may be stricter than the one above, never looser:
> 1. Web Build Framework (`core/` + the matching `types/` overlay): rules for any build.
> 2. Brand kit: the Empowr brand kit, `company/identity/brand-guide.md` in the Empowr CNS (private hub): colours, logo, Nunito, voice and the UI house style, including its **contrast table**. **Not restated here.**
> 3. This file: only what is specific to this project.

| | |
|---|---|
| **Build type** | marketing-site (donations) |
| **Framework** | Next.js 16; **plain CSS custom properties** (the origin of the brand tokens; do not migrate without a decision, per the brand kit) |
| **Created** | 2026-11-14 (recorded from the code as it stands) |
| **Last decision** | 2026-11-14 |

---

## Layout

Donation pages.

## Current state vs the brand kit

- Brand tokens ✅ (they started here); Nunito plus Inter.
- Red text used once.

---

## Decision log

### 2026-11-14 — Recorded
- First design record, from the group-wide design records pass. No code changed; gaps below
  are fixed per project, with screenshots before anything goes live.

## Open questions

- [ ] Inter is loaded alongside Nunito: drop it (one font, Nunito).
