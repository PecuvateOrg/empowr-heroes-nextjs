# Empowr Heroes — Claude Project Context

Read this file at the start of every session before doing anything else.
Also read: `DEVLOG.md`, `lib/links.ts`, `lib/tiers.ts`.

---

## What This Project Is

Next.js 14 site for the **Empowr Heroes Programme** by **Empowr CIC** (a UK charity).
Hosted on **Netlify**. Repo: `Pecuvate/empowr-heroes-nextjs` on GitHub (`main` branch).

The site allows supporters to become "Heroes" by choosing a monthly giving tier,
which routes them through a checkout page to Stripe.

---

## Who You Are Working With

Non-technical founder. Communicates via voice-to-text — read messages for intent,
not literal wording. Understands the business well. Needs plain-language explanations
with real-world analogies. Always explain the *why* behind recommendations.

---

## Project Structure

```
app/                  Pages (Next.js app router)
components/           Shared UI components
lib/
  links.ts            ← ALL external URLs for the entire site (update here only)
  tiers.ts            ← ALL tier data: names, prices, descriptions, Stripe URLs
public/
  badges/             SVG badge assets per tier
  empowr-favicon-logo.png  (large, unused — kept for reference)
  favicon.ico         Favicon (also served statically at /favicon.ico)
app/favicon.ico       Active favicon (ICO with 16×16 and 32×32 sizes)
DEVLOG.md             ← Running log of every dev session and decisions made
```

---

## Key Decisions & Rules

### Styling
- No Tailwind. All CSS is custom, in `app/globals.css` using CSS variables.
- Font: Nunito via `next/font/google`. Weights: 400, 500, 600, 700, 800, 900 + italic.

### Links
- **Never hardcode external URLs in components or pages.**
- All links live in `lib/links.ts` — import `LINKS` from there.
- Policy docs are hosted at `legalhub.pecuvate.com`.

### Tiers
- All tier data lives in `lib/tiers.ts` — import `TIERS` from there.
- Stripe URLs are in `lib/tiers.ts` too.

### Cookie Banner
- **Active:** `CookieBanner` (simple — Accept/Decline only)
- **Ready but inactive:** `CookieBannerFull` (expandable settings panel with toggles)
- To swap: edit the two commented lines in `app/layout.tsx`
- Only activate `CookieBannerFull` when optional cookies are actually in use AND the cookie policy doc has been updated. See `DEVLOG.md` for full details.

### Favicon
- `app/favicon.ico` is the active favicon (Empowr logo, 16×16 and 32×32).
- To update: replace `app/favicon.ico` with a new ICO file. Keep `public/favicon.ico` in sync.

---

## Before Starting Work

1. Read `DEVLOG.md` — check the latest session and the deferred issues list
2. Check `lib/links.ts` if any policy or contact links are involved
3. Check `lib/tiers.ts` if any tier data is involved
4. Run `npx tsc --noEmit` before committing anything to catch type errors early

## Before Ending a Session

Prompt the user to update `DEVLOG.md` with a summary of what was done.
