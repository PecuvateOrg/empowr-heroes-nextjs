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
const { buildEmailHtml, buildEmailText, buildOneTimeEmailHtml, buildOneTimeEmailText, buildInternalNotificationHtml, buildInternalNotificationText, buildCancellationNotificationHtml, buildCancellationNotificationText } = require('./email-template')
const { BADGES } = require('../lib/badges')
const { TIER_CONFIG } = require('../lib/tier-config')

// ---------------------------------------------------------------------------
// Notion logger
// ---------------------------------------------------------------------------

async function logToNotionWithStatus({ tier, amountTotal, currency, emailStatus, stripeSessionId, subscriptionId, status, notionApiKey, notionDatabaseId }) {
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
        url: stripeSessionId
          ? `https://dashboard.stripe.com/${stripeSessionId.startsWith('cs_test_') ? 'test/' : ''}checkout/sessions/${stripeSessionId}`
          : null,
      },
      ...(subscriptionId && {
        'Subscription ID': { rich_text: [{ text: { content: subscriptionId } }] },
      }),
      ...(status && {
        'Status': { select: { name: status } },
      }),
    },
  })
}

// Notion data source ID for the Donations DB (collection ID, distinct from the database page ID)
// Find this in CLAUDE.md under Infrastructure > Notion
const NOTION_DONATIONS_DATA_SOURCE_ID = '86ae1485-c4e1-8269-ba31-870796a355e1'

// ---------------------------------------------------------------------------
// Cancellation handler
// ---------------------------------------------------------------------------

const CANCELLATION_FEEDBACK_LABELS = {
  customer_service: 'Customer service',
  low_quality: 'Low quality',
  missing_features: 'Missing features',
  other: 'Other',
  switched_service: 'Switched to another service',
  too_complex: 'Too complex',
  too_expensive: 'Too expensive',
  unused: 'No longer using it',
}

