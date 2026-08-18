import Link from 'next/link'
import { notFound } from 'next/navigation'
import Mantra from '@/components/Mantra'
import { getProjectFundingTotals } from '@/lib/project-funding'
import { PROJECTS, PROJECT_ORDER, projectDesc, type ProjectKey } from '@/lib/projects'

export const revalidate = 3600

export function generateStaticParams() {
  return PROJECT_ORDER.map((project) => ({ project }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ project: string }>
}) {
  const { project } = await params
  const info = project in PROJECTS ? PROJECTS[project as ProjectKey] : null
  if (!info) return {}
  return {
    title: `${info.name} — Empowr Heroes`,
    description: info.tagline,
  }
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ project: string }>
}) {
  const { project } = await params
  const info = project in PROJECTS ? PROJECTS[project as ProjectKey] : null

  if (!info) notFound()

  const totals = await getProjectFundingTotals()
  const raised = totals[project] || 0
  const pct = Math.min(100, Math.round((raised / info.goalAmount) * 100))

  return (
    <main className="page-content page-tier-detail">
      <div className="td-hero">
        <div className="td-hero-inner">
          <Link href="/projects" className="back-btn">← All Projects</Link>
          <div className="td-emoji-lg">{info.emoji}</div>
          <div className="td-tier-name">{info.name}</div>
          <div className="td-tagline"><strong>{info.lead}</strong> — {info.body}</div>
        </div>
      </div>

      <div className="wrap section-top-2">
        <div className="pc-progress pc-progress-lg">
          <div className="pc-progress-track">
            <div className="pc-progress-fill" style={{ width: `${pct}%` }} />
          </div>
          <div className="pc-progress-label">
            <strong>£{raised.toLocaleString('en-GB')}</strong> raised of £{info.goalAmount.toLocaleString('en-GB')} goal
          </div>
        </div>

        <div className="tag-section">
          <span className="tag-label">What Your Support Funds</span>
          <div className="impact-sm">
            {info.impactAreas.map((area) => (
              <div className="impact-sm-item" key={area.title}>
                <div className="impact-sm-icon">{area.icon}</div>
                <div className="impact-sm-body">
                  <strong>{area.title}</strong>
                  <span>{area.body}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="role-quote">{projectDesc(project as ProjectKey)}</div>

        <div className="cta-band">
          <div className="cta-band-text">
            <strong>Ready to back {info.name}?</strong>
            <span>Choose a monthly tier or a one-off gift — every contribution is counted toward this project.</span>
          </div>
          <Link href={`/become?project=${project}`} className="btn-white">{info.emoji} Support This Project →</Link>
        </div>

        <div className="btn-row">
          <Link href="/projects" className="btn btn-outline">← All Projects</Link>
          <Link href="/become" className="btn btn-blue">Become a Hero</Link>
        </div>
        <Mantra />
      </div>
    </main>
  )
}
