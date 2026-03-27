import Link from 'next/link'
import { TIERS } from '@/lib/tiers'

export const metadata = {
  title: 'Thank You — Empowr Heroes',
}

export default async function ThankYouPage({
  searchParams,
}: {
  searchParams: Promise<{ tier?: string }>
}) {
  const { tier } = await searchParams
  const tierInfo = (tier && TIERS[tier]) ?? null

  return (
    <main className="page-content page-thankyou">
      <div className="ty-wrap">
        <div className="confetti">🎉</div>
        <h1 className="ty-title">You're now officially<br />an Empowr Hero.</h1>
        <p className="ty-sub">
          You've joined a growing movement of people who believe wellbeing is built through real-life action, connection, and care.
        </p>

        {tierInfo && (
          <div className="tier-pill">
            <div className="tp-label">💠 Your Hero Tier</div>
            <div className="tp-value">{tierInfo.name} {tierInfo.emoji}</div>
          </div>
        )}

        <div className="ty-steps">
          <div className="h3 text-center">What Happens Next</div>
          <div className="ty-step">
            <div className="snum">1</div>
            <div className="scopy">
              <strong>Check your inbox 📨</strong>
              <span>Be on the lookout for a welcome email which will include your Hero badge and the impact you've made possible.</span>
            </div>
          </div>
          <div className="ty-step">
            <div className="snum">2</div>
            <div className="scopy">
              <strong>Download your Hero badge 🎁</strong>
              <span>Your personalised badge arrives by email — download it, share it, and wear it with pride.</span>
            </div>
          </div>
          <div className="ty-step">
            <div className="snum">3</div>
            <div className="scopy">
              <strong>Share your Hero status 🌟</strong>
              <span>Follow us on Instagram, share your Hero status with the world, and refer someone to join you as a Hero.</span>
            </div>
          </div>
        </div>

        <div className="badge-box">
          <p>🎖️ Your <strong>Hero Badge</strong> is on its way to your inbox — keep an eye out for your welcome email. Once you have it, share it everywhere!</p>
        </div>

        <div className="community-placeholder">
          <p>🤝 <strong>Want to connect with other Empowr Heroes?</strong> We're building a Heroes community space — details coming soon. We'll be in touch!</p>
        </div>

        <div className="social-row">
          <button type="button" className="btn btn-blue btn-sm">Share on Instagram</button>
          <button type="button" className="btn btn-outline btn-sm">Share on LinkedIn</button>
          <button type="button" className="btn btn-outline btn-sm">Refer a Friend</button>
        </div>

        <div className="ty-nav">
          <Link href="/" className="btn btn-outline btn-sm">[Return to Home]</Link>
          <Link href="/tiers" className="btn btn-blue btn-sm">[See Other Heroes]</Link>
        </div>
      </div>
    </main>
  )
}
