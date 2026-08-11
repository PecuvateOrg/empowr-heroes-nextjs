import type { MetadataRoute } from 'next'
import { TIER_ORDER } from '@/lib/tiers'

const BASE = 'https://hero.empowrcic.org'

// Tier detail pages are derived from TIER_ORDER so adding a tier can't leave
// the sitemap stale. /checkout and /thankyou are deliberately excluded — they
// are transient steps in the donation flow, not landing pages.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: BASE, changeFrequency: 'monthly', priority: 1 },
    { url: `${BASE}/become`, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE}/tiers`, changeFrequency: 'monthly', priority: 0.8 },
    ...TIER_ORDER.map((key) => ({
      url: `${BASE}/tiers/${key}`,
      changeFrequency: 'yearly' as const,
      priority: 0.6,
    })),
    { url: `${BASE}/patron`, changeFrequency: 'yearly', priority: 0.5 },
    { url: `${BASE}/contact`, changeFrequency: 'yearly', priority: 0.4 },
  ]
}
