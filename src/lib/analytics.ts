import { unstable_cache } from 'next/cache'
import { getAllDonationRecords } from './notion-donations'
import { TIERS, TIER_ORDER } from './tiers'

// Maps the Tier label stored in Notion back to a tier key, derived from the
// canonical TIERS so it can't drift out of sync with the display names.
// `onetime` carries an extra raw-key entry: rows written before the
// tier-config fix (see git history) hold the raw key instead of the label —
// the 4 historical rows (Apr–Jun 2026) are the raw form and can be
// relabelled by hand in Notion if a single value is wanted.
const TIER_LABEL_TO_KEY: Record<string, string> = {
  ...Object.fromEntries(TIER_ORDER.map((key) => [TIERS[key].name, key])),
  onetime: 'onetime',
}

async function fetchMostPopularTier(): Promise<string | null> {
  try {
    const records = await getAllDonationRecords()
    const counts: Record<string, number> = {}

    for (const record of records) {
      const key = record.tierLabel ? TIER_LABEL_TO_KEY[record.tierLabel] : undefined
      if (key) counts[key] = (counts[key] || 0) + 1
    }

    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1])
    if (sorted.length === 0) return null

    const [topKey, topCount] = sorted[0]
    const secondCount = sorted.length > 1 ? sorted[1][1] : 0

    // Tied — no clear winner
    if (topCount === secondCount) return null

    // Badge only shows when the leader has 20+ signups AND leads the next tier by 20+
    if (topCount >= 20 && (topCount - secondCount) >= 20) return topKey

    return null
  } catch (err) {
    console.error('[analytics] Could not compute most popular tier:', err)
    return null
  }
}

// Cache for 1 hour — Notion is not hit on every page load
export const getMostPopularTier = unstable_cache(
  fetchMostPopularTier,
  ['most-popular-tier'],
  { revalidate: 3600 },
)
