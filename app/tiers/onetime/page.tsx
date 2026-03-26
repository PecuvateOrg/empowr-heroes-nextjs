import Link from 'next/link'

export const metadata = {
  title: 'One-Time Hero — Empowr Heroes',
}

export default function OneTimeHeroPage() {
  return (
    <main className="page-content page-tier-detail">
      <div className="td-hero">
        <div className="td-hero-inner">
          <Link href="/tiers" className="back-btn">← Back to Hero Tiers</Link>
          <div className="td-emoji-lg">💝</div>
          <div className="td-tier-name">One-Time Hero Contribution</div>
          <div className="td-tier-price">Your Choice</div>
          <div className="td-tagline"><strong>Make a one-off impact</strong> — every contribution, no matter the size, supports our mission.</div>
        </div>
      </div>

      <div className="wrap section-top-2">
        <div className="tag-section">
          <span className="tag-label">How We Deploy One-Time Gifts</span>
          <div className="impact-sm">
            <div className="impact-sm-item">
              <div className="impact-sm-icon">⚡</div>
              <div className="impact-sm-body">
                <strong>Urgent Priorities</strong>
                <span>Addressing immediate needs or time-sensitive opportunities</span>
              </div>
            </div>
            <div className="impact-sm-item">
              <div className="impact-sm-icon">🎒</div>
              <div className="impact-sm-body">
                <strong>Equipment Investment</strong>
                <span>Purchasing quality materials that serve participants for years</span>
              </div>
            </div>
            <div className="impact-sm-item">
              <div className="impact-sm-icon">🧪</div>
              <div className="impact-sm-body">
                <strong>Testing Ground</strong>
                <span>Funding pilots and experiments before committing to full programs</span>
              </div>
            </div>
            <div className="impact-sm-item">
              <div className="impact-sm-icon">🎯</div>
              <div className="impact-sm-body">
                <strong>Flexibility Fund</strong>
                <span>Maintaining capacity to adapt to emerging community needs</span>
              </div>
            </div>
          </div>
        </div>

        <div className="role-quote">
          There is no wrong amount. A one-time gift says: I believe in this. And that belief, combined with others', moves us forward.
        </div>

        <div className="cta-band">
          <div className="cta-band-text">
            <strong>Ready to make your contribution?</strong>
            <span>Any amount. Every contribution counts.</span>
          </div>
          <Link href="/checkout?tier=onetime" className="btn-white">💝 Make a Contribution →</Link>
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
