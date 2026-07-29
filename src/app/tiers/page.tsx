import Link from 'next/link'
import Mantra from '@/components/Mantra'
import { LINKS } from '@/lib/links'

export const metadata = {
  title: 'Hero Tiers — Empowr Heroes',
}

export default function TiersPage() {
  return (
    <main className="page-content page-tiers">
      <div className="wrap">
        <h2 className="h2">Understanding Your Impact</h2>
        <p className="body">Every Hero tier represents a meaningful contribution to our mission. Here's what your support helps make possible at each level.</p>

        <div className="tier-row">
          <div className="tr-left">
            <div className="tr-emoji">🌱</div>
            <div>
              <div className="tr-name">Seed Hero</div>
              <div className="tr-price">£10/month</div>
            </div>
          </div>
          <div className="tr-desc">Plant the seeds of change. Keeps sessions affordable and accessible.</div>
          <div className="tr-actions">
            <Link href="/checkout?tier=seed" className="btn btn-blue btn-sm">Choose Tier</Link>
            <Link href="/tiers/seed" className="btn btn-ghost">Find out more</Link>
          </div>
        </div>

        <div className="tier-row">
          <div className="tr-left">
            <div className="tr-emoji">🚀</div>
            <div>
              <div className="tr-name">Momentum Hero</div>
              <div className="tr-price">£25/month</div>
            </div>
          </div>
          <div className="tr-desc">Build momentum for growth. Funds infrastructure enabling consistent sessions.</div>
          <div className="tr-actions">
            <Link href="/checkout?tier=momentum" className="btn btn-blue btn-sm">Choose Tier</Link>
            <Link href="/tiers/momentum" className="btn btn-ghost">Find out more</Link>
          </div>
        </div>

        <div className="tier-row">
          <div className="tr-left">
            <div className="tr-emoji">🫂</div>
            <div>
              <div className="tr-name">Community Hero</div>
              <div className="tr-price">£50/month</div>
            </div>
          </div>
          <div className="tr-desc">Power community transformation. Expands reach to new venues and communities.</div>
          <div className="tr-actions">
            <Link href="/checkout?tier=community" className="btn btn-blue btn-sm">Choose Tier</Link>
            <Link href="/tiers/community" className="btn btn-ghost">Find out more</Link>
          </div>
        </div>

        <div className="tier-row">
          <div className="tr-left">
            <div className="tr-emoji">🏆</div>
            <div>
              <div className="tr-name">Champion Hero</div>
              <div className="tr-price">£250/month</div>
            </div>
          </div>
          <div className="tr-desc">Lead the movement. Drives sustainability and strategic development.</div>
          <div className="tr-actions">
            <Link href="/checkout?tier=champion" className="btn btn-blue btn-sm">Choose Tier</Link>
            <Link href="/tiers/champion" className="btn btn-ghost">Find out more</Link>
          </div>
        </div>

        <div className="tier-row">
          <div className="tr-left">
            <div className="tr-emoji">💎</div>
            <div>
              <div className="tr-name">Legacy Hero</div>
              <div className="tr-price">£500/month</div>
            </div>
          </div>
          <div className="tr-desc">Power moves. Enables ambitious, long-term growth with stability.</div>
          <div className="tr-actions">
            <Link href="/checkout?tier=legacy" className="btn btn-blue btn-sm">Choose Tier</Link>
            <Link href="/tiers/legacy" className="btn btn-ghost">Find out more</Link>
          </div>
        </div>

        <div className="tier-row">
          <div className="tr-left">
            <div className="tr-emoji">💝</div>
            <div>
              <div className="tr-name">One-Time Hero</div>
              <div className="tr-price">Your Choice</div>
            </div>
          </div>
          <div className="tr-desc">Flexible giving. Make a one-off impact whenever you're ready.</div>
          <div className="tr-actions">
            <Link href="/checkout?tier=onetime" className="btn btn-blue btn-sm">Choose Tier</Link>
            <Link href="/tiers/onetime" className="btn btn-ghost">Find out more</Link>
          </div>
        </div>

        <hr className="div" />

        <h2 className="h2">Your Choice, Real Impact</h2>
        <p className="body">No matter which tier resonates with you, your contribution joins a movement of people who believe wellbeing is built through action, not theory.</p>
        <p className="body">Every Hero level reflects different capacities — but equal commitment to a vision where everyone can access experiences that transform their wellbeing.</p>
        <p className="body" style={{ fontSize: '0.9rem' }}>
          Curious about why this approach works?{' '}
          <a href={LINKS.site.elReport} target="_blank" rel="noopener" style={{ color: 'var(--blue)', fontWeight: 700 }}>Read the evidence behind experiential learning →</a>
        </p>
        <div className="btn-row-inline">
          <Link href="/become" className="btn btn-blue">🏆 Become a Hero</Link>
          <Link href="/" className="btn btn-outline">← Back to Mission</Link>
        </div>

        <hr className="div" />

        <p className="body" style={{ fontSize: '0.9rem' }}>
          <strong>Questions About Your Impact?</strong><br />
          Want to understand more about how your specific contribution would be used, or to just have a chat — we're happy to discuss.
        </p>
        <a href={LINKS.email.hero} className="btn btn-outline">Contact Us →</a>
        <Mantra />
      </div>
    </main>
  )
}
