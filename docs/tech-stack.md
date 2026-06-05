# Tech Stack & Design System — Empowr Heroes

Reference for anyone (human or agent) picking up this project cold. Covers what we use, why, and how it's designed.

---

## Framework & Runtime

| Layer | Technology | Version | Notes |
|---|---|---|---|
| Framework | Next.js (App Router) | `^16.2.1` | SSR/SSG, API routes, image optimisation |
| UI runtime | React | `^19.0.0` | — |
| Language | TypeScript | `^5` | Strict mode, path alias `@/*` → `./src/*` |
| Node target | ES2017 | — | Set in tsconfig |

**Why Next.js App Router:** Server Components reduce JS bundle; App Router structure maps cleanly onto the donation journey pages.

---

## Production Dependencies

| Package | Version | Purpose |
|---|---|---|
| `stripe` | `^21.0.1` | Payment processing — Payment Links + webhooks |
| `resend` | `^6.10.0` | Transactional email delivery |
| `@notionhq/client` | `^5.16.0` | Donation logging and analytics queries |
| `next` | `^16.2.1` | Framework |
| `react` / `react-dom` | `^19.0.0` | UI runtime |

---

## Dev Dependencies

| Package | Version | Purpose |
|---|---|---|
| `@netlify/plugin-nextjs` | `^5.15.9` | Netlify build adapter for Next.js |
| `@types/node` | `^20` | Node type definitions |
| `@types/react` / `@types/react-dom` | `^19` | React type definitions |
| `typescript` | `^5` | Compiler |

---

## Infrastructure & External Services

| Service | Provider | Purpose |
|---|---|---|
| Hosting | Netlify | App deployment + serverless Functions |
| Webhook endpoint | Netlify Functions | `/.netlify/functions/stripe-webhook` |
| DNS | AWS Route 53 | Domain management (registrar: Namecheap) |
| Payments | Stripe | Payment Links (6 tiers), subscription management, Billing Portal |
| Email | Resend | Transactional welcome emails + internal notifications |
| Donation database | Notion | Audit trail — every donation, cancellation, and failed payment logged |
| Badge/asset CDN | AWS S3 | Badge PNGs served from `empowr-cic.s3.us-east-1.amazonaws.com` |
| Font | Google Fonts | Nunito (loaded via `next/font/google`) |
| Domain | hero.empowrcic.org | Production URL |
| Repo | GitHub | `Pecuvate/empowr-heroes-nextjs`, `main` branch |

---

## Styling Approach

**No Tailwind. Custom CSS only.** All styles live in `src/app/globals.css` using CSS custom properties. This was a deliberate decision — see `planning/decisions/` for context.

### Color Palette

| Variable | Value | Usage |
|---|---|---|
| `--blue` | `#4A70C2` | Primary brand, buttons, links, active states |
| `--blue-dark` | `#3558a8` | Hover state for blue buttons |
| `--blue-light` | `#7093d4` | Lighter accents, gradient fills |
| `--blue-pale` | `#eef3fc` | Light section backgrounds, callout boxes |
| `--blue-soft` | `rgba(74,112,194,0.10)` | Subtle overlays, hover highlights |
| `--red` | `#FF6161` | Alerts, destructive actions, accent highlights |
| `--red-dark` | `#e04444` | Red hover state |
| `--red-soft` | `rgba(255,97,97,0.09)` | Red soft backgrounds |
| `--black` | `#1B1B1B` | Body text, primary headings |
| `--mid` | `#4a4a4a` | Secondary text |
| `--muted` | `#7a7a8a` | Tertiary text, captions, metadata |
| `--cream` | `#f8f7f4` | Page background (warm off-white) |
| `--warm-white` | `#fdfcfa` | Card and section backgrounds |
| `--card` | `#ffffff` | Pure white cards |
| `--border` | `#e5e1db` | Standard borders (soft beige) |
| `--border-b` | `rgba(74,112,194,0.18)` | Blue-tinted borders |
| `--patron-gold` | `#b8924a` | Founding Patron tier accent |
| `--patron-gold-lt` | `#d4aa6a` | Lighter patron gold |
| `--patron-gold-s` | `rgba(184,146,74,0.12)` | Soft patron gold backgrounds |
| `--patron-border` | `rgba(184,146,74,0.25)` | Patron-specific borders |
| `--patron-deep` | `#2e2416` | Dark patron text |
| `--patron-bg` | `#faf8f3` | Patron page background |

