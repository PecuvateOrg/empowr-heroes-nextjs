import Link from 'next/link'

export const metadata = {
  title: 'Community Hero — Empowr Heroes',
}

export default function CommunityHeroPage() {
  return (
    <main className="page-content page-tier-detail">
      <div className="td-hero">
        <div className="td-hero-inner">
          <Link href="/tiers" className="back-btn">← Back to Hero Tiers</Link>
          <div className="td-emoji-lg">🫂</div>
          <div className="td-tier-name">Community Hero</div>
          <div className="td-tier-price">£50/month</div>
          <div className="td-tagline"><strong>Power community transformation</strong> — your support helps us expand our reach, enabling us to bring programs to new venues, schools and communities.</div>
        </div>
      </div>

      <div className="wrap section-top-2">
        <div className="tag-section">
          <span className="tag-label">Areas of Impact</span>
          <div className="impact-sm">
            <div className="impact-sm-item">
              <div className="impact-sm-icon">🌍</div>
              <div className="impact-sm-body">
                <strong>Growth Initiatives</strong>
                <span>Contributing toward setup costs for new locations and communities</span>
              </div>
            </div>
            <div className="impact-sm-item">
              <div className="impact-sm-icon">🫂</div>
              <div className="impact-sm-body">
                <strong>Coach Support</strong>
                <span>Helping enable coaches to dedicate focused time to participant care</span>
              </div>
            </div>
            <div className="impact-sm-item">
              <div className="impact-sm-icon">✅</div>
              <div className="impact-sm-body">
                <strong>Quality Assurance</strong>
                <span>Supporting our efforts to measure, learn, and improve from participant feedback</span>
              </div>
            </div>
            <div className="impact-sm-item">
              <div className="impact-sm-icon">⚙️</div>
              <div className="impact-sm-body">
                <strong>Equipment Standards</strong>
                <span>Contributing to gear and materials that create safe, engaging experiences</span>
              </div>
            </div>
          </div>
        </div>

        <div className="role-quote">
          Community Heroes help us maintain quality as we grow. Your contribution supports the behind-the-scenes work that ensures every session delivers meaningful value.
        </div>

        <div className="cta-band">
          <div className="cta-band-text">
            <strong>Ready to become a Community Hero?</strong>
            <span>£50/month — cancel anytime. Your impact starts immediately.</span>
          </div>
          <Link href="/checkout?tier=community" className="btn-white">🫂 Choose This Tier →</Link>
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
