/**
 * core/donation-handler.ts
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

import Stripe from 'stripe'
import { Resend } from 'resend'
import { Client } from '@notionhq/client'
import {
  buildEmailHtml,
  buildEmailText,
  buildOneTimeEmailHtml,
  buildOneTimeEmailText,
  buildInternalNotificationHtml,
  buildInternalNotificationText,
  buildCancellationNotificationHtml,
  buildCancellationNotificationText,
  buildPaymentFailedNotificationHtml,
  buildPaymentFailedNotificationText,
} from './email-template'
import { BADGES } from '../lib/badges'
import { TIERS, tierDesc, type TierKey } from '../lib/tiers'
import { PROJECTS, type ProjectKey } from '../lib/projects'
import { resolveEventOwnership, invoiceSubscriptionId } from './event-ownership'

function isTierKey(tier: string): tier is Exclude<TierKey, 'onetime'> {
  return tier in TIERS && tier !== 'onetime'
}

function isProjectKey(project: string): project is ProjectKey {
  return project in PROJECTS
}

/** Shape the webhook/email path needs from a tier — derived from the canonical TIERS, never hand-duplicated. */
function tierEmailData(tier: Exclude<TierKey, 'onetime'>) {
  const t = TIERS[tier]
  return { label: t.name, emoji: t.emoji, price: t.price, desc: tierDesc(tier), badgeUrl: BADGES[tier] }
}

// ---------------------------------------------------------------------------
// Notion logger
// ---------------------------------------------------------------------------

