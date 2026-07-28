'use client'

import posthog from 'posthog-js'
import { PostHogProvider as PHProvider } from 'posthog-js/react'
import { useEffect } from 'react'

export default function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    posthog.init('phc_mtVbW9nET3w5qybzT6PmfbJLMPYy4Yv69wjmrnhxMJSf', {
      api_host: 'https://us.i.posthog.com',
      person_profiles: 'identified_only',
      cookieless_mode: 'always',
      capture_pageview: true,
      capture_pageleave: true,
      before_send: (event) => {
        if (window.location.hostname === 'localhost') return null
        const ua = navigator?.userAgent?.toLowerCase() ?? ''
        if (/headless|phantomjs|selenium|webdriver|puppeteer|playwright/.test(ua)) return null
        return event
      },
    })
    posthog.register({
      site_id: 'empowr-heroes',
      org: 'empowr-cic',
      brand: 'Empowr CIC',
      site_name: 'Empowr Heroes',
      site_url: 'https://hero.empowrcic.org',
    })
  }, [])

  return <PHProvider client={posthog}>{children}</PHProvider>
}
