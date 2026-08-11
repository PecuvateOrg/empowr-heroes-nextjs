// Tier configuration for the donation handler and email templates.
// Contains the data needed to process donations and build emails.
// For website tier data (Stripe URLs, pricing display), see lib/tiers.ts.

const TIER_CONFIG = {
  seed: {
    label: 'Seed Hero',
    emoji: '🌱',
    price: '£10/month',
    desc: 'Plant the seeds of change — your contribution helps keep our sessions affordable and accessible.',
  },
  momentum: {
    label: 'Momentum Hero',
    emoji: '🚀',
    price: '£25/month',
    desc: 'Build momentum for growth — your support funds the infrastructure that enables sessions to happen consistently.',
  },
  community: {
    label: 'Community Hero',
    emoji: '🫂',
    price: '£50/month',
    desc: 'Power community transformation — your support helps us expand our reach to new venues, schools, and communities.',
  },
  champion: {
    label: 'Champion Hero',
    emoji: '🏆',
    price: '£250/month',
    desc: 'Lead the movement — you\'re fuelling sustainable growth and long-term impact across the UK.',
  },
  legacy: {
    label: 'Legacy Hero',
    emoji: '💎',
    price: '£500/month',
    desc: 'Power moves — your substantial commitment enables us to think and act more ambitiously while maintaining financial stability.',
  },
  // One-time is NOT a subscription tier, but it needs an entry here so the
  // Notion logger can resolve a label. Without it `TIER_CONFIG[tier] || {}`
  // fell through to the raw key and wrote "onetime" instead of "One-Time
  // Hero" — visible on the 4 one-time rows recorded Apr–Jun 2026.
  //
  // Safe to add: every branch that distinguishes one-time from monthly tests
  // `tier === 'onetime'` first, so the email path is unaffected and no badge
  // is ever looked up for it.
  onetime: {
    label: 'One-Time Hero',
    emoji: '💝',
    price: 'Your Choice',
    desc: 'Make a one-off impact — every contribution, no matter the size, supports our mission.',
  },
}

module.exports = { TIER_CONFIG }