async function handleCancellationEvent(event, { stripeSecretKey, resendApiKey, notionApiKey, notionDatabaseId }) {
  const subscription = event.data.object
  const subscriptionId = subscription.id
  const details = subscription.cancellation_details || {}

  const feedbackLabel = CANCELLATION_FEEDBACK_LABELS[details.feedback] || details.feedback || ''
  const comment = details.comment || ''
  const cancellationReason = [feedbackLabel, comment].filter(Boolean).join(' — ') || 'Not provided'

  // Fetch customer name and email from Stripe
  let name = 'Unknown'
  let email = ''
  try {
    const stripe = new Stripe(stripeSecretKey)
    const customer = await stripe.customers.retrieve(subscription.customer)
    name = customer.name || 'Unknown'
    email = customer.email || ''
  } catch (err) {
    console.error('[donation-handler] Could not fetch Stripe customer:', err.message)
  }

  const notion = new Client({ auth: notionApiKey })

  const response = await notion.dataSources.query({
    data_source_id: NOTION_DONATIONS_DATA_SOURCE_ID,
    filter: {
      property: 'Subscription ID',
      rich_text: { equals: subscriptionId },
    },
  })

  if (response.results.length === 0) {
    console.warn(`[donation-handler] No Notion record found for subscription ${subscriptionId}`)
  } else {
    const pageId = response.results[0].id
    const tier = response.results[0].properties?.Tier?.select?.name || 'Unknown'

    await notion.pages.update({
      page_id: pageId,
      properties: {
        'Status': { select: { name: 'Cancelled' } },
        'Cancellation Reason': { rich_text: [{ text: { content: cancellationReason } }] },
      },
    })

    console.log(`[donation-handler] Marked subscription ${subscriptionId} as cancelled in Notion. Reason: ${cancellationReason}`)

    // Send internal cancellation notification
    try {
      const resend = new Resend(resendApiKey)
      await resend.emails.send({
        from: 'Empowr Heroes <heroes@hero.empowrcic.org>',
        to: 'hero@empowrcic.org',
        subject: `Cancellation: ${name} — ${tier}`,
        html: buildCancellationNotificationHtml({ name, email, tier, cancellationReason, subscriptionId }),
        text: buildCancellationNotificationText({ name, email, tier, cancellationReason, subscriptionId }),
      })
      console.log(`[donation-handler] Cancellation notification sent for ${name} (${subscriptionId})`)
    } catch (err) {
      console.error('[donation-handler] Cancellation notification error:', err.message)
    }
  }

  return { handled: true, event: 'customer.subscription.deleted', subscriptionId }
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
 * @param {string} params.siteUrl          - Live site URL e.g. https://hero.empowrcic.org
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

  // 2. Route based on event type
  if (event.type === 'customer.subscription.deleted') {
    return await handleCancellationEvent(event, { stripeSecretKey, resendApiKey, notionApiKey, notionDatabaseId })
  }

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
  const subscriptionId = session.subscription || null
  const notionStatus = tier === 'onetime' ? 'One-Time' : 'Active'

  if (!email) {
    console.warn('[donation-handler] No email found on session:', session.id)
  }

  if (!tier || (tier !== 'onetime' && !TIER_CONFIG[tier])) {
    console.warn(`[donation-handler] Unknown or missing tier "${tier}" on session:`, session.id)
  }

  // 4. Send welcome email
  let emailStatus = 'Failed'
  const resend = new Resend(resendApiKey)

  if (email && tier === 'onetime') {
    try {
      await resend.emails.send({
        from: 'Empowr Heroes <heroes@hero.empowrcic.org>',
        to: email,
        subject: 'Thank You for Supporting Empowr',
        html: buildOneTimeEmailHtml({ name, siteUrl }),
        text: buildOneTimeEmailText({ name, siteUrl }),
      })
      emailStatus = 'Sent'
      console.log(`[donation-handler] One-time thank you email sent to ${email}`)
    } catch (err) {
      console.error('[donation-handler] Resend error:', err.message)
      emailStatus = 'Failed'
    }
  } else if (email && tier && TIER_CONFIG[tier]) {
    try {
      await resend.emails.send({
        from: 'Empowr Heroes <heroes@hero.empowrcic.org>',
        to: email,
        subject: "You're an Empowr Hero",
        html: buildEmailHtml({ name, tierData: { ...TIER_CONFIG[tier], badgeUrl: BADGES[tier] } }),
        text: buildEmailText({ name, tierData: { ...TIER_CONFIG[tier], badgeUrl: BADGES[tier] } }),
      })
      emailStatus = 'Sent'
      console.log(`[donation-handler] Welcome email sent to ${email}`)
    } catch (err) {
      console.error('[donation-handler] Resend error:', err.message)
      emailStatus = 'Failed'
    }
  }

  // 4b. Send internal notification
  try {
    const amountFormatted = amountTotal ? (amountTotal / 100).toFixed(2) : '0.00'
    const currencyUpper = (currency || 'gbp').toUpperCase()
    let notificationSubject, notificationTierLabel, notificationPeriod

    if (tier === 'onetime') {
      notificationSubject = `New One-Time Donation: ${name}`
      notificationTierLabel = 'One-Time Donation'
      notificationPeriod = '(one-time)'
    } else if (tier && TIER_CONFIG[tier]) {
      const tierData = TIER_CONFIG[tier]
      notificationSubject = `New Hero: ${name} — ${tierData.label}`
      notificationTierLabel = tierData.label
      notificationPeriod = '/ month'
    }

    if (notificationSubject) {
      await resend.emails.send({
        from: 'Empowr Heroes <heroes@hero.empowrcic.org>',
        to: 'hero@empowrcic.org',
        subject: notificationSubject,
        html: buildInternalNotificationHtml({ name, email, tierLabel: notificationTierLabel, amountFormatted, currency: currencyUpper, sessionId: stripeSessionId, period: notificationPeriod }),
        text: buildInternalNotificationText({ name, email, tierLabel: notificationTierLabel, amountFormatted, currency: currencyUpper, sessionId: stripeSessionId, period: notificationPeriod }),
      })
      console.log(`[donation-handler] Internal notification sent for ${name} (${tier})`)
    }
  } catch (err) {
    console.error('[donation-handler] Internal notification error:', err.message)
  }

  // 5. Log to Notion
  try {
    await logToNotionWithStatus({
      tier,
      amountTotal,
      currency,
      emailStatus,
      stripeSessionId,
      subscriptionId,
      status: notionStatus,
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

module.exports = { handleDonation }
