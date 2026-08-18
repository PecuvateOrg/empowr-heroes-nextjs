import { Client } from '@notionhq/client'
import { unstable_cache } from 'next/cache'

// Matches the collection ID in CLAUDE.md and donation-handler.ts
const NOTION_DONATIONS_DATA_SOURCE_ID = '86ae1485-c4e1-8269-ba31-870796a355e1'

export type DonationRecord = {
  tierLabel: string | null
  projectLabel: string | null
  amount: number
}

async function fetchAllDonationRecords(): Promise<DonationRecord[]> {
  const notionApiKey = process.env.NOTION_API_KEY
  if (!notionApiKey) return []

  const notion = new Client({ auth: notionApiKey })
  const records: DonationRecord[] = []
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
      const props = (page as any).properties
      records.push({
        tierLabel: props?.Tier?.select?.name ?? null,
        projectLabel: props?.Project?.select?.name ?? null,
        amount: props?.Amount?.number ?? 0,
      })
    }

    cursor = response.has_more ? response.next_cursor : undefined
  } while (cursor)

  return records
}

/**
 * All donation records from the Notion Donations DB, paginated and flattened
 * to the fields both getMostPopularTier() and getProjectFundingTotals() need.
 * Cached for an hour — Notion is not hit on every page load, and a page that
 * needs both signals (e.g. /become?project=X) makes one fetch, not two.
 */
export const getAllDonationRecords = unstable_cache(
  fetchAllDonationRecords,
  ['all-donation-records'],
  { revalidate: 3600 },
)
