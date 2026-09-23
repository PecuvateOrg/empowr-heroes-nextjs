# Empowr Heroes — Non-Negotiables

Forced open by `CLAUDE.md`'s Self-Reference line — read before doing anything else in this
project.

## Rules

- **This repository is PUBLIC** (`PecuvateOrg/empowr-heroes-nextjs`). Never create `DEVLOG.md` or
  `memory.md` in this repo — both filenames are gitignored here, so a copy created in this
  directory is silently never committed. Write session entries to
  `../workspace-docs/empowr-heroes-nextjs/` in the private Empowr CIC hub instead.
- Never put live identifiers, unremediated security findings, or commercial state in any file
  tracked here. See `../CONTEXT.md` and `_config/guides/public-repo-collaboration.md`.
- **No Tailwind** — all CSS is custom, in `src/app/globals.css` using CSS variables
- **Never hardcode URLs** — all external links via `src/lib/links.ts`
- **Never hardcode tier data** — all tier info via `src/lib/tiers.ts`
- **`src/core/` is platform-agnostic** — no Netlify-specific code belongs there
- **No cookie banner** — Variant A (`cookieless_mode: 'always'`) sets no cookies and needs none. The two unused banner components were deleted 2026-07-30; only reintroduce one if optional cookies are actually added.
- **Tier copy lives only in `src/lib/tiers.ts`** — `lead`/`body` (full sentence, used by `/become` + `/checkout`) and `short` (compact rows, used by `/tiers`). Both pages map over `TIER_ORDER`; never inline tier copy into a page again. `src/core/` is TypeScript and imports `tiers.ts` directly — there is no separate CommonJS copy to keep in sync (the old `tier-config.js` was deleted 2026-08-18 when the webhook chain was converted to TS for exactly this reason).
- **Project copy lives only in `src/lib/projects.ts`** — same convention as tiers. `/projects` and `/projects/[project]` (the app's first dynamic route) map over `PROJECT_ORDER`. A project hands off to the existing tier/checkout flow via a `?project=` query param rather than having its own Stripe Payment Link — see `ops/runbooks/add-a-project.md`.
- **`capture_pageview` must stay `'history_change'`** — `true` silently disables client-side route-change tracking and makes the entire funnel invisible. See `_config/guides/posthog-consent.md`.
- **Security headers live in two places** — `netlify.toml` (static assets) and `src/next.config.ts` (runtime-rendered HTML). Both required; keep values identical.
- Run `npx tsc --noEmit` before committing to catch type errors early

## Naming Conventions

- Components: PascalCase (`HeroCard.tsx`)
- Pages: kebab-case route folders (`app/checkout/page.tsx`)
- CSS: custom properties only — `var(--blue)`, `var(--cream)` — never raw hex in components
- External URLs: `LINKS.x` from `src/lib/links.ts` — never hardcode
- Tier data: `TIERS.x` from `src/lib/tiers.ts` — never hardcode
