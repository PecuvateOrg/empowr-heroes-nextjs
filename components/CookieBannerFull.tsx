'use client'

// FULL COOKIE BANNER — swap this in from layout.tsx when optional cookies are in use
// and the cookie policy document has been updated.
// To activate: in app/layout.tsx comment out <CookieBanner /> and use <CookieBannerFull />

import { useState, useEffect } from 'react'
import { LINKS } from '@/lib/links'

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
  const [showSettings, setShowSettings] = useState(false)
  const [analytics, setAnalytics] = useState(true)
  const [functional, setFunctional] = useState(true)

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
  const handleDecline = () => dismiss({ necessary: true, analytics: false, functional: false })
  const handleSave = () => dismiss({ necessary: true, analytics, functional })

  if (!visible) return null

  return (
    <div className={`cookie-banner${dismissing ? ' dismissing' : ''}`}>
      {showSettings && (
        <div className="cookie-settings">
          <div className="cookie-setting-row">
            <div className="cookie-setting-info">
              <p className="cookie-setting-name">Strictly Necessary</p>
              <p className="cookie-setting-desc">Security, session management &amp; this banner. Always on.</p>
            </div>
            <label className="cookie-toggle" aria-label="Strictly necessary cookies (always enabled)">
              <input type="checkbox" checked disabled readOnly />
              <span className="cookie-toggle-track" />
            </label>
          </div>

          <div className="cookie-setting-row">
            <div className="cookie-setting-info">
              <p className="cookie-setting-name">Analytics</p>
              <p className="cookie-setting-desc">Helps us understand how visitors use the site so we can improve it.</p>
            </div>
            <label className="cookie-toggle" aria-label="Analytics cookies">
              <input type="checkbox" checked={analytics} onChange={e => setAnalytics(e.target.checked)} />
              <span className="cookie-toggle-track" />
            </label>
          </div>

          <div className="cookie-setting-row">
            <div className="cookie-setting-info">
              <p className="cookie-setting-name">Functional</p>
              <p className="cookie-setting-desc">Remembers your preferences to personalise your experience.</p>
            </div>
            <label className="cookie-toggle" aria-label="Functional cookies">
              <input type="checkbox" checked={functional} onChange={e => setFunctional(e.target.checked)} />
              <span className="cookie-toggle-track" />
            </label>
          </div>
        </div>
      )}

      <div className="cookie-bar">
        <p className="cookie-text">
          We use cookies to improve your experience. Read our{' '}
          <a href={LINKS.policy.cookiePolicy} target="_blank" rel="noopener noreferrer">
            Cookie Policy
          </a>{' '}
          for more information.
        </p>
        <div className="cookie-btns">
          <button className="btn btn-outline btn-sm cookie-decline" onClick={handleDecline}>Decline</button>
          {showSettings
            ? <button className="btn btn-outline btn-sm" onClick={handleSave}>Save Preferences</button>
            : <button className="btn btn-outline btn-sm" onClick={() => setShowSettings(true)}>Cookie Settings</button>
          }
          <button className="btn btn-blue btn-sm" onClick={handleAcceptAll}>Accept All</button>
        </div>
      </div>
    </div>
  )
}
