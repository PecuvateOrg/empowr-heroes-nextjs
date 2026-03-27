# Empowr Heroes — Dev Log

A running record of development sessions, changes made, and decisions taken.

---

## Session — 27 March 2026

### Cookie Banner

**Problem:** The original cookie banner had no animation and only an "Accept All / Decline" prompt with no explanation of what cookies were being used or why.

**What we built:**
- Added a slide-up animation on entry and slide-down on dismiss
- Restructured the banner with clearer copy
- Had a full discussion about GDPR and cookie categories (Strictly Necessary, Analytics, Functional) — decided to keep the live banner simple since no optional cookies are currently in use
- Built a second component `CookieBannerFull` which is ready to swap in when optional cookies are added. It features a compact bar with **Decline / Cookie Settings / Accept All**, and "Cookie Settings" expands an upward panel with toggles for each category

**Decision:** Only show cookie categories that are actually being used. Showing toggles for non-existent cookies is misleading under GDPR.

**How to activate the full banner:**
1. Add the optional cookie service to the codebase (e.g. Google Analytics), gated on consent
2. Update the cookie policy document at legalhub.pecuvate.com
3. In `app/layout.tsx`, comment out `<CookieBanner />` and uncomment `<CookieBannerFull />`

---

### Performance Audit & Fixes

Ran a full sweep of the source code for performance issues. Key findings and fixes:

| Fix | File(s) | Impact |
|---|---|---|
| Added `priority` prop to nav logo | `components/Nav.tsx` | Faster LCP — logo now loads first |
| Removed unused font weight `300` | `app/layout.tsx` | One fewer font file downloaded |
| Enabled AVIF/WebP image formats | `next.config.ts` | 30–50% smaller images for modern browsers |
| Replaced 426KB PNG favicon with SVG | `app/icon.svg` | 99.9% size reduction (500 bytes) |
| Added `description` to all pages missing it | All tier pages, checkout, patron, thankyou | SEO and social sharing |
| Extracted tier data to shared file | `lib/tiers.ts` | Single source of truth for all tier info |

**Note on favicon:** The SVG is a placeholder (blue square, white "E"). To replace with the actual Empowr logo, visit favicon.io, upload the logo PNG, download the output, rename to `icon.png` or `icon.ico` and drop into the `app/` folder.

---

### Centralised Links (`lib/links.ts`)

**Problem:** External URLs were hardcoded in multiple files. Updating a link required tracking down every file that used it — and some files had already gone stale (CheckoutConfirm still had old policy URLs).

**Solution:** Created `lib/links.ts` as the single source of truth for all external links.

```
lib/
  links.ts   ← all external links (policy, email, assets)
  tiers.ts   ← tier names, prices, Stripe URLs
```

**Links managed:**
- `LINKS.policy.legalDisclaimer`
- `LINKS.policy.termsAndConditions`
- `LINKS.policy.privacyPolicy`
- `LINKS.policy.cookiePolicy`
- `LINKS.email.hero`
- `LINKS.email.patron`
- `LINKS.assets.logo`

To update any link across the entire site, edit `lib/links.ts` only.

---

### Other Fixes

- Fixed a TypeScript error on the thank you page when indexing `TIERS` — caused a Netlify deploy failure
- Updated Legal Disclaimer and Terms & Conditions links in the footer (URLs had changed)
- Fixed stale policy URLs in `CheckoutConfirm.tsx` that had not been updated when footer links changed
- Added `.claude/settings.local.json` to `.gitignore` to prevent Claude Code's local config appearing as a pending change

---

### Known Issues — Noted but Deferred

These were flagged during the performance audit but left as-is. No need to re-audit them next session.

| Issue | File | Reason deferred |
|---|---|---|
| `backdrop-filter: blur(14px)` on nav | `globals.css:51` | Design choice — removing/reducing would change the look |
| `@keyframes bob` infinite animation | `globals.css:713` | Decorative, only on thank you page, low impact |
| Inline styles on nav link and logo | `Nav.tsx:18,24` | Functional, very minor |
| Inline styles on become page | `become/page.tsx` | Functional, very minor |
| No dynamic imports / code splitting | All pages | App is small enough that this isn't worth the complexity yet |
| CheckoutConfirm uses `<a>` instead of `<button>` for disabled state | `CheckoutConfirm.tsx:30` | Works correctly, semantic improvement only |

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
