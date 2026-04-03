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

// ---------------------------------------------------------------------------
// Tier config
// ---------------------------------------------------------------------------

const TIER_CONFIG = {
  seed: {
    label: 'Seed Hero',
    emoji: '🌱',
    price: '£10/month',
    badge: 'seed-hero.svg',
    desc: 'Plant the seeds of change — your contribution helps keep our sessions affordable and accessible.',
  },
  momentum: {
    label: 'Momentum Hero',
    emoji: '🚀',
    price: '£25/month',
    badge: 'momentum-hero.svg',
    desc: 'Build momentum for growth — your support funds the infrastructure that enables sessions to happen consistently.',
  },
  community: {
    label: 'Community Hero',
    emoji: '🫂',
    price: '£50/month',
    badge: 'community-hero.svg',
    desc: 'Power community transformation — your support helps us expand our reach to new venues, schools, and communities.',
  },
  champion: {
    label: 'Champion Hero',
    emoji: '🏆',
    price: '£250/month',
    badge: 'champion-hero.svg',
    desc: 'Lead the movement — you\'re fuelling sustainable growth and long-term impact across the UK.',
  },
  legacy: {
    label: 'Legacy Hero',
    emoji: '💎',
    price: '£500/month',
    badge: 'legacy-hero.svg',
    desc: 'Power moves — your substantial commitment enables us to think and act more ambitiously.',
  },
}

// ---------------------------------------------------------------------------
// Email builder
// ---------------------------------------------------------------------------

function buildEmailHtml({ name, tier, siteUrl }) {
  const tierData = TIER_CONFIG[tier]
  const badgeUrl = `${siteUrl}/badges/${tierData.badge}`
  const firstName = name ? name.split(' ')[0] : 'Hero'

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>You're an Empowr Hero</title>
</head>
<body style="margin:0;padding:0;background-color:#f5f5f5;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f5;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background-color:#1a1a2e;padding:32px 40px;text-align:center;">
              <img src="${siteUrl}/badges/${tierData.badge}" alt="${tierData.label} Badge" width="100" style="display:block;margin:0 auto 16px;" />
              <h1 style="color:#ffffff;font-size:26px;margin:0;font-weight:800;">You're an Empowr Hero ${tierData.emoji}</h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <p style="font-size:16px;color:#333333;line-height:1.6;margin:0 0 16px;">
                Hi ${firstName},
              </p>
              <p style="font-size:16px;color:#333333;line-height:1.6;margin:0 0 16px;">
                Thank you so much for becoming an <strong>Empowr Hero</strong>. Your support means the world to us and to every young person whose life is shaped by the sessions you're helping to make possible.
              </p>
              <p style="font-size:16px;color:#333333;line-height:1.6;margin:0 0 24px;">
                You've joined as a <strong>${tierData.label}</strong> — ${tierData.desc}
              </p>

              <!-- Tier card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0f4ff;border-radius:8px;margin-bottom:24px;">
                <tr>
                  <td style="padding:24px;text-align:center;">
                    <p style="margin:0 0 4px;font-size:13px;color:#666666;text-transform:uppercase;letter-spacing:1px;">Your Hero Tier</p>
                    <p style="margin:0;font-size:22px;font-weight:800;color:#1a1a2e;">${tierData.emoji} ${tierData.label}</p>
                    <p style="margin:4px 0 0;font-size:15px;color:#555555;">${tierData.price}</p>
                  </td>
                </tr>
              </table>

              <!-- Badge notice -->
              <table width="100%" cellpadding="0" cellspacing="0" style="border:2px solid #e8e8e8;border-radius:8px;margin-bottom:24px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="margin:0;font-size:15px;color:#333333;line-height:1.6;">
                      <strong>Your Hero Badge</strong><br/>
                      Your ${tierData.label} badge is included above. You're welcome to use it to show your support for the Empowr Heroes Programme.
                    </p>
                  </td>
                </tr>
              </table>

              <p style="font-size:16px;color:#333333;line-height:1.6;margin:0 0 16px;">
                If you ever have questions or just want to say hello, you can reach us at <a href="mailto:hero@empowr-cic.org" style="color:#4f6ef7;">hero@empowr-cic.org</a>.
              </p>
              <p style="font-size:16px;color:#333333;line-height:1.6;margin:0;">
                With gratitude,<br/>
                <strong>The Empowr Team</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f9f9f9;padding:24px 40px;text-align:center;border-top:1px solid #eeeeee;">
              <p style="margin:0;font-size:12px;color:#999999;line-height:1.6;">
                Empowr CIC · Registered in England and Wales<br/>
                You're receiving this because you signed up as an Empowr Hero.<br/>
                <a href="https://legalhub.pecuvate.com/share/empowr/empowr-privacy-policy" style="color:#999999;">Privacy Policy</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

function buildEmailText({ name, tier }) {
  const tierData = TIER_CONFIG[tier]
  const firstName = name ? name.split(' ')[0] : 'Hero'

  return `Hi ${firstName},

Thank you for becoming an Empowr Hero!

You've joined as a ${tierData.label} (${tierData.price}).

${tierData.desc}

Your Hero badge has been included in the HTML version of this email.

If you have any questions, reach us at hero@empowr-cic.org.

With gratitude,
The Empowr Team

---
Empowr CIC · Registered in England and Wales
Privacy Policy: https://legalhub.pecuvate.com/share/empowr/empowr-privacy-policy`
}

// ---------------------------------------------------------------------------
// Notion logger
// ---------------------------------------------------------------------------

async function logToNotionWithStatus({ name, email, tier, amountTotal, currency, emailStatus, stripeSessionId, notionApiKey, notionDatabaseId }) {
  const notion = new Client({ auth: notionApiKey })
  const tierData = TIER_CONFIG[tier] || {}
  const amount = amountTotal ? (amountTotal / 100).toFixed(2) : '0.00'
  const currencyUpper = (currency || 'gbp').toUpperCase()

  await notion.pages.create({
    parent: { database_id: notionDatabaseId },
    properties: {
      Name: {
        title: [{ text: { content: name || 'Unknown' } }],
      },
      Email: {
        email: email || '',
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
      'Stripe Session ID': {
        rich_text: [{ text: { content: stripeSessionId || '' } }],
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
        html: buildEmailHtml({ name, tier, siteUrl }),
        text: buildEmailText({ name, tier }),
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
      name,
      email,
      tier,
      amountTotal,
      currency,
      emailStatus,
      stripeSessionId,
      notionApiKey,
      notionDatabaseId,
    })
    console.log(`[donation-handler] Logged to Notion for ${email}`)
  } catch (err) {
    console.error('[donation-handler] Notion error:', err.message)
    // Don't throw — email was already sent, logging failure should not break the response
  }

  return { success: true, email, tier, emailStatus }
}

module.exports = { handleDonation, TIER_CONFIG }
