import Link from 'next/link'

export const metadata = {
  title: 'Legacy Hero — Empowr Heroes',
  description: 'Become a Legacy Hero for £500/month. Your substantial commitment enables Empowr to think and act more ambitiously while maintaining financial stability.',
}

export default function LegacyHeroPage() {
  return (
    <main className="page-content page-tier-detail">
      <div className="td-hero">
        <div className="td-hero-inner">
          <Link href="/tiers" className="back-btn">← Back to Hero Tiers</Link>
          <div className="td-emoji-lg">💎</div>
          <div className="td-tier-name">Legacy Hero</div>
          <div className="td-tier-price">£500/month</div>
          <div className="td-tagline"><strong>Power moves</strong> — your substantial commitment enables us to think and act more ambitiously while maintaining financial stability.</div>
        </div>
      </div>

      <div className="wrap section-top-2">
        <div className="tag-section">
          <span className="tag-label">Areas of Impact</span>
          <div className="impact-sm">
            <div className="impact-sm-item">
              <div className="impact-sm-icon">🚀</div>
              <div className="impact-sm-body">
                <strong>Expansion Capacity</strong>
                <span>Contributing to the infrastructure needed to launch in multiple new locations</span>
              </div>
            </div>
            <div className="impact-sm-item">
              <div className="impact-sm-icon">🌱</div>
              <div className="impact-sm-body">
                <strong>Leadership Development</strong>
                <span>Supporting pathways for participants to become coaches and community leaders</span>
              </div>
            </div>
            <div className="impact-sm-item">
              <div className="impact-sm-icon">💡</div>
              <div className="impact-sm-body">
                <strong>Innovation</strong>
                <span>Helping fund the development of new program models and approaches</span>
              </div>
            </div>
            <div className="impact-sm-item">
              <div className="impact-sm-icon">📊</div>
              <div className="impact-sm-body">
                <strong>Evidence Building</strong>
                <span>Contributing to research partnerships that strengthen our understanding of impact</span>
              </div>
            </div>
            <div className="impact-sm-item">
              <div className="impact-sm-icon">🛡️</div>
              <div className="impact-sm-body">
                <strong>Organisational Resilience</strong>
                <span>Supporting reserves that help us maintain continuity through funding uncertainties</span>
              </div>
            </div>
          </div>
        </div>

        <div className="role-quote">
          Legacy Heroes provide the stability that allows us to invest in the future. Your contribution helps us take calculated risks, develop new capabilities, and build for the long term.
        </div>

        <div className="benefits-box">
          <div className="h3">Benefits</div>
          <ul className="bl">
            <li>Personalised quarterly impact updates</li>
            <li>Annual conversation with leadership team</li>
            <li>Recognition in annual communications (optional)</li>
            <li>Invitation to Hero community gatherings</li>
          </ul>
        </div>

        <div className="cta-band">
          <div className="cta-band-text">
            <strong>Ready to become a Legacy Hero?</strong>
            <span>£500/month — cancel anytime. Your impact starts immediately.</span>
          </div>
          <Link href="/checkout?tier=legacy" className="btn-white">💎 Choose This Tier →</Link>
        </div>

        <div className="btn-row">
          <Link href="/tiers" className="btn btn-outline">← All Hero Tiers</Link>
          <Link href="/become" className="btn btn-blue">Become a Hero</Link>
        </div>

      </div>
    </main>
  )
}
