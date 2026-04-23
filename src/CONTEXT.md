# src/ — Application Code

Read this before touching any component, page, or library file.

---

## What lives here

| Folder | Purpose |
|---|---|
| `app/` | Next.js App Router pages and layouts |
| `components/` | Shared UI components |
| `lib/` | Typed data and URL constants (`links.ts`, `tiers.ts`, `tier-config.js`, `badges.js`) |
| `core/` | Donation automation business logic (`donation-handler.js`, `email-template.js`) |

---

## Styling rules

- No Tailwind. All CSS lives in `app/globals.css` using CSS variables.
- Never use raw hex values in components — always `var(--variable-name)`.
- Font: Nunito via `next/font/google`. Weights: 400, 500, 600, 700, 800, 900 + italic.

Key colour variables: `--blue`, `--blue-dark`, `--blue-pale`, `--cream`, `--warm-white`, `--border`, `--muted`, `--patron-gold`. Full palette in `app/globals.css`.

---

## Import rules

- Use the `@/` alias for all imports between folders: `@/components/Nav`, `@/lib/links`, `@/lib/tiers`.
- Never hardcode external URLs in components — import `LINKS` from `@/lib/links`.
- Never hardcode tier data in components — import `TIERS` from `@/lib/tiers`.

---

## Component conventions

- Components are PascalCase, colocated in `components/`.
- Pages live in `app/` following Next.js App Router conventions.
- No component should contain business logic — that belongs in `core/`.

---

## Core / donation logic

- `core/donation-handler.js` — all webhook business logic. No platform-specific code.
- `core/email-template.js` — HTML and plain text email builders. Edit this for any email copy or design changes.
- This code is intentionally portable — no Netlify-specific imports.

---

## Before editing

1. Check `lib/links.ts` if anything involves a URL or contact address.
2. Check `lib/tiers.ts` if anything involves tier names, prices, or Stripe URLs.
3. Check `core/email-template.js` if anything involves email copy or design.
4. Run `npx tsc --noEmit` before committing.
