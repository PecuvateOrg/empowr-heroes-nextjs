'use client'

import { useState, useEffect } from 'react'

// When adding a new cookie category:
// 1. Uncomment the relevant block below
// 2. Add the service to the cookie policy document
// 3. Gate the script/service on the consent value

function getCookie(name: string) {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))
  return match ? match[2] : null
}

function setCookie(name: string, value: string, days: number) {
  const expires = new Date()
  expires.setDate(expires.getDate() + days)
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`
}

export default function CookieBanner() {
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

  const dismiss = (consentValue: string) => {
    setDismissing(true)
    setTimeout(() => {
      setCookie('cookie_consent', consentValue, 365)
      setVisible(false)
      setDismissing(false)
    }, 280)
  }

  const handleAccept = () => dismiss('accepted')
  const handleDecline = () => dismiss('declined')

  if (!visible) return null

  return (
    <div className={`cookie-banner${dismissing ? ' dismissing' : ''}`}>
      <div className="cookie-inner">
        <div className="cookie-header">
          <p className="cookie-title">Cookie Preferences</p>
          <p className="cookie-text">
            We use cookies to keep the site secure. Read our{' '}
            <a href="https://legalhub.pecuvate.com/share/empowr/empowr-cookie-policy" target="_blank" rel="noopener noreferrer">
              Cookie Policy
            </a>{' '}
            for more information.
          </p>
        </div>

        {/*
          COOKIE CATEGORIES — uncomment this whole section when optional cookies are added,
          and update the cookie policy document at the same time.

          <div className="cookie-categories">
            <div className="cookie-category">
              <div className="cookie-category-info">
                <p className="cookie-category-name">Strictly Necessary</p>
                <p className="cookie-category-desc">Security, session management & this banner. Always on.</p>
              </div>
              <label className="cookie-toggle" aria-label="Strictly necessary cookies (always enabled)">
                <input type="checkbox" checked disabled readOnly />
                <span className="cookie-toggle-track" />
              </label>
            </div>

            Analytics — uncomment when e.g. Google Analytics / Vercel Analytics is added:
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

            Functional — uncomment when preference/personalisation cookies are added:
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
          </div>
        */}

        <div className="cookie-btns">
          <button className="btn btn-outline btn-sm cookie-decline" onClick={handleDecline}>Decline</button>
          <button className="btn btn-blue btn-sm" onClick={handleAccept}>Accept</button>
        </div>
      </div>
    </div>
  )
}
