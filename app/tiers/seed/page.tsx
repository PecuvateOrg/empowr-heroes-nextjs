import Link from 'next/link'

export const metadata = {
  title: 'Seed Hero — Empowr Heroes',
  description: 'Become a Seed Hero for £10/month. Plant the seeds of change and help keep Empowr sessions affordable and accessible for everyone.',
}

export default function SeedHeroPage() {
  return (
    <main className="page-content page-tier-detail">
      <div className="td-hero">
        <div className="td-hero-inner">
          <Link href="/tiers" className="back-btn">← Back to Hero Tiers</Link>
          <div className="td-emoji-lg">🌱</div>
          <div className="td-tier-name">Seed Hero</div>
          <div className="td-tier-price">£10/month</div>
          <div className="td-tagline"><strong>Plant the seeds of change</strong> — your contribution helps keep our sessions affordable and accessible.</div>
        </div>
      </div>

      <div className="wrap section-top-2">
        <div className="tag-section">
          <span className="tag-label">Areas of Impact</span>
          <div className="impact-sm">
            <div className="impact-sm-item">
              <div className="impact-sm-icon">🛠️</div>
              <div className="impact-sm-body">
                <strong>Session Essentials</strong>
                <span>Equipment maintenance, activity supplies and safety materials</span>
              </div>
            </div>
            <div className="impact-sm-item">
              <div className="impact-sm-icon">🤲</div>
              <div className="impact-sm-body">
                <strong>Accessibility Support</strong>
                <span>Helping reduce or remove cost barriers for participants</span>
              </div>
            </div>
            <div className="impact-sm-item">
              <div className="impact-sm-icon">📣</div>
              <div className="impact-sm-body">
                <strong>Community Connection</strong>
                <span>Local outreach that helps people discover Empowr</span>
              </div>
            </div>
          </div>
        </div>

        <div className="role-quote">
          Seed Heroes form the grassroots foundation of our movement. While your individual contribution may seem modest, collectively you help ensure no one is turned away due to cost.
        </div>

        <div className="cta-band">
          <div className="cta-band-text">
            <strong>Ready to become a Seed Hero?</strong>
            <span>£10/month — cancel anytime. Your impact starts immediately.</span>
          </div>
          <Link href="/checkout?tier=seed" className="btn-white">🌱 Choose This Tier →</Link>
        </div>

        <div className="btn-row">
          <Link href="/tiers" className="btn btn-outline">← All Hero Tiers</Link>
          <Link href="/become" className="btn btn-blue">Become a Hero</Link>
        </div>

      </div>
    </main>
  )
}
