'use client'

import { useState, useEffect } from 'react'

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

  useEffect(() => {
    const consent = getCookie('cookie_consent')
    if (!consent) setVisible(true)
  }, [])

  const handleAccept = () => {
    setCookie('cookie_consent', 'accepted', 365)
    setVisible(false)
  }

  const handleDecline = () => {
    setCookie('cookie_consent', 'declined', 365)
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="cookie-banner">
      <div className="cookie-inner">
        <p className="cookie-text">
          We use cookies to improve your experience. Read our{' '}
          <a href="https://legalhub.pecuvate.com/share/empowr/empowr-cookie-policy" target="_blank" rel="noopener noreferrer">Cookie Policy</a>{' '}
          for more information.
        </p>
        <div className="cookie-btns">
          <button className="btn btn-outline btn-sm cookie-decline" onClick={handleDecline}>Decline</button>
          <button className="btn btn-blue btn-sm" onClick={handleAccept}>Accept All</button>
        </div>
      </div>
    </div>
  )
}
