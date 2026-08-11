'use client'

import { useState } from 'react'
import posthog from 'posthog-js'

const INTEREST_OPTIONS = [
  'Personal giving',
  'Corporate or foundation',
  'Legacy or estate',
  'Exploring — not sure yet',
]

const COMMITMENT_OPTIONS = [
  'Prefer to discuss',
  '£100k–£250k',
  '£250k–£500k',
  '£500k+',
]

type Status = 'idle' | 'submitting' | 'success' | 'error'

export default function PatronEnquiryForm() {
  const [expanded, setExpanded] = useState(false)
  const [animateIn, setAnimateIn] = useState(false)
  const [status, setStatus] = useState<Status>('idle')

  function openForm() {
    setExpanded(true)
    // Mount collapsed first, then flip to open on the next frame so the
    // height transition actually has something to animate from.
    requestAnimationFrame(() => requestAnimationFrame(() => setAnimateIn(true)))
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus('submitting')

    const form = e.currentTarget
    const data = {
      name: (form.elements.namedItem('name') as HTMLInputElement).value,
      email: (form.elements.namedItem('email') as HTMLInputElement).value,
      organisation: (form.elements.namedItem('organisation') as HTMLInputElement).value,
      phone: (form.elements.namedItem('phone') as HTMLInputElement).value,
      interest: (form.elements.namedItem('interest') as HTMLSelectElement).value,
      commitment: (form.elements.namedItem('commitment') as HTMLSelectElement).value,
      message: (form.elements.namedItem('message') as HTMLTextAreaElement).value,
      // Honeypot — real visitors leave this blank; bots fill it in.
      // Named "website" (not "company") because this form has a real
      // organisation field, and reusing that name would drop genuine submissions.
      website: (form.elements.namedItem('website') as HTMLInputElement).value,
    }

    try {
      const res = await fetch('/.netlify/functions/patron-enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Non-OK response')
      setStatus('success')
      posthog.capture('patron_enquiry_submitted', {
        interest: data.interest,
        commitment_disclosed: data.commitment !== 'Prefer to discuss',
      })
    } catch {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="patron-success">
        <div className="patron-success-title">Thank you</div>
        <p className="patron-success-text">
          We've received your enquiry. Founding Patron conversations are handled personally by our leadership team — we'll be in touch within a few working days.
        </p>
      </div>
    )
  }

  if (!expanded) {
    return (
      <button type="button" className="btn-patron-contact" onClick={openForm}>
        ✉️ Get in Touch
      </button>
    )
  }

  return (
    <div className={`patron-form-collapse${animateIn ? ' open' : ''}`}>
      <div>
        <form onSubmit={handleSubmit} className="patron-form">
          <div className="ef-honeypot" aria-hidden="true">
            <label htmlFor="website">Website (leave this blank)</label>
            <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
          </div>

          <div className="ef-field">
            <label htmlFor="name" className="ef-label">Full name</label>
            <input id="name" name="name" type="text" required autoComplete="name" />
          </div>

          <div className="ef-field">
            <label htmlFor="email" className="ef-label">Email</label>
            <input id="email" name="email" type="email" required autoComplete="email" />
          </div>

          <div className="ef-field">
            <label htmlFor="organisation" className="ef-label">Organisation / foundation (optional)</label>
            <input id="organisation" name="organisation" type="text" autoComplete="organization" />
          </div>

          <div className="ef-field">
            <label htmlFor="phone" className="ef-label">Phone (optional)</label>
            <input id="phone" name="phone" type="tel" autoComplete="tel" />
          </div>

          <div className="ef-field">
            <label htmlFor="interest" className="ef-label">Nature of interest</label>
            <select id="interest" name="interest" required defaultValue="">
              <option value="" disabled>Select an option</option>
              {INTEREST_OPTIONS.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          </div>

          <div className="ef-field">
            <label htmlFor="commitment" className="ef-label">Indicative commitment (optional)</label>
            <select id="commitment" name="commitment" defaultValue={COMMITMENT_OPTIONS[0]}>
              {COMMITMENT_OPTIONS.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          </div>

          <div className="ef-field">
            <label htmlFor="message" className="ef-label">Message</label>
            <textarea id="message" name="message" required rows={4} />
          </div>

          {status === 'error' && (
            <p className="ef-error">
              Something went wrong — please try again or email us directly at patron@empowrcic.org.
            </p>
          )}

          <button type="submit" disabled={status === 'submitting'} className="ef-submit">
            {status === 'submitting' ? 'Sending…' : '✉️ Get in Touch'}
          </button>
        </form>
      </div>
    </div>
  )
}
