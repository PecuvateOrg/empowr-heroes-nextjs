import { unstable_cache } from 'next/cache'
import { getAllDonationRecords } from './notion-donations'
import { PROJECTS, PROJECT_ORDER, type ProjectKey } from './projects'

// Maps the Project label stored in Notion back to a project key, derived
// from the canonical PROJECTS so it can't drift out of sync.
const PROJECT_LABEL_TO_KEY: Record<string, ProjectKey> = Object.fromEntries(
  PROJECT_ORDER.map((key) => [PROJECTS[key].name, key]),
) as Record<string, ProjectKey>

async function fetchProjectFundingTotals(): Promise<Record<string, number>> {
  try {
    const records = await getAllDonationRecords()
    const totals: Record<string, number> = {}

    for (const record of records) {
      const key = record.projectLabel ? PROJECT_LABEL_TO_KEY[record.projectLabel] : undefined
      if (key) totals[key] = (totals[key] || 0) + record.amount
    }

    return totals
  } catch (err) {
    console.error('[project-funding] Could not compute project funding totals:', err)
    return {}
  }
}

/**
 * Amount raised per project, keyed by project slug. Only counts donations
 * already logged via checkout.session.completed (first payment) — recurring
 * subscription renewals are never re-logged today, so a monthly Hero's total
 * contribution to a project understates over time. That's an existing limit
 * of the platform's donation tracking, not something new introduced here.
 */
export const getProjectFundingTotals = unstable_cache(
  fetchProjectFundingTotals,
  ['project-funding-totals'],
  { revalidate: 3600 },
)
