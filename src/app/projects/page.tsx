import Link from 'next/link'
import Mantra from '@/components/Mantra'
import { getProjectFundingTotals } from '@/lib/project-funding'
import { PROJECTS, PROJECT_ORDER } from '@/lib/projects'

export const metadata = {
  title: 'Support a Project — Empowr Heroes',
  description: 'Back a specific Empowr project directly — see exactly what your contribution funds.',
}

export const revalidate = 3600

export default async function ProjectsPage() {
  const totals = await getProjectFundingTotals()

  return (
    <main className="page-content page-become">
      <div className="wrap">
        <div className="callout callout-hero">
          <div style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--blue)', marginBottom: '0.5rem' }}>
            Back Something Real 🎯
          </div>
          💡 Instead of a general contribution, choose a specific project to support — and see exactly what your gift makes possible.
        </div>

        <h2 className="h2">🎯 Current Projects</h2>

        {PROJECT_ORDER.length === 0 ? (
          <div className="next-box">
            <div className="h3 next-title">No Open Projects Right Now</div>
            <p className="body" style={{ fontSize: '0.9rem' }}>
              We're between named projects at the moment — check back soon, or become a Hero today and we'll count you in the moment the next one opens.
            </p>
            <Link href="/become" className="btn btn-blue" style={{ marginTop: '0.75rem', display: 'inline-block' }}>🏆 Become a Hero</Link>
          </div>
        ) : (
          <>
            <p className="body">Every project below is a concrete piece of work we're trying to fund. Pick one, and we'll take you through becoming a Hero or making a one-off gift in its support.</p>

            <div className="tiers-grid">
              {PROJECT_ORDER.map((key) => {
                const project = PROJECTS[key]
                const raised = totals[key] || 0
                const pct = Math.min(100, Math.round((raised / project.goalAmount) * 100))
                return (
                  <div key={key} className="tc">
                    <div className="tc-emoji">{project.emoji}</div>
                    <div className="tc-name">{project.name}</div>
                    <div className="tc-desc">{project.tagline}</div>

                    <div className="pc-progress">
                      <div className="pc-progress-track">
                        <div className="pc-progress-fill" style={{ width: `${pct}%` }} />
                      </div>
                      <div className="pc-progress-label">
                        <strong>£{raised.toLocaleString('en-GB')}</strong> raised of £{project.goalAmount.toLocaleString('en-GB')} goal
                      </div>
                    </div>

                    <div className="tc-btns">
                      <Link href={`/projects/${key}`} className="tca tca-main">Support This Project</Link>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}

        <hr className="div" />

        {PROJECT_ORDER.length > 0 && (
          <p className="body" style={{ fontSize: '0.9rem' }}>
            Prefer to give without picking a specific project? <Link href="/become" style={{ color: 'var(--blue)', fontWeight: 700 }}>Become a Hero →</Link>
          </p>
        )}
        <Mantra />
      </div>
    </main>
  )
}
