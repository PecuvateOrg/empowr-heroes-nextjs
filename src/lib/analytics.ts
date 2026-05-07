import { Client } from '@notionhq/client'
import { unstable_cache } from 'next/cache'

// Matches the collection ID in CLAUDE.md and donation-handler.js
const NOTION_DONATIONS_DATA_SOURCE_ID = '86ae1485-c4e1-8269-ba31-870796a355e1'

const TIER_LABEL_TO_KEY: Record<string, string> = {
  'Seed Hero': 'seed',
  'Momentum Hero': 'momentum',
  'Community Hero': 'community',
  'Champion Hero': 'champion',
  'Legacy Hero': 'legacy',
}

async function fetchMostPopularTier(): Promise<string | null> {
  const notionApiKey = process.env.NOTION_API_KEY
  if (!notionApiKey) return null

  try {
    const notion = new Client({ auth: notionApiKey })
    const counts: Record<string, number> = {}
    let cursor: string | undefined

    do {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response = await (notion as any).dataSources.query({
        data_source_id: NOTION_DONATIONS_DATA_SOURCE_ID,
        ...(cursor && { start_cursor: cursor }),
        page_size: 100,
      })

      for (const page of response.results) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const label: string = (page as any).properties?.Tier?.select?.name
        const key = TIER_LABEL_TO_KEY[label]
        if (key) counts[key] = (counts[key] || 0) + 1
      }

      cursor = response.has_more ? response.next_cursor : undefined
    } while (cursor)

    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1])
    if (sorted.length === 0) return null

    // Only award the badge if there's a clear leader
    const [topKey, topCount] = sorted[0]
    if (sorted.length > 1 && sorted[1][1] === topCount) return null

    return topKey
  } catch (err) {
    console.error('[analytics] Could not fetch tier counts from Notion:', err)
    return null
  }
}

// Cache for 1 hour — Notion is not hit on every page load
export const getMostPopularTier = unstable_cache(
  fetchMostPopularTier,
  ['most-popular-tier'],
  { revalidate: 3600 },
)
