import Link from 'next/link'
import Mantra from '@/components/Mantra'
import { LINKS } from '@/lib/links'
import { TIERS, TIER_ORDER } from '@/lib/tiers'

export const metadata = {
  title: 'Hero Tiers — Empowr Heroes',
}

export default function TiersPage() {
  return (
    <main className="page-content page-tiers">
      <div className="wrap">
        <div className="tiers-intro">
          <h2 className="h2">Understanding Your Impact</h2>
          <p className="body">Every Hero tier represents a meaningful contribution to our mission. Here's what your support helps make possible at each level.</p>
        </div>

        {TIER_ORDER.map((key) => {
          const tier = TIERS[key]
          return (
            <div key={key} className="tier-row">
              <div className="tr-left">
                <div className="tr-emoji">{tier.emoji}</div>
                <div>
                  <div className="tr-name">{tier.name}</div>
                  <div className="tr-price">{tier.price}</div>
                </div>
              </div>
              <div className="tr-desc">{tier.short}</div>
              <div className="tr-actions">
                <Link href={`/checkout?tier=${key}`} className="btn btn-blue btn-sm">Choose Tier</Link>
                <Link href={`/tiers/${key}`} className="btn btn-ghost">Find out more</Link>
              </div>
            </div>
          )
        })}

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
        <Link href="/contact" className="btn btn-outline">Contact Us →</Link>
        <Mantra />
      </div>
    </main>
  )
}
