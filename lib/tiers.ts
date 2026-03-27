export const TIERS = {
  seed: {
    name: 'Seed Hero',
    emoji: '🌱',
    price: '£10/month',
    desc: 'Plant the seeds of change — your contribution helps keep our sessions affordable and accessible.',
    stripeUrl: 'https://donate.stripe.com/3cIdR833e32y2zb7Jg18c03',
  },
  momentum: {
    name: 'Momentum Hero',
    emoji: '🚀',
    price: '£25/month',
    desc: 'Build momentum for growth — your support funds the infrastructure that enables sessions to happen consistently.',
    stripeUrl: 'https://donate.stripe.com/4gMcN47ju1Yu2zb3t018c02',
  },
  community: {
    name: 'Community Hero',
    emoji: '🫂',
    price: '£50/month',
    desc: 'Power community transformation — your support helps us expand our reach to new venues, schools, and communities.',
    stripeUrl: 'https://donate.stripe.com/5kQ7sK7ju7iOgq1gfM18c04',
  },
  champion: {
    name: 'Champion Hero',
    emoji: '🏆',
    price: '£250/month',
    desc: 'Lead the movement — you\'re fuelling sustainable growth and long-term impact across the UK.',
    stripeUrl: 'https://donate.stripe.com/7sYcN4cDO8mS1v70gO18c01',
  },
  legacy: {
    name: 'Legacy Hero',
    emoji: '💎',
    price: '£500/month',
    desc: 'Power moves — your substantial commitment enables us to think and act more ambitiously while maintaining financial stability.',
    stripeUrl: 'https://donate.stripe.com/28E00iavGdHc0r3gfM18c00',
  },
  onetime: {
    name: 'One-Time Hero',
    emoji: '💝',
    price: 'Your Choice',
    desc: 'Make a one-off impact — every contribution, no matter the size, supports our mission.',
    stripeUrl: 'https://buy.stripe.com/9B6bJ09rCbz48XzbZw18c05',
  },
} as const
