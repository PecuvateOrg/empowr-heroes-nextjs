import Link from 'next/link'
import Mantra from '@/components/Mantra'
import PatronEnquiryForm from '@/components/PatronEnquiryForm'
import { LINKS } from '@/lib/links'

export const metadata = {
  title: 'Founding Patron — Empowr Heroes',
  description: 'Become a Founding Patron of Empowr CIC. Shape the future of wellbeing with a transformational investment in national expansion, research, and lasting community impact.',
}

export default function PatronPage() {
  return (
    <main className="page-content page-patron">
      <div className="patron-wrap">
        <div>
          <Link href="/become" className="back-btn">← Back</Link>
        </div>

        <div className="patron-hero-badge">⭐ Founding Patron Programme</div>
        <h1 className="patron-h1">Shape the Future<br />of <em>Wellbeing</em></h1>

        <p className="patron-intro">
          As a Founding Patron, you're not just supporting our work — you're co-creating it. Your transformational investment enables
          major strategic initiatives, national expansion, ground-breaking research, and the establishment of Empowr's legacy for generations.
        </p>
        <p className="patron-intro-sub">
          Founding Patrons become partners in our mission with dedicated relationship management, bespoke impact frameworks, and the
          opportunity to influence our strategic direction.
        </p>

        <hr className="patron-hr" />

        <span className="patron-eyebrow">What Your Investment Enables</span>
        <div className="patron-impact-grid">
          <div className="patron-impact-item">
            <span className="patron-impact-icon">🌍</span>
            <div className="patron-impact-name">National Expansion</div>
            <div className="patron-impact-desc">Contributing to coordinated growth across regions, bringing experiential learning to more communities across the UK.</div>
          </div>
          <div className="patron-impact-item">
            <span className="patron-impact-icon">🔬</span>
            <div className="patron-impact-name">Robust Research</div>
            <div className="patron-impact-desc">Funding rigorous studies that build the evidence base for experiential learning as a path to lifelong wellbeing.</div>
          </div>
          <div className="patron-impact-item">
            <span className="patron-impact-icon">📐</span>
            <div className="patron-impact-name">Model Development</div>
            <div className="patron-impact-desc">Supporting the creation of frameworks and models that others across health and education can adopt nationally.</div>
          </div>
          <div className="patron-impact-item">
            <span className="patron-impact-icon">🏛️</span>
            <div className="patron-impact-name">Sector Influence</div>
            <div className="patron-impact-desc">Contributing to advocacy and strategic positioning within health services, education systems, and government.</div>
          </div>
          <div className="patron-impact-item">
            <span className="patron-impact-icon">🛡️</span>
            <div className="patron-impact-name">Long-Term Security</div>
            <div className="patron-impact-desc">Helping build the reserves and endowment that ensure Empowr's sustainability for generations to come.</div>
          </div>
          <div className="patron-impact-item">
            <span className="patron-impact-icon">🏗️</span>
            <div className="patron-impact-name">Infrastructure Investment</div>
            <div className="patron-impact-desc">Potential contribution toward dedicated facilities or major capital needs that amplify our reach and impact.</div>
          </div>
        </div>

        <hr className="patron-hr" />

        <span className="patron-eyebrow">A Personal Partnership</span>
        <div className="patron-partnership-box">
          <p className="patron-partnership-text">
            We work closely with every Founding Patron to understand their philanthropic vision. That means designing impact measurement
            aligned with your goals, providing transparent reporting on how funds are deployed, and exploring how deeply you'd like to be
            involved in shaping our direction. This isn't a transaction — it's a relationship built on shared belief in what's possible.
          </p>
        </div>

        <hr className="patron-hr" />

        <span className="patron-eyebrow">What You Receive</span>
        <div className="patron-benefits-strip">
          <div className="patron-benefit">
            <div className="patron-benefit-icon">🤝</div>
            <div className="patron-benefit-text">Dedicated relationship contact</div>
          </div>
          <div className="patron-benefit">
            <div className="patron-benefit-icon">📊</div>
            <div className="patron-benefit-text">Bespoke impact reporting</div>
          </div>
          <div className="patron-benefit">
            <div className="patron-benefit-icon">💬</div>
            <div className="patron-benefit-text">Regular strategy conversations with leadership</div>
          </div>
          <div className="patron-benefit">
            <div className="patron-benefit-icon">🧭</div>
            <div className="patron-benefit-text">Advisory opportunities if desired</div>
          </div>
          <div className="patron-benefit">
            <div className="patron-benefit-icon">⭐</div>
            <div className="patron-benefit-text">Named programme possibilities</div>
          </div>
          <div className="patron-benefit">
            <div className="patron-benefit-icon">🎖️</div>
            <div className="patron-benefit-text">Recognition tailored to your preferences</div>
          </div>
        </div>

        <hr className="patron-hr" />

        <div className="patron-contact">
          <div className="patron-contact-inner">
            <span className="patron-contact-eyebrow">⭐ By Personal Invitation &amp; Enquiry</span>
            <h3 className="patron-contact-title">Begin a Conversation</h3>
            <p className="patron-contact-text">
              Founding Patron conversations are handled personally by our leadership team. We'd love to hear about your vision and explore
              together what your investment could make possible for the future of wellbeing across the UK.
            </p>
            <PatronEnquiryForm />
          </div>
        </div>

        <hr className="patron-hr" />

        <span className="patron-eyebrow">Further Reading</span>
        <div className="patron-research-box">
          <p className="patron-partnership-text">
            Founding Patrons are investing in an evidence-based approach. Empowr's 2025 report sets out the case for
            experiential learning as a proven, cost-effective path to lifelong wellbeing — drawing on NHS data, peer-reviewed
            studies, and the economic case for non-medical mental health intervention.
          </p>
          <div className="patron-research-links">
            <a href={LINKS.site.elReport} target="_blank" rel="noopener" className="btn btn-outline">Read the Research →</a>
            <a href={LINKS.research.notionDoc} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">View Source Document →</a>
          </div>
        </div>

      <Mantra />
      </div>
    </main>
  )
}
