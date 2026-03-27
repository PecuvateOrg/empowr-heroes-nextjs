import Link from 'next/link'

export const metadata = {
  title: 'Champion Hero — Empowr Heroes',
  description: 'Become a Champion Hero for £250/month. Lead the movement and fuel sustainable growth and long-term impact across the UK.',
}

export default function ChampionHeroPage() {
  return (
    <main className="page-content page-tier-detail">
      <div className="td-hero">
        <div className="td-hero-inner">
          <Link href="/tiers" className="back-btn">← Back to Hero Tiers</Link>
          <div className="td-emoji-lg">🏆</div>
          <div className="td-tier-name">Champion Hero</div>
          <div className="td-tier-price">£250/month</div>
          <div className="td-tagline"><strong>Lead the movement</strong> — your leadership support contributes to organisational sustainability and strategic development.</div>
        </div>
      </div>

      <div className="wrap section-top-2">
        <div className="tag-section">
          <span className="tag-label">Areas of Impact</span>
          <div className="impact-sm">
            <div className="impact-sm-item">
              <div className="impact-sm-icon">👥</div>
              <div className="impact-sm-body">
                <strong>Team Capacity</strong>
                <span>Supporting the coaches and coordinators who deliver our work</span>
              </div>
            </div>
            <div className="impact-sm-item">
              <div className="impact-sm-icon">🏗️</div>
              <div className="impact-sm-body">
                <strong>Operational Foundation</strong>
                <span>Contributing to core costs like insurance, systems, and coordination</span>
              </div>
            </div>
            <div className="impact-sm-item">
              <div className="impact-sm-icon">🔭</div>
              <div className="impact-sm-body">
                <strong>Research &amp; Learning</strong>
                <span>Helping fund our commitment to understanding and improving our impact</span>
              </div>
            </div>
            <div className="impact-sm-item">
              <div className="impact-sm-icon">🤝</div>
              <div className="impact-sm-body">
                <strong>Strategic Relationships</strong>
                <span>Supporting partnership development with schools, health services, and community organisations</span>
              </div>
            </div>
          </div>
        </div>

        <div className="role-quote">
          Champion Heroes invest in our long-term viability. Your contribution helps ensure Empowr doesn't just exist month-to-month, but builds toward sustainable, lasting impact.
        </div>

        <div className="benefits-box">
          <div className="h3">Benefits</div>
          <ul className="bl">
            <li>Quarterly email updates on organisational progress</li>
            <li>Annual impact summary</li>
            <li>Recognition in communications (optional)</li>
          </ul>
        </div>

        <div className="cta-band">
          <div className="cta-band-text">
            <strong>Ready to become a Champion Hero?</strong>
            <span>£250/month — cancel anytime. Your impact starts immediately.</span>
          </div>
          <Link href="/checkout?tier=champion" className="btn-white">🏆 Choose This Tier →</Link>
        </div>

        <div className="btn-row">
          <Link href="/tiers" className="btn btn-outline">← All Hero Tiers</Link>
          <Link href="/become" className="btn btn-blue">Become a Hero</Link>
        </div>

        <p className="tagline">Live by growing. Grow by learning. Learn by doing.</p>
      </div>
    </main>
  )
}
