'use client'

// FULL COOKIE BANNER — not active yet.
// To switch to this banner:
// 1. Add the cookie categories you need (analytics, functional, or both) by
//    uncommenting the relevant state variables and JSX blocks below.
// 2. Update the cookie policy document to list those services.
// 3. In your layout, replace <CookieBanner /> with <CookieBannerFull />.
//
// When adding each category, remember to:
//   - Gate the script/service on the stored consent value
//   - Update the cookie policy document at legalhub.pecuvate.com

import { useState, useEffect } from 'react'

interface CookieConsent {
  necessary: true
  analytics: boolean
  functional: boolean
}

function getCookie(name: string) {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))
  return match ? match[2] : null
}

function setCookie(name: string, value: string, days: number) {
  const expires = new Date()
  expires.setDate(expires.getDate() + days)
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`
}

export default function CookieBannerFull() {
  const [visible, setVisible] = useState(false)
  const [dismissing, setDismissing] = useState(false)
  // Uncomment when analytics cookies are in use (e.g. Google Analytics, Vercel Analytics):
  // const [analytics, setAnalytics] = useState(true)
  // Uncomment when functional cookies are in use (e.g. saved preferences):
  // const [functional, setFunctional] = useState(true)

  useEffect(() => {
    const consent = getCookie('cookie_consent')
    if (!consent) setVisible(true)
  }, [])

  const dismiss = (consent: CookieConsent) => {
    setDismissing(true)
    setTimeout(() => {
      setCookie('cookie_consent', JSON.stringify(consent), 365)
      setVisible(false)
      setDismissing(false)
    }, 280)
  }

  const handleAcceptAll = () => dismiss({ necessary: true, analytics: true, functional: true })

  const handleSave = () => dismiss({
    necessary: true,
    analytics: false, // replace with: analytics,  once that state is uncommented
    functional: false, // replace with: functional, once that state is uncommented
  })

  if (!visible) return null

  return (
    <div className={`cookie-banner${dismissing ? ' dismissing' : ''}`}>
      <div className="cookie-inner">
        <div className="cookie-header">
          <p className="cookie-title">Cookie Preferences</p>
          <p className="cookie-text">
            We use cookies to improve your experience. Read our{' '}
            <a href="https://legalhub.pecuvate.com/share/empowr/empowr-cookie-policy" target="_blank" rel="noopener noreferrer">
              Cookie Policy
            </a>{' '}
            for more information.
          </p>
        </div>

        <div className="cookie-categories">
          {/* Strictly Necessary — always on, no toggle needed */}
          <div className="cookie-category">
            <div className="cookie-category-info">
              <p className="cookie-category-name">Strictly Necessary</p>
              <p className="cookie-category-desc">Security, session management &amp; this banner. Always on.</p>
            </div>
            <label className="cookie-toggle" aria-label="Strictly necessary cookies (always enabled)">
              <input type="checkbox" checked disabled readOnly />
              <span className="cookie-toggle-track" />
            </label>
          </div>

          {/* Analytics — uncomment when e.g. Google Analytics / Vercel Analytics is added
              AND cookie policy is updated to list the service:
          <div className="cookie-category">
            <div className="cookie-category-info">
              <p className="cookie-category-name">Analytics</p>
              <p className="cookie-category-desc">Helps us understand how visitors use the site so we can improve it.</p>
            </div>
            <label className="cookie-toggle" aria-label="Analytics cookies">
              <input type="checkbox" checked={analytics} onChange={e => setAnalytics(e.target.checked)} />
              <span className="cookie-toggle-track" />
            </label>
          </div>
          */}

          {/* Functional — uncomment when preference/personalisation cookies are added
              AND cookie policy is updated:
          <div className="cookie-category">
            <div className="cookie-category-info">
              <p className="cookie-category-name">Functional</p>
              <p className="cookie-category-desc">Remembers your preferences to personalise your experience.</p>
            </div>
            <label className="cookie-toggle" aria-label="Functional cookies">
              <input type="checkbox" checked={functional} onChange={e => setFunctional(e.target.checked)} />
              <span className="cookie-toggle-track" />
            </label>
          </div>
          */}
        </div>

        <div className="cookie-btns">
          <button className="btn btn-outline btn-sm cookie-decline" onClick={handleSave}>Save Preferences</button>
          <button className="btn btn-blue btn-sm" onClick={handleAcceptAll}>Accept All</button>
        </div>
      </div>
    </div>
  )
}