**Rule:** Never use raw hex values in components. Always reference via `var(--variable-name)`.

### Typography

- **Font family:** Nunito (Google Fonts)
- **Weights loaded:** 400, 500, 600, 700, 800, 900 + italic variants
- **Loading strategy:** `font-display: swap` via `next/font/google`
- **CSS variable:** `--font-nunito`

| Class | Size | Weight | Notes |
|---|---|---|---|
| `.h1` | `clamp(2rem, 5vw, 4rem)` | 900 | Letter-spacing -0.02em |
| `.h2` | `clamp(1.4rem, 3vw, 2.4rem)` | 900 | Letter-spacing -0.015em |
| `.h3` | `clamp(0.95rem, 2vw, 1.15rem)` | 800 | — |
| `.body` | `clamp(0.9rem, 1.8vw, 1rem)` | 400 | Line-height 1.8 |
| Eyebrow | `0.68rem` | 800 | Uppercase, letter-spacing 0.18em |

All type scales use `clamp()` for fluid, mobile-first sizing — no separate breakpoint overrides needed.

### Layout

- **Container:** `max-width: 880px`, centred, responsive padding (1.25rem mobile → 2rem tablet+)
- **Grid breakpoints:** mobile-first base → `@600px` (2-col) → `@900px` (3-4 col)
- **Buttons:** Pill shape (`border-radius: 100px`). Three variants:
  - `.btn-blue` — solid blue, shadow, lifts on hover (`translateY(-2px)`)
  - `.btn-outline` — transparent, bordered
  - `.btn-ghost` — minimal, no border
- **Cards:** White background, soft border, light shadow, hover: lift + deeper shadow
- **Callout boxes:** Blue-pale background, left blue border, rounded
- **Hero visual depth:** Radial gradient glows (blue top-right, red bottom-left) on key hero sections

### Responsive Breakpoints

| Breakpoint | Behaviour |
|---|---|
| Base (mobile) | Single column, stacked layout |
| `@600px` | Flex rows, 2-column grids |
| `@768px` | Tier rows go horizontal |
| `@900px` | Full desktop grids (3–4 cols), larger containers |

---

## Key Architectural Decisions

### Agent-First Design
All data is structured and typed for programmatic access:
- `src/lib/tiers.ts` — all tier definitions + Stripe URLs
- `src/lib/links.ts` — all external URLs (never hardcoded in components)
- `src/lib/badges.js` — all S3 badge URLs
- `src/core/donation-handler.js` — portable business logic, no platform coupling

### Portable Business Logic
`src/core/` contains zero Netlify-specific code. The Netlify Function in `netlify/functions/stripe-webhook.js` is a thin adapter only. This means `src/core/` can be extracted into a shared Pecuvate service without any rewrite.

### Custom CSS Over Tailwind
Chosen for brand control and agent legibility — CSS variables are easy to parse and modify without knowing Tailwind's utility class names. Patron tier styling (gold palette) exists as a completely separate set of variables so it can be restyled independently.

### Notion as Audit Trail
Chosen over a traditional database because Empowr CIC already uses Notion for operations. Every donation creates a record with full metadata (tier, amount, status, cancellation reason, payment attempts). Non-technical founder can view and filter donations without a dashboard.

### Cookie Banner Toggle
Two components exist: `CookieBanner` (active — simple accept/decline) and `CookieBannerFull` (inactive — expandable toggles). Swappable via two commented lines in `src/app/layout.tsx`. Full version activates only when optional tracking cookies are in use.
