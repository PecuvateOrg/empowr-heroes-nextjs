/**
 * ops/scripts/preview-email.js
 *
 * Renders the email template to an HTML file for browser preview.
 * Run: node ops/scripts/preview-email.js [tier]
 *
 * Examples:
 *   node ops/scripts/preview-email.js              → defaults to community
 *   node ops/scripts/preview-email.js seed
 *   node ops/scripts/preview-email.js champion
 *   node ops/scripts/preview-email.js onetime
 *
 * Or via npm:
 *   npm run preview:email                  → defaults to community tier
 *   npm run preview:email -- seed          → seed tier
 *   npm run preview:email -- momentum      → momentum tier
 *   npm run preview:email -- community     → community tier
 *   npm run preview:email -- champion      → champion tier
 *   npm run preview:email -- legacy        → legacy tier
 *   npm run preview:email -- onetime       → one-time donor email
 *
 * Then open the output in your browser:
 *   start ops/scripts/preview.html
 *
 * After that, just refresh the browser tab each time you regenerate.
 */

const fs = require('fs')
const path = require('path')
const { buildEmailHtml, buildOneTimeEmailHtml } = require('../../src/core/email-template')
const { TIER_CONFIG } = require('../../src/lib/tier-config')
const { BADGES } = require('../../src/lib/badges')

const VALID_TIERS = [...Object.keys(TIER_CONFIG), 'onetime']
const tier = process.argv[2] || 'community'

if (!VALID_TIERS.includes(tier)) {
  console.error(`Unknown tier "${tier}". Valid options: ${VALID_TIERS.join(', ')}`)
  process.exit(1)
}

let html

if (tier === 'onetime') {
  html = buildOneTimeEmailHtml({
    name: 'Alex Johnson',
    siteUrl: 'https://hero.empowrcic.org',
  })
} else {
  const tierData = {
    ...TIER_CONFIG[tier],
    badgeUrl: BADGES[tier],
  }

  html = buildEmailHtml({
    name: 'Alex Johnson',
    tierData,
  })
}

const outputPath = path.join(__dirname, 'preview.html')
fs.writeFileSync(outputPath, html, 'utf8')
console.log(`Preview written to ops/scripts/preview.html`)
console.log(`Tier: ${tier}`)
