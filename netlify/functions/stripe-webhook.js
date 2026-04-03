/**
 * netlify/functions/stripe-webhook.js
 *
 * The serving hatch — thin Netlify adapter.
 * Receives the raw HTTP request from Stripe and passes it to the core handler.
 * No business logic lives here.
 *
 * Netlify Function endpoint: /.netlify/functions/stripe-webhook
 * Configure this URL as your Stripe webhook endpoint.
 */

const { handleDonation } = require('../../core/donation-handler')

exports.handler = async (event) => {
  // Only accept POST requests
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  try {
    const result = await handleDonation({
      rawBody: event.body,
      signature: event.headers['stripe-signature'],
      stripeSecretKey: process.env.STRIPE_SECRET_KEY,
      stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
      resendApiKey: process.env.RESEND_API_KEY,
      notionApiKey: process.env.NOTION_API_KEY,
      notionDatabaseId: process.env.NOTION_DATABASE_ID,
      siteUrl: process.env.SITE_URL || 'https://heroes.empowr-cic.org',
    })

    if (result.ignored) {
      console.log(`[stripe-webhook] Ignored event type: ${result.eventType}`)
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ received: true }),
    }
  } catch (err) {
    console.error('[stripe-webhook] Error:', err.message)
    return {
      statusCode: err.statusCode || 500,
      body: JSON.stringify({ error: err.message }),
    }
  }
}
