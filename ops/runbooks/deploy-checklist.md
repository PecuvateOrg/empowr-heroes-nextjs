# Runbook: Deploy Checklist

Run through this before merging any branch to `main`.

---

## Code

- [ ] `npx tsc --noEmit` passes with no errors
- [ ] `npm run build` completes successfully
- [ ] No secrets or `.env.local` values hardcoded in any file
- [ ] No console.log statements left in production code paths

## Functionality

- [ ] If the donation flow was touched: tested end-to-end with Stripe CLI in test mode
- [ ] If email template was changed: `npm run preview:email` run for all affected tiers
- [ ] If `lib/links.ts` or `lib/tiers.ts` was changed: affected pages checked in browser

## Infrastructure

- [ ] All required environment variables are set in Netlify (Settings → Environment variables)
- [ ] `netlify.toml` is correct and at project root
- [ ] `.env.local` is in `.gitignore` and not staged

## Git

- [ ] Working on a branch, not `main`
- [ ] Branch is up to date with `main`
- [ ] Commit messages are concise and imperative
- [ ] `DEVLOG.md` updated with a session summary
- [ ] `CLAUDE.md` updated if any new infrastructure or architectural decisions were made

## After merge

- [ ] Netlify build succeeds (check Netlify dashboard)
- [ ] Live site loads correctly
- [ ] Stripe webhook endpoint responds (Stripe dashboard → Webhooks → recent deliveries)
