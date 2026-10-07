import Link from 'next/link'
import Mantra from '@/components/Mantra'
import ProjectCard from '@/components/ProjectCard'
import { getProjectFundingTotals } from '@/lib/project-funding'
import { PROJECT_ORDER } from '@/lib/projects'
import { TIERS, TIER_ORDER } from '@/lib/tiers'

export const revalidate = 3600

export default async function Home() {
  const totals = await getProjectFundingTotals()

  return (
    <main className="page-content page-home">
      <div className="hero-wrap">
        <div className="glow1"></div>
        <div className="glow2"></div>
        <div className="hero-inner">
          <h1 className="h1">Turning Places Into Spaces<br /><em>for Lifelong Wellbeing</em></h1>
          <p className="hero-sub">
            Empowr CIC is a South-East London movement promoting lifelong wellbeing through experiential learning.
            Through skating, classes and community sessions, people of all ages build confidence, connection and health by doing.
          </p>
          <div className="hero-btns">
            <a href="#projects" className="btn btn-blue">🎯 Back a Project</a>
            <Link href="/become" className="btn btn-outline">🏆 Become a Hero</Link>
          </div>
        </div>
      </div>

      <div className="wrap section-top">
        <h2 className="h2">Two Ways to Give</h2>
        <div className="tiers-grid home-paths">
          <div className="tc">
            <div className="tc-emoji">🎯</div>
            <div className="tc-name">Back a Project</div>
            <div className="tc-desc">
              Choose something specific, like a building or our coaching pathway, and every pound you give is counted toward it.
              You still become a Hero and receive your badge.
            </div>
            <div className="tc-btns">
              <a href="#projects" className="tca tca-main">See Current Projects</a>
            </div>
          </div>
          <div className="tc">
            <div className="tc-emoji">🏆</div>
            <div className="tc-name">Become a Hero</div>
            <div className="tc-desc">
              Give monthly from {TIERS.seed.price}, or a one-off gift of any amount. Your support goes wherever it's needed most
              across Empowr's work.
            </div>
            <div className="tc-btns">
              <Link href="/become" className="tca tca-main">Become a Hero</Link>
            </div>
          </div>
        </div>

        <hr className="div" />

        <h2 className="h2" id="projects">🎯 Current Projects</h2>
        <p className="body">Concrete pieces of work we're raising for right now. Pick one to see exactly what your support makes possible.</p>
        <div className="tiers-grid">
          {PROJECT_ORDER.map((key) => (
            <ProjectCard key={key} projectKey={key} raised={totals[key] || 0} />
          ))}
        </div>

        <hr className="div" />

        <h2 className="h2">🎖️ What You Get as a Hero</h2>
        <div className="badge-row">
          {TIER_ORDER.map((key) => (
            <img key={key} src={`/badges/${key}-hero.svg`} alt={`${TIERS[key].name} badge`} width={72} height={72} />
          ))}
        </div>
        <ul className="support-list">
          <li>
            <div className="tick">✓</div>
            <span><strong>Your personalised Hero badge</strong>, sent with your welcome email, to share and wear with pride.</span>
          </li>
          <li>
            <div className="tick">✓</div>
            <span><strong>Updates on the impact you're making</strong>, so you see where your support goes.</span>
          </li>
          <li>
            <div className="tick">✓</div>
            <span><strong>A place in the Heroes community</strong>, the people who keep Empowr's work going.</span>
          </li>
          <li>
            <div className="tick">✓</div>
            <span><strong>More at higher tiers:</strong> Champion and Legacy Heroes also receive quarterly updates and optional recognition, and Legacy Heroes get an annual conversation with our leadership team.</span>
          </li>
        </ul>

        <ul className="home-tiers">
          {TIER_ORDER.map((key) => (
            <li key={key}>
              <Link href={`/tiers/${key}`}>
                <span>{TIERS[key].emoji} {TIERS[key].name}</span>
                <strong>{TIERS[key].price}</strong>
              </Link>
            </li>
          ))}
        </ul>
        <div className="btn-row-inline">
          <Link href="/become" className="btn btn-blue">🏆 Become a Hero →</Link>
          <Link href="/tiers" className="btn btn-outline">Compare Tiers</Link>
        </div>
        <p className="body" style={{ fontSize: '0.9rem' }}>
          Thinking bigger? <Link href="/patron" style={{ color: 'var(--blue)', fontWeight: 700 }}>Explore the Founding Patron Programme →</Link>
        </p>

        <hr className="div" />

        <h2 className="h2">Why It Matters</h2>
        <p className="body">
          People learn best when they're in motion. Hands-on experiences build confidence, resilience and belonging, and that
          ripples out into healthier, more connected communities.
        </p>
        <p className="body" style={{ fontSize: '0.9rem' }}>
          <Link href="/mission" style={{ color: 'var(--blue)', fontWeight: 700 }}>Read our mission →</Link>
        </p>
        <Mantra />
      </div>
    </main>
  )
}
