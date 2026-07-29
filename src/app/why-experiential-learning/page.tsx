import Link from 'next/link'
import { LINKS } from '@/lib/links'

export const metadata = {
  title: 'Experiential Learning & Wellbeing — Empowr',
  description: 'The case for a non-medical approach to mental health. Empowr CIC\'s 2025 report on experiential learning as a proven path to lifelong wellbeing.',
}

export default function ExperientialLearningPage() {
  return (
    <main className="page-content page-el">
      <div className="el-wrap">

        <Link href="/become" className="back-btn">← Back</Link>

        <span className="eyebrow">Empowr Report · 2025</span>
        <h1 className="h1">A Non-Medical<br />Approach to <em>Mental Health</em></h1>
        <p className="el-intro">
          The UK is facing a mental health crisis that medication and therapy alone cannot solve.
          This report makes the case for experiential learning — a proven, cost-effective approach
          to building resilience and promoting lifelong wellbeing for people of all ages.
        </p>

        <div className="el-stat-strip">
          <div className="el-stat">
            <div className="el-stat-num">1 in 4</div>
            <div className="el-stat-label">adults experience a mental health problem each year</div>
          </div>
          <div className="el-stat">
            <div className="el-stat-num">8.7M</div>
            <div className="el-stat-label">antidepressant prescriptions in England in 2023/24</div>
          </div>
          <div className="el-stat">
            <div className="el-stat-num">+45%</div>
            <div className="el-stat-label">rise in NHS mental health contacts since 2019</div>
          </div>
          <div className="el-stat">
            <div className="el-stat-num">11.4</div>
            <div className="el-stat-label">per 100,000 — suicide rate in 2023, highest since 1999</div>
          </div>
        </div>
        <p className="el-stat-source">Sources: NHS Digital, ONS — see references below.</p>

        <hr className="div" />

        <div className="el-section">
          <span className="el-section-label">The Problem</span>
          <h2 className="h2">When Medical Alone Isn't Enough</h2>
          <p className="body">
            While medical treatments are essential for many, the data tells a troubling story. There is a widening gap
            between demand and supply in NHS services — with long wait times and rising disability claims for mental ill-health.
            Antidepressant use has more than doubled since 2015, yet the prevalence of common mental health disorders
            continues to climb year on year.
          </p>
          <p className="body">
            Among young people, probable mental disorder prevalence nearly doubled between 2017 and 2023 — from 12.5% to 20.3%
            for 8–16 year olds, and from 10.1% to 23.3% for 17–19 year olds. These trends highlight an urgent need for
            complementary, non-medical strategies.
          </p>
        </div>

        <hr className="div" />

        <div className="el-section">
          <span className="el-section-label">The Science</span>
          <h2 className="h2">Why Experiential Learning Works</h2>
          <div className="callout">
            <strong>Experiential learning</strong> is a structured cycle in which individuals <em>do</em> (engage in purposeful,
            often novel activity), <em>reflect</em> (analyse the experience), <em>conceptualise</em> (draw general principles)
            and <em>apply</em> (transfer insights to new situations).
          </div>
          <p className="body">
            Science shows that the brain, like the body, thrives on stimulation. Just as physical exercise strengthens muscles,
            engaging in challenging experiences triggers neuroplasticity — forming new neural connections, boosting cognitive
            flexibility, and promoting emotional resilience. Without such mental exercise, neural pathways weaken, reducing
            our ability to adapt to and navigate life's complexities.
          </p>
          <p className="body">
            Through carefully designed experiential learning programmes, Empowr introduces individuals to fresh challenges that
            stimulate brain activity at a cellular level. This activation leads to the creation of new neural pathways, improving
            brain function, reducing stress hormones, and enhancing the body's natural ability to stay adaptable.
          </p>
          <p className="body">
            Without regular and meaningful stimulation, our neural connections weaken, and our ability to grow, cope, and thrive
            diminishes. That's why we create hands-on experiences that keep people thinking, moving, and connecting — nurturing
            sharper minds, stronger bodies, and deeper human connection.
          </p>
        </div>

        <hr className="div" />

        <div className="el-section">
          <span className="el-section-label">The Evidence</span>
          <h2 className="h2">What the Research Shows</h2>
          <div className="el-evidence-grid">
            <div className="el-evidence-card">
              <div className="el-evidence-icon">🧠</div>
              <div className="el-evidence-title">Neuroplasticity</div>
              <p className="el-evidence-body">Repeated engagement in novel, hands-on activities leads to growth of new neural pathways and improved brain health.</p>
            </div>
            <div className="el-evidence-card">
              <div className="el-evidence-icon">💪</div>
              <div className="el-evidence-title">Resilience & Self-Efficacy</div>
              <p className="el-evidence-body">Real-world challenges foster confidence, adaptability, and coping strategies — skills protective against anxiety and depression.</p>
            </div>
            <div className="el-evidence-card">
              <div className="el-evidence-icon">🤝</div>
              <div className="el-evidence-title">Social Connection</div>
              <p className="el-evidence-body">Group-based experiential learning directly counteracts isolation — a recognised driver of poor mental health.</p>
            </div>
            <div className="el-evidence-card">
              <div className="el-evidence-icon">🌿</div>
              <div className="el-evidence-title">Physical Health Synergy</div>
              <p className="el-evidence-body">Movement-rich and outdoor-based programmes deliver simultaneous mental and physical benefits, reducing stress hormones and enhancing emotional regulation.</p>
            </div>
            <div className="el-evidence-card">
              <div className="el-evidence-icon">📈</div>
              <div className="el-evidence-title">Long-Term Impact</div>
              <p className="el-evidence-body">Participatory, experiential learning models in schools, communities, and workplaces improve mood, lower anxiety, and reduce healthcare reliance.</p>
            </div>
          </div>
        </div>

        <hr className="div" />

        <div className="el-section">
          <span className="el-section-label">The Economic Case</span>
          <h2 className="h2">A Smarter Investment in Society</h2>
          <p className="body">
            Humans — regardless of age — are wired to seek progress and thrive on accomplishment. Whether mastering a new skill,
            moving with more confidence, or simply showing up and trying again, these experiences have a measurable effect on
            brain health and emotional stability. As more people feel capable and fulfilled, their contribution to society naturally increases.
          </p>
          <div className="el-economic-grid">
            <div className="el-economic-item">
              <div className="el-economic-icon">💼</div>
              <div className="el-economic-title">Greater Workforce Engagement</div>
              <p className="el-economic-body">Individuals who stay mentally and physically active are more focused, adaptable, and productive — better able to maintain a healthy work-life balance.</p>
            </div>
            <div className="el-economic-item">
              <div className="el-economic-icon">🏥</div>
              <div className="el-economic-title">Health System Relief</div>
              <p className="el-economic-body">Improving mental resilience reduces reliance on NHS services — freeing resources for critical, acute care.</p>
            </div>
            <div className="el-economic-item">
              <div className="el-economic-icon">🌍</div>
              <div className="el-economic-title">A More Resilient Population</div>
              <p className="el-economic-body">A society built on continual learning and personal agency is more resilient in the face of social, economic, and technological change.</p>
            </div>
            <div className="el-economic-item">
              <div className="el-economic-icon">🔄</div>
              <div className="el-economic-title">Indirect Public Benefit</div>
              <p className="el-economic-body">The psychological effects of learning and achievement — increased dopamine and serotonin — naturally lead to more positive social behaviour and community contribution.</p>
            </div>
          </div>
        </div>

        <hr className="div" />

        <div className="el-section">
          <span className="el-section-label">Our Commitment</span>
          <h2 className="h2">Leading the Movement</h2>
          <p className="body">
            The statistics are clear: the UK is facing a mental health crisis that cannot be solved by medication and therapy alone.
            Experiential learning is a powerful yet under-utilised tool — scientifically proven to build resilience, foster connection,
            and promote lifelong wellbeing. Integrating it into communities, schools, and health systems offers tangible progress for
            the millions who are struggling.
          </p>
          <p className="body">
            Empowr is committed to leading this movement — because we believe in the potential for every individual to thrive through experience.
          </p>
        </div>

        <hr className="div" />

        <details className="el-refs">
          <summary className="el-refs-toggle">View Sources & References</summary>
          <ol className="el-refs-list">
            <li>Milicevic, A., Milton, I. & O'Loughlin, C. (2016). Experiential reflective learning as a foundation for emotional resilience. <em>International Journal of Educational Research, 80</em>, 25–36.</li>
            <li>Coventry, P. A. et al. (2021). Nature-based outdoor activities for mental and physical health: A systematic review and meta-analysis. <em>SSM — Population Health, 16</em>, 100934.</li>
            <li>Gummelt, G. et al. (2024). Experiential learning in mental health diversion: Interdisciplinary approaches using Kolb's learning theory. <em>Journal of Evidence-Based Social Work, 22</em>(2), 171–188.</li>
            <li>Reece, J. (2025). Evaluating the effectiveness of adventure therapy in anxiety-related disorders. <em>Journal of Counselling and Development, 103</em>(3), 321–340.</li>
            <li>Grassini, S. (2022). A systematic review and meta-analysis of nature walk as an intervention for anxiety and depression. <em>Journal of Clinical Medicine, 11</em>(6), 1731.</li>
            <li>NHS Business Services Authority (2024). <em>Mental Health Medicines Statistics 2023/24: Antidepressant Prescribing.</em></li>
            <li>NHS Digital (2023). <em>Mental Health of Children and Young People in England, 2023 — Wave 4 Follow-up.</em></li>
            <li>NHS England (2025). <em>Mental Health Services Monthly Statistics — November 2024 (Final).</em></li>
            <li>NHS England (2019). <em>Mental Health Services Monthly Statistics — March 2019 (Final).</em></li>
            <li>NHS England (2016). <em>Mental Health Services Monthly Statistics — November 2016 (Final).</em></li>
            <li>Office for National Statistics (2024). <em>Suicides in England and Wales: 2023 Registrations.</em></li>
            <li>King's Fund (2025). <em>Mental Health 360°: Service and Workforce Trends.</em></li>
            <li>The Sunday Times (2025, 15 June). Antidepressant use doubles among teenagers.</li>
          </ol>
        </details>

        <hr className="div" />

        <div className="el-cta">
          <div className="el-cta-title">Ready to be part of the solution?</div>
          <p className="el-cta-body">
            Becoming an Empowr Hero means you're directly funding the experiential learning programmes this research supports.
          </p>
          <div className="btn-row-inline">
            <Link href="/become" className="btn btn-blue">Become a Hero →</Link>
            <a href={LINKS.site.main} target="_blank" rel="noopener" className="btn btn-outline">Visit Our Main Site →</a>
          </div>
        </div>

      </div>
    </main>
  )
}
