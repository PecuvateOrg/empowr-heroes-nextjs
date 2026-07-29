import Link from 'next/link'
import Mantra from '@/components/Mantra'
import { LINKS } from '@/lib/links'

export default function Home() {
  return (
    <main className="page-content page-home">
      <div className="hero-wrap">
        <div className="glow1"></div>
        <div className="glow2"></div>
        <div className="hero-inner">
          <div className="callout callout-hero">
             <strong><h2>💡Our mission is simple</h2></strong>
            <b>To lead, promote, and scale Experiential Learning as the path to lifelong wellbeing for everyone.</b>
          </div>
          <h1 className="h1">Real Change<br /><em>Starts Here</em></h1>
          <p className="hero-sub">
            At Empowr, we don't just talk about wellbeing — we build it. Through hands-on experiences that strengthen body and mind,
            we're proving that experiential learning isn't just beneficial, it's essential to a healthier, more capable society.
          </p>
          <div className="hero-btns">
            <Link href="/become" className="btn btn-blue">🏆 Become a Hero Today →</Link>
          </div>
        </div>
      </div>

      <div className="wrap section-top">
        <h2 className="h2">Why This Matters</h2>
        <div className="callout">
          Every day, people across the UK struggle with mental and physical health challenges that traditional approaches can't fully address.
          Meanwhile, our NHS buckles under pressure, and communities feel increasingly disconnected.
        </div>
        <p className="body">
          But here's what science tells us: the brain, like the body, thrives on stimulation and activity. When people engage in novel,
          challenging experiences — whether it's mastering roller skating, solving a Rubik's Cube, or simply showing up and trying something
          new — they create new neural pathways. They build resilience. They discover capability.
        </p>
        <p className="body">And that individual transformation? It ripples outward:</p>
        <div className="impact-grid">
          <div className="ic">
            <div className="ic-icon">💼</div>
            <div className="ic-name">Stronger workforce engagement</div>
            <div className="ic-desc">People become more focused, adaptable, and productive.</div>
          </div>
          <div className="ic">
            <div className="ic-icon">🏥</div>
            <div className="ic-name">Reduced pressure on health services</div>
            <div className="ic-desc">Improved mental resilience means fewer GP visits and less reliance on NHS resources.</div>
          </div>
          <div className="ic">
            <div className="ic-icon">🤝</div>
            <div className="ic-name">More resilient communities</div>
            <div className="ic-desc">People who feel capable contribute more actively to society.</div>
          </div>
          <div className="ic">
            <div className="ic-icon">📈</div>
            <div className="ic-name">Economic growth</div>
            <div className="ic-desc">A healthier population is a more productive one.</div>
          </div>
        </div>
        <p className="body">At Empowr, we're not just running activities. We're laying the groundwork for a more capable, healthier, and economically resilient society.</p>
        <p className="body" style={{ fontSize: '0.9rem' }}>
          <a href={LINKS.site.el} target="_blank" rel="noopener" style={{ color: 'var(--blue)', fontWeight: 700 }}>
            Discover our approach to experiential learning →
          </a>
        </p>

        <hr className="div" />

        <h2 className="h2">How We Do It</h2>
        <p className="body">Through carefully designed experiential learning programs delivered in communities across the UK, we create spaces where people:</p>
        <div className="three-col">
          <div className="pillar">
            <div className="pillar-icon">🌱</div>
            <div className="pillar-name">Grow through action</div>
            <div className="pillar-text">Transformation happens when people engage and experience.</div>
          </div>
          <div className="pillar">
            <div className="pillar-icon">🫂</div>
            <div className="pillar-name">Find belonging</div>
            <div className="pillar-text">Authentic relationships and shared purpose unite our community.</div>
          </div>
          <div className="pillar">
            <div className="pillar-icon">✨</div>
            <div className="pillar-name">Build lifelong wellbeing</div>
            <div className="pillar-text">Everyday habits and mindsets that create lasting health and joy.</div>
          </div>
        </div>
        <p className="body">Our sessions are powered by the people who join them. But our future? That's built by our Heroes.</p>

        <hr className="div" />

        <h2 className="h2">What Your Support Makes Possible</h2>
        <div className="callout">💡 Empowr Heroes aren't just donors — they're sponsors of movement, healing, and growth.</div>
        <p className="body">Your contributions directly fund:</p>
        <ul className="support-list">
          <li>
            <div className="tick">✓</div>
            <span><strong>Accessible sessions</strong> — keeping programs affordable for everyone, regardless of background or income.</span>
          </li>
          <li>
            <div className="tick">✓</div>
            <span><strong>Community coach training</strong> — developing coaches from within our communities who understand local needs.</span>
          </li>
          <li>
            <div className="tick">✓</div>
            <span><strong>Expanded reach</strong> — bringing experiential learning to more venues, schools, and local hubs.</span>
          </li>
          <li>
            <div className="tick">✓</div>
            <span><strong>Sustainable growth</strong> — ensuring we can scale our impact across the UK.</span>
          </li>
        </ul>
        <p className="body">Every Hero fuels lifelong wellbeing through real-world action. Your impact starts with a simple choice.</p>

        <hr className="div" />

        <h2 className="h2">🎁 Choose Your Hero Tier</h2>
        <p className="body">
          Each Hero level helps us go further — and shows what your support makes possible. Whether you sponsor at £5 a month or £100+,
          you're investing in a movement that transforms lives through the power of experience.
        </p>
        <div className="btn-row-inline">
          <Link href="/tiers" className="btn btn-blue">🏆 View Full Hero Tier Breakdown →</Link>
        </div>

        <hr className="div" />

        <h2 className="h2">🚀 Ready to Make Your Impact?</h2>
        <p className="body">Join a growing movement of people who believe wellbeing is built through real-life action, connection, and care.</p>
        <p className="body">Support the Empowr journey with a one-off or monthly Hero contribution.</p>
        <div className="btn-row-inline">
          <Link href="/become" className="btn btn-blue">🏆 Become a Hero →</Link>
        </div>
        <Mantra />
      </div>
    </main>
  )
}
