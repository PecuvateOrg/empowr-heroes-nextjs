/**
 * core/donation-handler.js
 *
 * The kitchen — all business logic lives here.
 * No dependency on Netlify, Express, or any hosting platform.
 * Can be extracted into a standalone Pecuvate service in the future.
 *
 * Stripe metadata expected on each Payment Link:
 *   tier: "seed" | "momentum" | "community" | "champion" | "legacy"
 *
 * Donor name and email are extracted from Stripe's billing_details.
 */

const Stripe = require('stripe')
const { Resend } = require('resend')
const { Client } = require('@notionhq/client')
const { buildEmailHtml, buildEmailText } = require('./email-template')

// ---------------------------------------------------------------------------
// Tier config
// ---------------------------------------------------------------------------

const TIER_CONFIG = {
  seed: {
    label: 'Seed Hero',
    emoji: '🌱',
    price: '£10/month',
    badge: 'seed-hero.png',
    desc: 'Plant the seeds of change — your contribution helps keep our sessions affordable and accessible.',
  },
  momentum: {
    label: 'Momentum Hero',
    emoji: '🚀',
    price: '£25/month',
    badge: 'momentum-hero.png',
    desc: 'Build momentum for growth — your support funds the infrastructure that enables sessions to happen consistently.',
  },
  community: {
    label: 'Community Hero',
    emoji: '🫂',
    price: '£50/month',
    badge: 'community-hero.png',
    desc: 'Power community transformation — your support helps us expand our reach to new venues, schools, and communities.',
  },
  champion: {
    label: 'Champion Hero',
    emoji: '🏆',
    price: '£250/month',
    badge: 'champion-hero.png',
    desc: 'Lead the movement — you\'re fuelling sustainable growth and long-term impact across the UK.',
  },
  legacy: {
    label: 'Legacy Hero',
    emoji: '💎',
    price: '£500/month',
    badge: 'legacy-hero.png',
    desc: 'Power moves — your substantial commitment enables us to think and act more ambitiously.',
  },
}

// ---------------------------------------------------------------------------
// Notion logger
// ---------------------------------------------------------------------------

async function logToNotionWithStatus({ tier, amountTotal, currency, emailStatus, stripeSessionId, notionApiKey, notionDatabaseId }) {
  const notion = new Client({ auth: notionApiKey })
  const tierData = TIER_CONFIG[tier] || {}
  const amount = amountTotal ? (amountTotal / 100).toFixed(2) : '0.00'
  const currencyUpper = (currency || 'gbp').toUpperCase()

  await notion.pages.create({
    parent: { database_id: notionDatabaseId },
    properties: {
      Record: {
        title: [{ text: { content: tierData.label || tier || 'Unknown' } }],
      },
      Tier: {
        select: { name: tierData.label || tier },
      },
      Amount: {
        number: parseFloat(amount),
      },
      Currency: {
        select: { name: currencyUpper },
      },
      Date: {
        date: { start: new Date().toISOString() },
      },
      'Email Status': {
        select: { name: emailStatus },
      },
      'Stripe Dashboard': {
        url: stripeSessionId ? `https://dashboard.stripe.com/checkout/sessions/${stripeSessionId}` : null,
      },
    },
  })
}

// ---------------------------------------------------------------------------
// Main handler
// ---------------------------------------------------------------------------

/**
 * handleDonation
 *
 * @param {object} params
 * @param {string} params.rawBody          - Raw request body string (required for Stripe signature verification)
 * @param {string} params.signature        - Value of the stripe-signature header
 * @param {string} params.stripeSecretKey
 * @param {string} params.stripeWebhookSecret
 * @param {string} params.resendApiKey
 * @param {string} params.notionApiKey
 * @param {string} params.notionDatabaseId
 * @param {string} params.siteUrl          - Live site URL e.g. https://heroes.empowr-cic.org
 */
async function handleDonation({
  rawBody,
  signature,
  stripeSecretKey,
  stripeWebhookSecret,
  resendApiKey,
  notionApiKey,
  notionDatabaseId,
  siteUrl,
}) {
  // 1. Verify Stripe webhook signature
  const stripe = new Stripe(stripeSecretKey)
  let event

  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, stripeWebhookSecret)
  } catch (err) {
    const error = new Error(`Stripe signature verification failed: ${err.message}`)
    error.statusCode = 400
    throw error
  }

  // 2. Only handle checkout.session.completed
  if (event.type !== 'checkout.session.completed') {
    return { ignored: true, eventType: event.type }
  }

  const session = event.data.object

  // 3. Extract donor details
  const name = session.customer_details?.name || session.metadata?.donor_name || 'Hero'
  const email = session.customer_details?.email || session.metadata?.donor_email || ''
  const tier = (session.metadata?.tier || '').toLowerCase()
  const amountTotal = session.amount_total
  const currency = session.currency
  const stripeSessionId = session.id

  if (!email) {
    console.warn('[donation-handler] No email found on session:', session.id)
  }

  if (!tier || !TIER_CONFIG[tier]) {
    console.warn(`[donation-handler] Unknown or missing tier "${tier}" on session:`, session.id)
  }

  // 4. Send welcome email
  let emailStatus = 'Failed'

  if (email && tier && TIER_CONFIG[tier]) {
    try {
      const resend = new Resend(resendApiKey)
      await resend.emails.send({
        from: 'Empowr Heroes <heroes@hero.empowrcic.org>',
        to: email,
        subject: "You're an Empowr Hero",
        html: buildEmailHtml({ name, tier, siteUrl, tierData: TIER_CONFIG[tier] }),
        text: buildEmailText({ name, tier, tierData: TIER_CONFIG[tier] }),
      })
      emailStatus = 'Sent'
      console.log(`[donation-handler] Welcome email sent to ${email}`)
    } catch (err) {
      console.error('[donation-handler] Resend error:', err.message)
      emailStatus = 'Failed'
    }
  }

  // 5. Log to Notion
  try {
    await logToNotionWithStatus({
      tier,
      amountTotal,
      currency,
      emailStatus,
      stripeSessionId,
      notionApiKey,
      notionDatabaseId,
    })
    console.log(`[donation-handler] Logged to Notion for session ${stripeSessionId}`)
  } catch (err) {
    console.error('[donation-handler] Notion error:', err.message)
    // Don't throw — email was already sent, logging failure should not break the response
  }

  return { success: true, email, tier, emailStatus }
}

module.exports = { handleDonation, TIER_CONFIG }
