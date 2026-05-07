import Link from 'next/link'
import Mantra from '@/components/Mantra'
import { getMostPopularTier } from '@/lib/analytics'

export const metadata = {
  title: 'Become a Hero — Empowr Heroes',
}

export const revalidate = 3600

export default async function BecomePage() {
  const popularTier = await getMostPopularTier()

  return (
    <main className="page-content page-become">
      <div className="wrap">
        <div className="callout">
          <div style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--blue)', marginBottom: '0.5rem' }}>
            Welcome, Empowr Hero 🏆
          </div>
          💡 Thanks for supporting <strong>Empowr's mission of lifelong wellbeing through experiential learning</strong>.
          You're about to support something powerful — action-based healing in real communities.
        </div>

        <h2 className="h2">🏆 Choose Your Hero Level</h2>
        <p className="body">Select the contribution that feels right for you. Every level makes a real difference.</p>

        <div className="tiers-grid">
          <div className={`tc${popularTier === 'seed' ? ' popular' : ''}`}>
            <div className="tc-emoji">🌱</div>
            <div className="tc-name">Seed Hero</div>
            <div className="tc-price">£10/month</div>
            <div className="tc-desc"><strong>Plant the seeds of change</strong> — Your contribution helps keep our sessions affordable and accessible.</div>
            <div className="tc-btns">
              <Link href="/checkout?tier=seed" className="tca tca-main">Choose This Tier</Link>
              <Link href="/tiers/seed" className="tca tca-ghost">Find out more →</Link>
            </div>
          </div>

          <div className={`tc${popularTier === 'momentum' ? ' popular' : ''}`}>
            <div className="tc-emoji">🚀</div>
            <div className="tc-name">Momentum Hero</div>
            <div className="tc-price">£25/month</div>
            <div className="tc-desc"><strong>Build momentum for growth</strong> — Your support contributes to the practical infrastructure that enables sessions to happen consistently.</div>
            <div className="tc-btns">
              <Link href="/checkout?tier=momentum" className="tca tca-main">Choose This Tier</Link>
              <Link href="/tiers/momentum" className="tca tca-ghost">Find out more →</Link>
            </div>
          </div>

          <div className={`tc${popularTier === 'community' ? ' popular' : ''}`}>
            <div className="tc-emoji">🫂</div>
            <div className="tc-name">Community Hero</div>
            <div className="tc-price">£50/month</div>
            <div className="tc-desc"><strong>Power community transformation</strong> — Your support helps us expand our reach, enabling us to bring programs to new venues, schools and communities.</div>
            <div className="tc-btns">
              <Link href="/checkout?tier=community" className="tca tca-main">Choose This Tier</Link>
              <Link href="/tiers/community" className="tca tca-ghost">Find out more →</Link>
            </div>
          </div>

          <div className={`tc${popularTier === 'champion' ? ' popular' : ''}`}>
            <div className="tc-emoji">🏆</div>
            <div className="tc-name">Champion Hero</div>
            <div className="tc-price">£250/month</div>
            <div className="tc-desc"><strong>Lead the movement</strong> — You're fueling sustainable growth and long-term impact across the UK.</div>
            <div className="tc-btns">
              <Link href="/checkout?tier=champion" className="tca tca-main">Choose This Tier</Link>
              <Link href="/tiers/champion" className="tca tca-ghost">Find out more →</Link>
            </div>
          </div>

          <div className={`tc${popularTier === 'legacy' ? ' popular' : ''}`}>
            <div className="tc-emoji">💎</div>
            <div className="tc-name">Legacy Hero</div>
            <div className="tc-price">£500/month</div>
            <div className="tc-desc"><strong>Power moves</strong> — Your substantial commitment enables us to think and act more ambitiously while maintaining financial stability.</div>
            <div className="tc-btns">
              <Link href="/checkout?tier=legacy" className="tca tca-main">Choose This Tier</Link>
              <Link href="/tiers/legacy" className="tca tca-ghost">Find out more →</Link>
            </div>
          </div>

          <div className="tc">
            <div className="tc-emoji">💝</div>
            <div className="tc-name">One-Time Hero Contribution</div>
            <div className="tc-price">Your Choice</div>
            <div className="tc-desc"><strong>Make a one-off impact.</strong> Every contribution — no matter the size — supports our mission.</div>
            <div className="tc-btns">
              <Link href="/checkout?tier=onetime" className="tca tca-main">Choose This Tier</Link>
              <Link href="/tiers/onetime" className="tca tca-ghost">Find out more →</Link>
            </div>
          </div>
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
          <Link href="/why-experiential-learning" style={{ color: 'var(--blue)', fontWeight: 700 }}>Read our research on experiential learning and mental health →</Link>
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
