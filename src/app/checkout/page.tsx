import Link from 'next/link'
import { notFound } from 'next/navigation'
import CheckoutConfirm from '@/components/CheckoutConfirm'
import { TIERS, type TierKey } from '@/lib/tiers'
import { PROJECTS, type ProjectKey } from '@/lib/projects'

export const metadata = {
  title: 'Confirm Your Contribution — Empowr Heroes',
  description: 'Review and confirm your Hero tier contribution to Empowr CIC. Your support helps us deliver experiential wellbeing programmes across the UK.',
}

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ tier?: string; project?: string }>
}) {
  const { tier, project } = await searchParams
  const tierInfo = tier ? TIERS[tier as keyof typeof TIERS] : null

  if (!tierInfo) notFound()

  // Project is supplementary context, not a required param — an unknown or
  // missing slug just means "no project", never a 404.
  const projectInfo = project && project in PROJECTS ? PROJECTS[project as ProjectKey] : null

  return (
    <main className="page-content page-checkout">
      <div className="wrap checkout-wrap">
        <Link href={projectInfo ? `/projects/${project}` : '/become'} className="back-btn">
          ← Back to {projectInfo ? projectInfo.name : 'Hero Tiers'}
        </Link>

        {projectInfo && (
          <div className="checkout-project-banner">
            {projectInfo.emoji} Supporting <strong>{projectInfo.name}</strong>
          </div>
        )}

        <div className="checkout-header">
          <div className="checkout-emoji">{tierInfo.emoji}</div>
          <h1 className="checkout-title">You're becoming a<br /><strong>{tierInfo.name}</strong></h1>
          <div className="checkout-price">{tierInfo.price}</div>
          <p className="checkout-desc">{tierInfo.lead} — {tierInfo.body}</p>
        </div>

        <CheckoutConfirm stripeUrl={tierInfo.stripeUrl} tierKey={tier as TierKey} project={projectInfo ? (project as string) : null} />
      </div>
    </main>
  )
}