async function logToNotionWithStatus({
  tier,
  project,
  amountTotal,
  currency,
  emailStatus,
  stripeSessionId,
  subscriptionId,
  status,
  notionApiKey,
  notionDatabaseId,
}: {
  tier: string
  project: string | null
  amountTotal: number | null
  currency: string | null
  emailStatus: string
  stripeSessionId: string
  subscriptionId: string | null
  status: string
  notionApiKey: string
  notionDatabaseId: string
}) {
  const notion = new Client({ auth: notionApiKey })
  const tierLabel = isTierKey(tier) ? TIERS[tier].name : tier === 'onetime' ? TIERS.onetime.name : null
  const projectLabel = project && isProjectKey(project) ? PROJECTS[project].name : null
  const amount = amountTotal ? (amountTotal / 100).toFixed(2) : '0.00'
  const currencyUpper = (currency || 'gbp').toUpperCase()

  await notion.pages.create({
    parent: { database_id: notionDatabaseId },
    properties: {
      Record: {
        title: [{ text: { content: tierLabel || tier || 'Unknown' } }],
      },
      Tier: {
        select: { name: tierLabel || tier },
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
      ...(projectLabel && {
        Project: { select: { name: projectLabel } },
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

const CANCELLATION_FEEDBACK_LABELS: Record<string, string> = {
  customer_service: 'Customer service',
  low_quality: 'Low quality',
  missing_features: 'Missing features',
  other: 'Other',
  switched_service: 'Switched to another service',
  too_complex: 'Too complex',
  too_expensive: 'Too expensive',
  unused: 'No longer using it',
}

type WebhookCreds = {
  stripeSecretKey: string
  resendApiKey: string
  notionApiKey: string
  notionDatabaseId: string
}

async function handleCancellationEvent(event: Stripe.Event, { stripeSecretKey, resendApiKey, notionApiKey, notionDatabaseId }: WebhookCreds) {
  const subscription = event.data.object as Stripe.Subscription
  const subscriptionId = subscription.id
  const details = subscription.cancellation_details

  const feedbackLabel = (details?.feedback && CANCELLATION_FEEDBACK_LABELS[details.feedback]) || details?.feedback || ''
  const comment = details?.comment || ''
  const cancellationReason = [feedbackLabel, comment].filter(Boolean).join(' — ') || 'Not provided'

  // Fetch customer name and email from Stripe
  let name = 'Unknown'
  let email = ''
  try {
    const stripe = new Stripe(stripeSecretKey)
    const customer = await stripe.customers.retrieve(subscription.customer as string) as Stripe.Customer
    name = customer.name || 'Unknown'
    email = customer.email || ''
  } catch (err) {
    console.error('[donation-handler] Could not fetch Stripe customer:', (err as Error).message)
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
    const page = response.results[0] as any
    const pageId = page.id
    const tier = page.properties?.Tier?.select?.name || 'Unknown'

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
        from: 'Empowr Heroes <hero@empowrcic.org>',
        to: 'hero@empowrcic.org',
        subject: `Cancellation: ${name} — ${tier}`,
        html: buildCancellationNotificationHtml({ name, email, tier, cancellationReason, subscriptionId }),
        text: buildCancellationNotificationText({ name, email, tier, cancellationReason, subscriptionId }),
      })
      console.log(`[donation-handler] Cancellation notification sent for ${name} (${subscriptionId})`)
    } catch (err) {
      console.error('[donation-handler] Cancellation notification error:', (err as Error).message)
    }
  }

  return { handled: true, event: 'customer.subscription.deleted', subscriptionId }
}

// ---------------------------------------------------------------------------
// Payment failed handler
// ---------------------------------------------------------------------------

async function handlePaymentFailedEvent(event: Stripe.Event, { stripeSecretKey, resendApiKey, notionApiKey, notionDatabaseId }: WebhookCreds) {
  const invoice = event.data.object as Stripe.Invoice
  // `invoice.subscription` does NOT exist on the account's current API version
  // — it moved to `invoice.parent.subscription_details.subscription`. The old
  // `(invoice as any).subscription` cast silenced TypeScript and evaluated to
  // undefined every time, so every payment-failed alert and Notion row carried
  // a null subscription ID. Read it through the helper, which owns that shape.
  const subscriptionId = invoiceSubscriptionId(invoice)
  const amountFormatted = invoice.amount_due ? (invoice.amount_due / 100).toFixed(2) : '0.00'
  const currency = (invoice.currency || 'gbp').toUpperCase()
  const attemptCount = invoice.attempt_count || 1

  // Fetch customer name and email from Stripe
  let name = 'Unknown'
  let email = ''
  try {
    const stripe = new Stripe(stripeSecretKey)
    const customer = await stripe.customers.retrieve(invoice.customer as string) as Stripe.Customer
    name = customer.name || 'Unknown'
    email = customer.email || ''
  } catch (err) {
    console.error('[donation-handler] Could not fetch Stripe customer:', (err as Error).message)
  }

  const notion = new Client({ auth: notionApiKey })

  const response = await notion.dataSources.query({
    data_source_id: NOTION_DONATIONS_DATA_SOURCE_ID,
    filter: {
      property: 'Subscription ID',
      rich_text: { equals: subscriptionId || '' },
    },
  })

  let tier = 'Unknown'

  if (response.results.length === 0) {
    console.warn(`[donation-handler] No Notion record found for subscription ${subscriptionId} (payment failed)`)
  } else {
    const page = response.results[0] as any
    const pageId = page.id
    tier = page.properties?.Tier?.select?.name || 'Unknown'

    await notion.pages.update({
      page_id: pageId,
      properties: {
        'Status': { select: { name: 'Payment Failed' } },
      },
    })

    console.log(`[donation-handler] Marked subscription ${subscriptionId} as Payment Failed in Notion (attempt ${attemptCount})`)
  }

  // Send internal notification
  try {
    const resend = new Resend(resendApiKey)
    await resend.emails.send({
      from: 'Empowr Heroes <hero@empowrcic.org>',
      to: 'hero@empowrcic.org',
      subject: `Payment Failed: ${name} — ${tier} (attempt ${attemptCount})`,
      html: buildPaymentFailedNotificationHtml({ name, email, tier, amountFormatted, currency, attemptCount, subscriptionId: subscriptionId || '' }),
      text: buildPaymentFailedNotificationText({ name, email, tier, amountFormatted, currency, attemptCount, subscriptionId: subscriptionId || '' }),
    })
    console.log(`[donation-handler] Payment failed notification sent for ${name} (${subscriptionId})`)
  } catch (err) {
    console.error('[donation-handler] Payment failed notification error:', (err as Error).message)
  }

  return { handled: true, event: 'invoice.payment_failed', subscriptionId }
}

// ---------------------------------------------------------------------------
// Main handler
// ---------------------------------------------------------------------------

export async function handleDonation({
  rawBody,
  signature,
  stripeSecretKey,
  stripeWebhookSecret,
  resendApiKey,
  notionApiKey,
  notionDatabaseId,
  siteUrl,
}: {
  rawBody: string
  signature: string
  stripeSecretKey: string
  stripeWebhookSecret: string
  resendApiKey: string
  notionApiKey: string
  notionDatabaseId: string
  siteUrl: string
}) {
  // 1. Verify Stripe webhook signature
  const stripe = new Stripe(stripeSecretKey)
  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, stripeWebhookSecret)
  } catch (err) {
    const error = new Error(`Stripe signature verification failed: ${(err as Error).message}`) as Error & { statusCode?: number }
    error.statusCode = 400
    throw error
  }

  // 2. Ownership gate — ONCE, BEFORE ANY ROUTING.
  //
  // This Stripe account is shared with other Empowr CIC apps (Members), and
  // Stripe fans every subscribed event type out to every endpoint on the
  // account regardless of which app created the object — delivery is NOT
  // scoped by API key. So an event arriving here is only "some event on the
  // Empowr CIC account" until proven otherwise.
  //
  // Deliberately placed above the routing rather than inside each handler:
  // the previous shape checked ownership only on the checkout.session branch,
  // which left customer.subscription.deleted and invoice.payment_failed wide
  // open — a Members subscriber cancelling would have been written into the
  // Heroes donor Notion database. Checking here means a new event type cannot
  // reach a handler without first being classified in event-ownership.ts.
  //
  // See core/event-ownership.ts for the design rules. Do not move this check
  // downwards, and do not add a "probably ours" fallback.
  const ownership = resolveEventOwnership(event)
  if (!ownership.ours) {
    console.log(`[donation-handler] Ignoring ${event.type} (${event.id}) — not a Heroes object: ${ownership.reason}`)
    return { ignored: true, reason: 'not_a_heroes_object', eventType: event.type, eventId: event.id }
  }

  // Route based on event type — everything below is confirmed Heroes'.
  if (event.type === 'customer.subscription.deleted') {
    return await handleCancellationEvent(event, { stripeSecretKey, resendApiKey, notionApiKey, notionDatabaseId })
  }

  if (event.type === 'invoice.payment_failed') {
    return await handlePaymentFailedEvent(event, { stripeSecretKey, resendApiKey, notionApiKey, notionDatabaseId })
  }

  if (event.type !== 'checkout.session.completed') {
    return { ignored: true, eventType: event.type }
  }

  const session = event.data.object as Stripe.Checkout.Session

  // 3. Extract donor details
  const name = session.customer_details?.name || session.metadata?.donor_name || 'Hero'
  const email = session.customer_details?.email || session.metadata?.donor_email || ''
  const tier = (session.metadata?.tier || '').toLowerCase()
  // Which project (if any) this donation was directed at — carried via the
  // client_reference_id URL param appended to the Stripe Payment Link by
  // CheckoutConfirm.tsx, not via metadata (Payment Link metadata is fixed
  // per-link in the Stripe dashboard and can't vary per project).
  const project = (session.client_reference_id || '').toLowerCase() || null
  const amountTotal = session.amount_total
  const currency = session.currency
  const stripeSessionId = session.id
  const subscriptionId = (session.subscription as string) || null
  const notionStatus = tier === 'onetime' ? 'One-Time' : 'Active'

  if (!email) {
    console.warn('[donation-handler] No email found on session:', session.id)
  }

  if (!tier || (tier !== 'onetime' && !isTierKey(tier))) {
    console.warn(`[donation-handler] Unknown or missing tier "${tier}" on session:`, session.id)
  }

  // 4. Send welcome email
  let emailStatus = 'Failed'
  const resend = new Resend(resendApiKey)

  if (email && tier === 'onetime') {
    try {
      await resend.emails.send({
        from: 'Empowr Heroes <hero@empowrcic.org>',
        to: email,
        subject: 'Thank You for Supporting Empowr',
        html: buildOneTimeEmailHtml({ name, siteUrl }),
        text: buildOneTimeEmailText({ name, siteUrl }),
      })
      emailStatus = 'Sent'
      console.log(`[donation-handler] One-time thank you email sent to ${email}`)
    } catch (err) {
      console.error('[donation-handler] Resend error:', (err as Error).message)
      emailStatus = 'Failed'
    }
  } else if (email && tier && isTierKey(tier)) {
    try {
      await resend.emails.send({
        from: 'Empowr Heroes <hero@empowrcic.org>',
        to: email,
        subject: "You're an Empowr Hero",
        html: buildEmailHtml({ name, tierData: tierEmailData(tier) }),
        text: buildEmailText({ name, tierData: tierEmailData(tier) }),
      })
      emailStatus = 'Sent'
      console.log(`[donation-handler] Welcome email sent to ${email}`)
    } catch (err) {
      console.error('[donation-handler] Resend error:', (err as Error).message)
      emailStatus = 'Failed'
    }
  } else if (email) {
    // Tier could not be resolved — almost always a Payment Link in the Stripe
    // dashboard that is missing its `tier` metadata. The donor has paid, so
    // they must still hear from us; fall back to the generic thank-you rather
    // than sending nothing. The team is alerted separately below.
    try {
      await resend.emails.send({
        from: 'Empowr Heroes <hero@empowrcic.org>',
        to: email,
        subject: 'Thank You for Supporting Empowr',
        html: buildOneTimeEmailHtml({ name, siteUrl }),
        text: buildOneTimeEmailText({ name, siteUrl }),
      })
      emailStatus = 'Sent'
      console.warn(`[donation-handler] Fallback thank-you sent to ${email} — unresolved tier "${tier}" on session ${stripeSessionId}`)
    } catch (err) {
      console.error('[donation-handler] Resend error:', (err as Error).message)
      emailStatus = 'Failed'
    }
  }

  // 4b. Send internal notification
  try {
    const amountFormatted = amountTotal ? (amountTotal / 100).toFixed(2) : '0.00'
    const currencyUpper = (currency || 'gbp').toUpperCase()
    let notificationSubject = ''
    let notificationTierLabel = ''
    let notificationPeriod = ''

    if (tier === 'onetime') {
      notificationSubject = `New One-Time Donation: ${name}`
      notificationTierLabel = 'One-Time Donation'
      notificationPeriod = '(one-time)'
    } else if (tier && isTierKey(tier)) {
      notificationSubject = `New Hero: ${name} — ${TIERS[tier].name}`
      notificationTierLabel = TIERS[tier].name
      notificationPeriod = '/ month'
    } else {
      // Unresolved tier. This previously left notificationSubject undefined,
      // so the donation was taken, the donor got nothing, and nobody was told.
      // Always alert — an unrecognised tier needs a human to fix the Payment
      // Link metadata in Stripe.
      notificationSubject = `ACTION NEEDED — donation with unrecognised tier: ${name}`
      notificationTierLabel = `Unrecognised tier "${tier || '(none)'}" — check Payment Link metadata in Stripe`
      notificationPeriod = '(unknown)'
    }

    if (notificationSubject) {
      await resend.emails.send({
        from: 'Empowr Heroes <hero@empowrcic.org>',
        to: 'hero@empowrcic.org',
        subject: notificationSubject,
        html: buildInternalNotificationHtml({ name, email, tierLabel: notificationTierLabel, amountFormatted, currency: currencyUpper, sessionId: stripeSessionId, period: notificationPeriod }),
        text: buildInternalNotificationText({ name, email, tierLabel: notificationTierLabel, amountFormatted, currency: currencyUpper, sessionId: stripeSessionId, period: notificationPeriod }),
      })
      console.log(`[donation-handler] Internal notification sent for ${name} (${tier})`)
    }
  } catch (err) {
    console.error('[donation-handler] Internal notification error:', (err as Error).message)
  }

  // 5. Log to Notion
  try {
    await logToNotionWithStatus({
      tier,
      project,
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
    console.error('[donation-handler] Notion error:', (err as Error).message)
    // Don't throw — email was already sent, logging failure should not break the response
  }

  return { success: true, email, tier, emailStatus }
}
