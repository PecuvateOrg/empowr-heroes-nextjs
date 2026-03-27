import Link from 'next/link'

export const metadata = {
  title: 'Momentum Hero — Empowr Heroes',
  description: 'Become a Momentum Hero for £25/month. Build momentum for growth and fund the infrastructure that keeps Empowr sessions running consistently.',
}

export default function MomentumHeroPage() {
  return (
    <main className="page-content page-tier-detail">
      <div className="td-hero">
        <div className="td-hero-inner">
          <Link href="/tiers" className="back-btn">← Back to Hero Tiers</Link>
          <div className="td-emoji-lg">🚀</div>
          <div className="td-tier-name">Momentum Hero</div>
          <div className="td-tier-price">£25/month</div>
          <div className="td-tagline"><strong>Build momentum for growth</strong> — your support contributes to the practical infrastructure that enables sessions to happen consistently.</div>
        </div>
      </div>

      <div className="wrap section-top-2">
        <div className="tag-section">
          <span className="tag-label">Areas of Impact</span>
          <div className="impact-sm">
            <div className="impact-sm-item">
              <div className="impact-sm-icon">🏛️</div>
              <div className="impact-sm-body">
                <strong>Venue Access</strong>
                <span>Supporting the costs of community spaces and facility bookings</span>
              </div>
            </div>
            <div className="impact-sm-item">
              <div className="impact-sm-icon">🎓</div>
              <div className="impact-sm-body">
                <strong>Coach Development</strong>
                <span>Contributing to training and ongoing learning for our team</span>
              </div>
            </div>
            <div className="impact-sm-item">
              <div className="impact-sm-icon">🔬</div>
              <div className="impact-sm-body">
                <strong>Program Improvement</strong>
                <span>Helping us test and refine new activities</span>
              </div>
            </div>
          </div>
        </div>

        <div className="role-quote">
          Momentum Heroes help bridge the gap between intention and action — your contribution helps turn plans into real sessions in real communities.
        </div>

        <div className="cta-band">
          <div className="cta-band-text">
            <strong>Ready to become a Momentum Hero?</strong>
            <span>£25/month — cancel anytime. Your impact starts immediately.</span>
          </div>
          <Link href="/checkout?tier=momentum" className="btn-white">🚀 Choose This Tier →</Link>
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
