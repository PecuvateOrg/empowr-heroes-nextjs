import Link from 'next/link'
import Mantra from '@/components/Mantra'
import { getMostPopularTier } from '@/lib/analytics'
import { LINKS, buildCheckoutHref } from '@/lib/links'
import { TIERS, TIER_ORDER } from '@/lib/tiers'
import { PROJECTS, type ProjectKey } from '@/lib/projects'

export const metadata = {
  title: 'Become a Hero — Empowr Heroes',
}

export const revalidate = 3600

export default async function BecomePage({
  searchParams,
}: {
  searchParams: Promise<{ project?: string }>
}) {
  const [popularTier, { project }] = await Promise.all([getMostPopularTier(), searchParams])
  const projectInfo = project && project in PROJECTS ? PROJECTS[project as ProjectKey] : null

  return (
    <main className="page-content page-become">
      <div className="wrap">
        {projectInfo ? (
          <div className="callout callout-hero">
            <div style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--blue)', marginBottom: '0.5rem' }}>
              {projectInfo.emoji} Supporting {projectInfo.name}
            </div>
            Choose how you'd like to back this project — as a monthly Hero or with a one-off gift. Your contribution will be counted toward <strong>{projectInfo.name}</strong>.
          </div>
        ) : (
          <div className="callout callout-hero">
            <div style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--blue)', marginBottom: '0.5rem' }}>
              Welcome, Empowr Hero 🏆
            </div>
            💡 Thanks for supporting <strong>Empowr's mission of lifelong wellbeing through experiential learning</strong>.
            You're about to support something powerful — action-based healing in real communities.
          </div>
        )}

        <h2 className="h2">🏆 Choose Your Hero Level</h2>
        <p className="body">Select the contribution that feels right for you. Every level makes a real difference.</p>

        <div className="tiers-grid">
          {TIER_ORDER.map((key) => {
            const tier = TIERS[key]
            return (
              <div key={key} className={`tc${popularTier === key ? ' popular' : ''}`}>
                <div className="tc-emoji">{tier.emoji}</div>
                <div className="tc-name">{tier.name}</div>
                <div className="tc-price">{tier.price}</div>
                <div className="tc-desc"><strong>{tier.lead}</strong> — {tier.body}</div>
                <div className="tc-btns">
                  <Link href={buildCheckoutHref(key, project)} className="tca tca-main">Choose This Tier</Link>
                  <Link href={`/tiers/${key}`} className="tca tca-ghost">Find out more →</Link>
                </div>
              </div>
            )
          })}
        </div>

        <div className="fp-anchor-wrap">
          <a href="#founding-patron" className="fp-anchor-link">
            Looking to make a transformational commitment? Explore our Founding Patron programme ↓
          </a>
        </div>

        <hr className="div" />

        <h2 className="h2">What You're Supporting</h2>
        <h3 className="h3">Empowr is more than an organisation — it's a movement.</h3>
        <p className="body">
          We design and deliver experiential learning programs that transform wellbeing through hands-on action. When someone learns to skate,
          solves their first puzzle, or simply shows up and tries something new, they're not just having fun — they're rewiring their brain,
          building resilience, and discovering what they're capable of.
        </p>
        <h3 className="h3">Your support makes that possible.</h3>
        <p className="body">Every donation helps us:</p>
        <ul className="support-list">
          <li><div className="tick">✓</div><span>Keep sessions accessible to everyone</span></li>
          <li><div className="tick">✓</div><span>Train coaches from within our communities</span></li>
          <li><div className="tick">✓</div><span>Expand into new venues and reach more people</span></li>
          <li><div className="tick">✓</div><span>Conduct research and development to continuously improve session impact</span></li>
          <li><div className="tick">✓</div><span>Prove that experiential learning is the path to lifelong wellbeing</span></li>
        </ul>
        <p className="body">You're not just giving money. You're investing in a healthier, more capable society — one experience at a time.</p>
        <p className="body" style={{ fontSize: '0.9rem' }}>
          <strong>Want to understand the science behind our work?</strong>{' '}
          <a href={LINKS.site.elReport} target="_blank" rel="noopener" style={{ color: 'var(--blue)', fontWeight: 700 }}>Read our research on experiential learning and mental health →</a>
        </p>

        <hr className="div" />

        <div className="next-box">
          <div className="h3 next-title">What Happens Next</div>
          <p className="body" style={{ fontSize: '0.9rem' }}>When you complete your contribution:</p>
          <ul className="next-list">
            <li><div className="ntick">✓</div>You'll receive your Hero badge and welcome email</li>
            <li><div className="ntick">✓</div>You'll get regular updates on the impact you're making</li>
            <li><div className="ntick">✓</div>You'll be invited to connect with our growing Hero community</li>
            <li><div className="ntick">✓</div>You can choose to be publicly celebrated as an Empowr Hero</li>
          </ul>
          <p className="next-note">Your impact starts here. Thank you for believing in the power of experience to transform lives.</p>
        </div>

        <div className="fp-reveal" id="founding-patron">
          <div className="fp-divider"><span>For those who want to go further</span></div>
          <div className="fp-card">
            <div className="fp-badge">⭐ By Enquiry Only</div>
            <div className="fp-title">Founding <em>Patron</em></div>
            <div className="fp-price">£100,000+ annual or multi-year commitment</div>
            <div className="fp-desc">
              As a Founding Patron, you're not just supporting our work — you're co-creating it. Your transformational investment enables
              major strategic initiatives, national expansion, ground-breaking research, and the establishment of Empowr's legacy for
              generations. Founding Patrons become partners in our mission with dedicated relationship management, bespoke impact
              frameworks, and the opportunity to influence our strategic direction.
            </div>
            <Link href="/patron" className="btn-patron">Find Out More →</Link>
          </div>
        </div>
        <Mantra />
      </div>
    </main>
  )
}
