import Link from 'next/link'
import { TIERS } from '@/lib/tiers'

export const metadata = {
  title: 'Thank You — Empowr Heroes',
  description: 'Thank you for your one-time contribution to Empowr CIC. Your gift is already making a difference.',
}

const tierInfo = TIERS.onetime

export default function ThankYouOneTimePage() {
  return (
    <main className="page-content page-thankyou">
      <div className="ty-wrap">
        <div className="confetti">💝</div>
        <h1 className="ty-title">Thank you for your<br />generous gift.</h1>
        <p className="ty-sub">
          Every contribution — no matter the size — helps make our sessions possible and puts wellbeing within reach for more young people.
        </p>

        <div className="tier-pill">
          <div className="tp-label">💠 Your Contribution</div>
          <div className="tp-value">{tierInfo.name} {tierInfo.emoji}</div>
        </div>

        <div className="ty-steps">
          <div className="h3 text-center">What Happens Next</div>
          <div className="ty-step">
            <div className="snum">1</div>
            <div className="scopy">
              <strong>Check your inbox 📨</strong>
              <span>A personal thank you email is on its way — it includes a note from the Empowr team and a summary of the impact your gift helps create.</span>
            </div>
          </div>
          <div className="ty-step">
            <div className="snum">2</div>
            <div className="scopy">
              <strong>See your impact 🌍</strong>
              <span>Your contribution goes directly towards funding sessions, supporting facilitators, and keeping our programme accessible to those who need it most.</span>
            </div>
          </div>
          <div className="ty-step">
            <div className="snum">3</div>
            <div className="scopy">
              <strong>Consider becoming a Hero 🦸</strong>
              <span>Monthly Heroes receive a personalised badge, early updates, and recognition in our growing community — and their support compounds over time.</span>
            </div>
          </div>
        </div>

        <div className="community-placeholder">
          <p>🌱 <strong>Want to make a lasting impact?</strong> Becoming a monthly Hero means your support keeps working — every single month. Choose a tier that works for you and receive your Hero badge.</p>
        </div>

        <div className="ty-nav">
          <Link href="/" className="btn btn-outline btn-sm">[Return to Home]</Link>
          <Link href="/become" className="btn btn-blue btn-sm">[Become a Hero]</Link>
        </div>
      </div>
    </main>
  )
}
