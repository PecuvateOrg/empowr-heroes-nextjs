/**
 * netlify/functions/stripe-webhook.ts
 *
 * The serving hatch — thin Netlify adapter.
 * Receives the raw HTTP request from Stripe and passes it to the core handler.
 * No business logic lives here.
 *
 * Netlify Function endpoint: /.netlify/functions/stripe-webhook
 * Configure this URL as your Stripe webhook endpoint.
 */

import { handleDonation } from '../../core/donation-handler'

type NetlifyEvent = {
  httpMethod: string
  body: string | null
  headers: Record<string, string | undefined>
}

export const handler = async (event: NetlifyEvent) => {
  // Only accept POST requests
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  try {
    const result = await handleDonation({
      rawBody: event.body || '',
      signature: event.headers['stripe-signature'] || '',
      stripeSecretKey: process.env.STRIPE_SECRET_KEY || '',
      stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
      resendApiKey: process.env.RESEND_API_KEY || '',
      notionApiKey: process.env.NOTION_API_KEY || '',
      notionDatabaseId: process.env.NOTION_DATABASE_ID || '',
      siteUrl: process.env.SITE_URL || 'https://hero.empowrcic.org',
    })

    if ('ignored' in result && result.ignored) {
      console.log(`[stripe-webhook] Ignored event type: ${result.eventType}`)
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ received: true }),
    }
  } catch (err) {
    const error = err as Error & { statusCode?: number }
    console.error('[stripe-webhook] Error:', error.message)
    return {
      statusCode: error.statusCode || 500,
      body: JSON.stringify({ error: error.message }),
    }
  }
}
