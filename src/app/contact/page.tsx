import Link from 'next/link'
import GeneralEnquiryForm from '@/components/GeneralEnquiryForm'
import Mantra from '@/components/Mantra'

export const metadata = {
  title: 'Contact Us — Empowr Heroes',
}

export default function ContactPage() {
  return (
    <main className="page-content page-contact">
      <div className="wrap contact-wrap">
        <div>
          <Link href="/tiers" className="back-btn">← Back</Link>
        </div>

        <div className="contact-header">
          <h1 className="contact-title">Questions About Your Impact?</h1>
          <p className="contact-desc">
            Want to understand more about how your specific contribution would be used, or to just have a chat — we're happy to discuss.
          </p>
        </div>

        <GeneralEnquiryForm />

        <Mantra />
      </div>
    </main>
  )
}
