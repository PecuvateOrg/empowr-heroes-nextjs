'use client'

import { useState } from 'react'
import posthog from 'posthog-js'
import { ENQUIRY_TOPICS } from '@/lib/enquiry-topics'

type Status = 'idle' | 'submitting' | 'success' | 'error'

export default function GeneralEnquiryForm() {
  const [status, setStatus] = useState<Status>('idle')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus('submitting')

    const form = e.currentTarget
    const data = {
      name: (form.elements.namedItem('name') as HTMLInputElement).value,
      email: (form.elements.namedItem('email') as HTMLInputElement).value,
      topic: (form.elements.namedItem('topic') as HTMLSelectElement).value,
      message: (form.elements.namedItem('message') as HTMLTextAreaElement).value,
      // Honeypot — real visitors leave this blank; bots fill it in.
      company: (form.elements.namedItem('company') as HTMLInputElement).value,
    }

    try {
      const res = await fetch('/.netlify/functions/general-enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Non-OK response')
      setStatus('success')
      posthog.capture('general_enquiry_submitted', { topic: data.topic })
    } catch {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="contact-success">
        <div className="contact-success-title">Message sent</div>
        <p className="contact-success-text">
          Thanks for reaching out. We've received your message and will get back to you shortly.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="contact-form">
      <div className="ef-honeypot" aria-hidden="true">
        <label htmlFor="company">Company (leave this blank)</label>
        <input id="company" name="company" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="ef-field">
        <label htmlFor="name" className="ef-label">Name</label>
        <input id="name" name="name" type="text" required autoComplete="name" />
      </div>

      <div className="ef-field">
        <label htmlFor="email" className="ef-label">Email</label>
        <input id="email" name="email" type="email" required autoComplete="email" />
      </div>

      <div className="ef-field">
        <label htmlFor="topic" className="ef-label">What's this about?</label>
        <select id="topic" name="topic" required defaultValue="">
          <option value="" disabled>Select a topic</option>
          {ENQUIRY_TOPICS.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      <div className="ef-field">
        <label htmlFor="message" className="ef-label">Message</label>
        <textarea id="message" name="message" required rows={5} />
      </div>

      {status === 'error' && (
        <p className="ef-error">
          Something went wrong — please try again or email us directly at hero@empowrcic.org.
        </p>
      )}

      <button type="submit" disabled={status === 'submitting'} className="btn btn-blue ef-submit">
        {status === 'submitting' ? 'Sending…' : 'Send Message'}
      </button>
    </form>
  )
}
