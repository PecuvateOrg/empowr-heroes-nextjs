// Canonical tier data for the website. Single source of truth — every page
// that shows a tier reads from here. Adding a tier is a one-file change
// (plus its /tiers/<key> detail page and the Stripe Payment Link).
// See ops/runbooks/add-a-tier.md.
//
// Copy fields, and who uses which:
//   lead  — the bolded opening phrase        (/become, /checkout)
//   body  — the rest of the full sentence    (/become, /checkout)
//   short — terser one-liner for the compact comparison rows (/tiers)
//
// Before 2026-07-30 each of these pages hardcoded its own copy, and they had
// already drifted apart. Do not reintroduce tier copy into a page file.
//
// NOTE: src/lib/tier-config.js is a separate, deliberate duplicate — it is
// CommonJS and feeds the webhook/email path in src/core/. Keep them in sync
// by hand; they are not importable from one another.

export const TIERS = {
  seed: {
    name: 'Seed Hero',
    emoji: '🌱',
    price: '£10/month',
    lead: 'Plant the seeds of change',
    body: 'your contribution helps keep our sessions affordable and accessible.',
    short: 'Plant the seeds of change. Keeps sessions affordable and accessible.',
    stripeUrl: 'https://donate.stripe.com/3cIdR833e32y2zb7Jg18c03',
  },
  momentum: {
    name: 'Momentum Hero',
    emoji: '🚀',
    price: '£25/month',
    lead: 'Build momentum for growth',
    body: 'your support funds the infrastructure that enables sessions to happen consistently.',
    short: 'Build momentum for growth. Funds infrastructure enabling consistent sessions.',
    stripeUrl: 'https://donate.stripe.com/4gMcN47ju1Yu2zb3t018c02',
  },
  community: {
    name: 'Community Hero',
    emoji: '🫂',
    price: '£50/month',
    lead: 'Power community transformation',
    body: 'your support helps us expand our reach to new venues, schools, and communities.',
    short: 'Power community transformation. Expands reach to new venues and communities.',
    stripeUrl: 'https://donate.stripe.com/5kQ7sK7ju7iOgq1gfM18c04',
  },
  champion: {
    name: 'Champion Hero',
    emoji: '🏆',
    price: '£250/month',
    lead: 'Lead the movement',
    body: "you're fuelling sustainable growth and long-term impact across the UK.",
    short: 'Lead the movement. Drives sustainability and strategic development.',
    stripeUrl: 'https://donate.stripe.com/7sYcN4cDO8mS1v70gO18c01',
  },
  legacy: {
    name: 'Legacy Hero',
    emoji: '💎',
    price: '£500/month',
    lead: 'Power moves',
    body: 'your substantial commitment enables us to think and act more ambitiously while maintaining financial stability.',
    short: 'Power moves. Enables ambitious, long-term growth with stability.',
    stripeUrl: 'https://donate.stripe.com/28E00iavGdHc0r3gfM18c00',
  },
  onetime: {
    name: 'One-Time Hero',
    emoji: '💝',
    price: 'Your Choice',
    lead: 'Make a one-off impact',
    body: 'every contribution, no matter the size, supports our mission.',
    short: "Flexible giving. Make a one-off impact whenever you're ready.",
    stripeUrl: 'https://buy.stripe.com/9B6bJ09rCbz48XzbZw18c05',
  },
} as const

export type TierKey = keyof typeof TIERS

/** Display order for tier lists — cheapest first, one-time last. */
export const TIER_ORDER = [
  'seed',
  'momentum',
  'community',
  'champion',
  'legacy',
  'onetime',
] as const satisfies readonly TierKey[]

/** Full sentence form: "Plant the seeds of change — your contribution helps…" */
export function tierDesc(key: TierKey): string {
  return `${TIERS[key].lead} — ${TIERS[key].body}`
}
